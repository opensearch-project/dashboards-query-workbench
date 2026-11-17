/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDeploymentCapabilities } from '../../../common/utils/deployment_capabilities';
import { ClusterInfoService } from '../ClusterInfoService';

const COMPAT_MODE_INFO = {
  version: { number: '7.10.2' },
  tagline: 'The OpenSearch Project: https://opensearch.org/',
};
const ES_INFO = { version: { number: '7.10.2' }, tagline: 'You Know, for Search' };
const OS_NODES_35 = {
  nodes: {
    a: { version: '3.5.0', modules: [{ opensearch_version: '3.5.0' }] },
    b: { version: '3.5.0', modules: [{ opensearch_version: '3.5.0' }] },
  },
};
const ES_NODES = {
  nodes: { a: { version: '7.10.2' } },
};

const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;

function legacyClient(responses: Record<string, (() => Promise<any>) | undefined>) {
  return {
    callAsInternalUser: jest.fn((endpoint: string) => {
      const respond = responses[endpoint];
      return respond ? respond() : Promise.reject(new Error(`unexpected ${endpoint}`));
    }),
  } as any;
}

describe('ClusterInfoService (local cluster)', () => {
  it('detects compat-mode OpenSearch 3.5 and its real version in one call (V2438443386)', async () => {
    const client = legacyClient({ 'nodes.info': () => Promise.resolve(OS_NODES_35) });
    const info = await new ClusterInfoService(client, logger).getVersion();
    expect(info).toEqual({ version: '3.5.0', isOpenSearch: true });
    expect(client.callAsInternalUser).toHaveBeenCalledTimes(1);
    expect(client.callAsInternalUser).toHaveBeenCalledWith('nodes.info', {
      nodeId: '_all',
      metric: 'plugins',
      filterPath: ['nodes.*.version', 'nodes.*.modules.opensearch_version'],
    });

    // End to end: must not route to the removed /_opendistro/_sql endpoint.
    expect(getDeploymentCapabilities(info.version, info.isOpenSearch).usesLegacyOpenDistroSql).toBe(
      false
    );
  });

  it('keeps real Elasticsearch 7.10.2 on the legacy OpenDistro path', async () => {
    const client = legacyClient({
      'nodes.info': () => Promise.resolve(ES_NODES),
      info: () => Promise.resolve(ES_INFO),
    });
    const info = await new ClusterInfoService(client, logger).getVersion();
    expect(info).toEqual({ version: '7.10.2', isOpenSearch: false });
    expect(getDeploymentCapabilities(info.version, info.isOpenSearch).usesLegacyOpenDistroSql).toBe(
      true
    );
  });

  it('falls back to the tagline when nodes info fails', async () => {
    const client = legacyClient({ info: () => Promise.resolve(ES_INFO) });
    const info = await new ClusterInfoService(client, logger).getVersion();
    expect(info).toEqual({ version: '7.10.2', isOpenSearch: false });
  });

  it('caches a definitive result', async () => {
    const client = legacyClient({ 'nodes.info': () => Promise.resolve(OS_NODES_35) });
    const service = new ClusterInfoService(client, logger);
    await service.getVersion();
    await service.getVersion();
    expect(client.callAsInternalUser).toHaveBeenCalledTimes(1);
  });

  it('serves a provisional answer but re-probes next time when nodes info fails in compat mode', async () => {
    let nodesOk = false;
    const client = legacyClient({
      info: () => Promise.resolve(COMPAT_MODE_INFO),
      'nodes.info': () =>
        nodesOk ? Promise.resolve(OS_NODES_35) : Promise.reject(new Error('boom')),
    });
    const service = new ClusterInfoService(client, logger);

    await expect(service.getVersion()).resolves.toEqual({ version: '', isOpenSearch: true });
    nodesOk = true;
    await expect(service.getVersion()).resolves.toEqual({ version: '3.5.0', isOpenSearch: true });
  });

  it('retries after a total probe failure', async () => {
    const client = legacyClient({});
    const service = new ClusterInfoService(client, logger);
    await expect(service.getVersion()).resolves.toEqual({ version: '', isOpenSearch: undefined });
    await service.getVersion();
    expect(client.callAsInternalUser).toHaveBeenCalledTimes(4); // 2x (nodes.info + info)
  });
});

