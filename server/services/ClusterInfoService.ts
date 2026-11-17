/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ILegacyClusterClient, Logger, RequestHandlerContext } from '../../../../src/core/server';
import {
  NODES_ENGINE_FILTER_PATH,
  NODES_INFO_METRIC,
  NODES_INFO_NODE_ID,
  ResolvedClusterEngine,
  resolveClusterEngine,
} from './utils/cluster_engine';

/**
 * Version + engine of a connected cluster. `isOpenSearch` distinguishes OpenSearch
 * from Elasticsearch/OpenDistro authoritatively (not by version number, which is
 * unsafe once OpenSearch reaches major 6/7). `undefined` means it couldn't be
 * determined, and callers should fall back to a version heuristic.
 */
export interface ClusterEngineInfo {
  version: string;
  isOpenSearch?: boolean;
}

const toEngineInfo = ({ version, isOpenSearch }: ResolvedClusterEngine): ClusterEngineInfo => ({
  version,
  isOpenSearch,
});

/**
 * Resolves and caches the connected cluster's version and engine.
 *
 * The local probe uses OSD's internal (admin) credentials so it doesn't depend on
 * the current user having `cluster:monitor/main` or `cluster:monitor/nodes/info`.
 * Detection (see utils/cluster_engine.ts) tolerates OpenSearch's compatibility
 * mode, which makes `GET /` claim to be Elasticsearch 7.10.2. The result is used
 * purely to shape which workbench features are enabled for the deployment.
 *
 * Caching: definitive answers are cached for the process lifetime. Failures and
 * provisional answers (compat mode with Nodes Info unavailable) are served once
 * and then evicted, so the next caller re-probes.
 */
export class ClusterInfoService {
  private infoPromise: Promise<ClusterEngineInfo> | null = null;
  // Per-data-source (MDS) cache, keyed by data-source id. Failed or provisional
  // lookups are evicted so the next caller retries.
  private dataSourceInfoCache = new Map<string, Promise<ClusterEngineInfo>>();

  constructor(
    private readonly client: ILegacyClusterClient,
    private readonly logger: Logger
  ) {}

  /**
   * Returns the cached local cluster info. First call triggers the probe; subsequent
   * calls share the in-flight or resolved promise.
   */
  getVersion(): Promise<ClusterEngineInfo> {
    if (!this.infoPromise) {
      const pending: Promise<ClusterEngineInfo> = this.probe()
        .then((resolved) => {
          if (resolved.provisional && this.infoPromise === pending) {
            this.infoPromise = null;
          }
          return toEngineInfo(resolved);
        })
        .catch((err) => {
          this.logger.warn(`ClusterInfoService: probe failed, will retry on next request: ${err}`);
          if (this.infoPromise === pending) {
            this.infoPromise = null;
          }
          return { version: '', isOpenSearch: undefined };
        });
      this.infoPromise = pending;
    }
    return this.infoPromise;
  }

  private async probe(): Promise<ResolvedClusterEngine> {
    const resolved = await resolveClusterEngine(
      () =>
        this.client.callAsInternalUser('nodes.info', {
          nodeId: NODES_INFO_NODE_ID,
          metric: NODES_INFO_METRIC,
          filterPath: NODES_ENGINE_FILTER_PATH,
        }),
      () => this.client.callAsInternalUser('info'),
      (err) =>
        this.logger.warn(`ClusterInfoService: nodes info failed, falling back to info: ${err}`)
    );
    this.logger.debug(
      `ClusterInfoService: resolved version "${resolved.version}" isOpenSearch=${resolved.isOpenSearch} provisional=${resolved.provisional}`
    );
    return resolved;
  }

  /**
   * Returns the version + engine of a remote cluster reached via a data-source
   * connection (MDS). Cached per data-source id.
   */
  getDataSourceInfo(
    dataSourceMDSId: string,
    context: RequestHandlerContext
  ): Promise<ClusterEngineInfo> {
    let cached = this.dataSourceInfoCache.get(dataSourceMDSId);
    if (!cached) {
      const pending: Promise<ClusterEngineInfo> = this.probeDataSource(dataSourceMDSId, context)
        .then((resolved) => {
          if (resolved.provisional && this.dataSourceInfoCache.get(dataSourceMDSId) === pending) {
            this.dataSourceInfoCache.delete(dataSourceMDSId);
          }
          return toEngineInfo(resolved);
        })
        .catch((err) => {
          this.logger.warn(
            `ClusterInfoService: data source ${dataSourceMDSId} lookup failed, will retry: ${err}`
          );
          if (this.dataSourceInfoCache.get(dataSourceMDSId) === pending) {
            this.dataSourceInfoCache.delete(dataSourceMDSId);
          }
          return { version: '', isOpenSearch: undefined };
        });
      cached = pending;
      this.dataSourceInfoCache.set(dataSourceMDSId, cached);
    }
    return cached;
  }

  private async probeDataSource(
    dataSourceMDSId: string,
    context: RequestHandlerContext
  ): Promise<ResolvedClusterEngine> {
    // 1. Saved object: recorded version + engine type. `dataSourceEngineType` is
    //    'Elasticsearch' | 'OpenSearch' | 'OpenSearch Serverless' | ...
    //    An OpenSearch-family type is trustworthy: OSD only records it when
    //    `distribution` was present, i.e. compat mode was off. 'Elasticsearch' is
    //    NOT: OSD's MDS validator records it for any response without
    //    `distribution`, including compat-mode OpenSearch. Re-check those live.
    let saved: { version: string; engineType?: string } | undefined;
    try {
      const ds = await context.core.savedObjects.client.get('data-source', dataSourceMDSId);
      const attrs = ds?.attributes as {
        dataSourceVersion?: string;
        dataSourceEngineType?: string;
      };
      if (attrs?.dataSourceVersion) {
        saved = { version: attrs.dataSourceVersion, engineType: attrs.dataSourceEngineType };
      }
    } catch (err) {
      this.logger.warn(
        `ClusterInfoService: data source ${dataSourceMDSId} saved-object read failed: ${err}`
      );
    }
    if (saved?.engineType && saved.engineType !== 'Elasticsearch') {
      this.logger.info(
        `ClusterInfoService: data source ${dataSourceMDSId} saved version "${saved.version}" engine "${saved.engineType}"`
      );
      return { version: saved.version, isOpenSearch: true, provisional: false };
    }

    // 2. Live probe via the MODERN (non-legacy) data-source client, which exposes
    //    the base `info` / `nodes.info` APIs. The legacy client only carries this
    //    plugin's custom `sql.*` actions (registerCustomApiSchema), so it cannot.
    //    NB: opensearch.getClient is async (Promise<OpenSearchClient>), unlike the
    //    synchronous opensearch.legacy.getClient.
    try {
      const client = await context.dataSource.opensearch.getClient(dataSourceMDSId);
      const resolved = await resolveClusterEngine(
        async () =>
          (
            await client.nodes.info({
              node_id: NODES_INFO_NODE_ID,
              metric: NODES_INFO_METRIC,
              filter_path: NODES_ENGINE_FILTER_PATH,
            })
          ).body,
        async () => (await client.info()).body,
        (err) =>
          this.logger.warn(
            `ClusterInfoService: data source ${dataSourceMDSId} nodes info failed, falling back to info: ${err}`
          )
      );
      this.logger.info(
        `ClusterInfoService: probed data source ${dataSourceMDSId} version "${resolved.version}" isOpenSearch=${resolved.isOpenSearch}`
      );
      // An unknown version is fine if the engine is known (compat mode without
      // Nodes Info); only a fully blank answer falls back to the saved object.
      if (!resolved.version && resolved.isOpenSearch === undefined) {
        throw new Error('empty version from data source info probe');
      }
      return resolved;
    } catch (err) {
      if (!saved) {
        throw err;
      }
      this.logger.warn(
        `ClusterInfoService: data source ${dataSourceMDSId} live probe failed, using saved values: ${err}`
      );
      const isOpenSearch = saved.engineType ? saved.engineType !== 'Elasticsearch' : undefined;
      return { version: saved.version, isOpenSearch, provisional: true };
    }
  }
}