describe('ClusterInfoService (data source)', () => {
  function context(savedAttrs: any, modern: { info?: any; nodes?: any }) {
    const client = {
      info: modern.info
        ? jest.fn().mockResolvedValue({ body: modern.info })
        : jest.fn().mockRejectedValue(new Error('no info')),
      nodes: {
        info: modern.nodes
          ? jest.fn().mockResolvedValue({ body: modern.nodes })
          : jest.fn().mockRejectedValue(new Error('no nodes info')),
      },
    };
    return {
      client,
      ctx: {
        core: {
          savedObjects: {
            client: { get: jest.fn().mockResolvedValue({ attributes: savedAttrs }) },
          },
        },
        dataSource: { opensearch: { getClient: jest.fn().mockResolvedValue(client) } },
      } as any,
    };
  }

  it('trusts a saved OpenSearch engine type without a live probe', async () => {
    const { ctx, client } = context(
      { dataSourceVersion: '2.13.0', dataSourceEngineType: 'OpenSearch' },
      { nodes: OS_NODES_35 }
    );
    const info = await new ClusterInfoService({} as any, logger).getDataSourceInfo('ds1', ctx);
    expect(info).toEqual({ version: '2.13.0', isOpenSearch: true });
    expect(client.nodes.info).not.toHaveBeenCalled();
  });

  // OSD's MDS validator only checks `distribution`, so a compat-mode OpenSearch
  // data source is saved as Elasticsearch 7.10.2. Re-check it live.
  it('re-checks a saved Elasticsearch engine type live and corrects compat-mode OpenSearch', async () => {
    const { ctx, client } = context(
      { dataSourceVersion: '7.10.2', dataSourceEngineType: 'Elasticsearch' },
      { nodes: OS_NODES_35 }
    );
    const info = await new ClusterInfoService({} as any, logger).getDataSourceInfo('ds1', ctx);
    expect(info).toEqual({ version: '3.5.0', isOpenSearch: true });
    expect(client.nodes.info).toHaveBeenCalledWith({
      node_id: '_all',
      metric: 'plugins',
      filter_path: ['nodes.*.version', 'nodes.*.modules.opensearch_version'],
    });
    expect(client.info).not.toHaveBeenCalled();
  });

  it('keeps a real Elasticsearch data source as Elasticsearch', async () => {
    const { ctx } = context(
      { dataSourceVersion: '7.10.2', dataSourceEngineType: 'Elasticsearch' },
      { nodes: ES_NODES, info: ES_INFO }
    );
    const info = await new ClusterInfoService({} as any, logger).getDataSourceInfo('ds1', ctx);
    expect(info).toEqual({ version: '7.10.2', isOpenSearch: false });
  });

  // A restricted data-source user may lack cluster:monitor/nodes/info.
  it('uses the tagline when the data-source user cannot read nodes info', async () => {
    const { ctx } = context(
      { dataSourceVersion: '7.10.2', dataSourceEngineType: 'Elasticsearch' },
      { info: COMPAT_MODE_INFO }
    );
    const info = await new ClusterInfoService({} as any, logger).getDataSourceInfo('ds1', ctx);
    expect(info).toEqual({ version: '', isOpenSearch: true });
  });

  it('falls back to the saved values when the live re-check fails', async () => {
    const { ctx } = context(
      { dataSourceVersion: '7.10.2', dataSourceEngineType: 'Elasticsearch' },
      {}
    );
    const info = await new ClusterInfoService({} as any, logger).getDataSourceInfo('ds1', ctx);
    expect(info).toEqual({ version: '7.10.2', isOpenSearch: false });
  });
});
