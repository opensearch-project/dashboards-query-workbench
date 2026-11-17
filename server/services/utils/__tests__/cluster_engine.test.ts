/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDeploymentCapabilities } from '../../../../common/utils/deployment_capabilities';
import {
  isOpenSearchMainResponse,
  isOpenSearchNodesInfo,
  minNodeVersion,
  resolveClusterEngine,
} from '../cluster_engine';

// Real `GET /` from an OpenSearch 3.5 domain with
// `compatibility.override_main_response_version: true` (V2438443386).
const OS_35_COMPAT_MODE = {
  name: '1cb099f2fceffea9c38d2ae52bd0efe5',
  cluster_name: '905418019649:threethreethree',
  cluster_uuid: 'FdeJ1cxTT_aTNVtsy88BWA',
  version: {
    number: '7.10.2',
    build_type: 'tar',
    build_hash: 'unknown',
    build_date: '2026-10-28T06:40:44.805937437Z',
    build_snapshot: false,
    lucene_version: '10.4.0',
    minimum_wire_compatibility_version: '2.19.0',
    minimum_index_compatibility_version: '2.0.0',
  },
  tagline: 'The OpenSearch Project: https://opensearch.org/',
};

const OS_35 = {
  ...OS_35_COMPAT_MODE,
  version: { ...OS_35_COMPAT_MODE.version, number: '3.5.0', distribution: 'opensearch' },
};

const ES_7102 = {
  name: 'node',
  cluster_name: '123456789012:es7',
  cluster_uuid: 'x',
  version: {
    number: '7.10.2',
    build_flavor: 'oss',
    build_type: 'tar',
    lucene_version: '8.7.0',
    minimum_wire_compatibility_version: '6.8.0',
    minimum_index_compatibility_version: '6.0.0-beta1',
  },
  tagline: 'You Know, for Search',
};

// Shape of `GET /_nodes/_all/plugins?filter_path=nodes.*.version,
// nodes.*.modules.opensearch_version`.
const osNodes = (...versions: string[]) => ({
  nodes: Object.fromEntries(
    versions.map((v, i) => [
      `node${i}`,
      { version: v, modules: [{ opensearch_version: v }, { opensearch_version: v }] },
    ])
  ),
});
// Elasticsearch modules carry no `opensearch_version`, so the filter drops them.
// Also the shape of an OpenSearch response whose modules were stripped.
const esNodes = (...versions: string[]) => ({
  nodes: Object.fromEntries(versions.map((v, i) => [`node${i}`, { version: v }])),
});

const failing = () => Promise.reject(new Error('403 cluster:monitor/nodes/info'));

describe('isOpenSearchNodesInfo', () => {
  it('detects OpenSearch by the modules opensearch_version key', () => {
    expect(isOpenSearchNodesInfo(osNodes('3.7.0'))).toBe(true);
  });

  // A missing key can't tell Elasticsearch apart from a response that lost its
  // modules (filter mismatch, proxy, field rename), so it never decides the engine.
  it('is inconclusive for versioned nodes without opensearch_version', () => {
    expect(isOpenSearchNodesInfo(esNodes('7.10.2'))).toBeUndefined();
  });

  it('is inconclusive for an empty response', () => {
    expect(isOpenSearchNodesInfo(undefined)).toBeUndefined();
    expect(isOpenSearchNodesInfo({ nodes: {} })).toBeUndefined();
  });
});

describe('isOpenSearchMainResponse', () => {
  it('detects OpenSearch by version.distribution', () => {
    expect(isOpenSearchMainResponse(OS_35)).toBe(true);
  });

  // Compat mode drops `distribution` but leaves the tagline alone.
  it('detects OpenSearch in compatibility mode by tagline', () => {
    expect(isOpenSearchMainResponse(OS_35_COMPAT_MODE)).toBe(true);
  });

  it('treats real Elasticsearch as not OpenSearch', () => {
    expect(isOpenSearchMainResponse(ES_7102)).toBe(false);
  });

  it('returns undefined when there is no response to judge', () => {
    expect(isOpenSearchMainResponse(undefined)).toBeUndefined();
    expect(isOpenSearchMainResponse({} as any)).toBeUndefined();
  });
});

describe('minNodeVersion', () => {
  it('returns the single version of a uniform cluster', () => {
    expect(minNodeVersion(osNodes('3.7.0', '3.7.0', '3.7.0'))).toBe('3.7.0');
  });

  it('returns the lowest version of a mixed (mid blue/green) cluster', () => {
    expect(minNodeVersion(osNodes('3.7.0', '3.5.0', '3.7.0'))).toBe('3.5.0');
  });

  it('returns undefined for an empty or malformed response', () => {
    expect(minNodeVersion(undefined)).toBeUndefined();
    expect(minNodeVersion({ nodes: {} })).toBeUndefined();
    expect(minNodeVersion({ nodes: { a: { version: 'garbage' } } } as any)).toBeUndefined();
  });
});

describe('resolveClusterEngine via nodes info', () => {
  it('resolves compat-mode OpenSearch without calling GET /', async () => {
    const fetchMain = jest.fn();
    await expect(
      resolveClusterEngine(() => Promise.resolve(osNodes('3.5.0')), fetchMain)
    ).resolves.toEqual({
      version: '3.5.0',
      isOpenSearch: true,
      provisional: false,
    });
    expect(fetchMain).not.toHaveBeenCalled();
  });

  it('resolves real Elasticsearch 7.10.2 via the GET / tagline', async () => {
    const fetchMain = jest.fn().mockResolvedValue(ES_7102);
    await expect(
      resolveClusterEngine(() => Promise.resolve(esNodes('7.10.2')), fetchMain)
    ).resolves.toEqual({ version: '7.10.2', isOpenSearch: false, provisional: false });
    expect(fetchMain).toHaveBeenCalled();
  });

  // The CR-review scenario: modules stripped from an OpenSearch response must not
  // be read as Elasticsearch.
  it('resolves OpenSearch whose modules were stripped via the GET / tagline', async () => {
    await expect(
      resolveClusterEngine(
        () => Promise.resolve(esNodes('3.5.0')),
        () => Promise.resolve(OS_35)
      )
    ).resolves.toEqual({ version: '3.5.0', isOpenSearch: true, provisional: false });
  });

  // Engine never comes from the version number, so future majors can't land in
  // the Elasticsearch gates -- including an OpenSearch that reaches 6.x/7.x.
  it.each(['4.0.0', '6.0.0', '7.10.2', '8.1.0'])(
    'keeps OpenSearch %s on the modern path',
    async (v) => {
      const resolved = await resolveClusterEngine(() => Promise.resolve(osNodes(v)), jest.fn());
      expect(resolved).toEqual({ version: v, isOpenSearch: true, provisional: false });
      const caps = getDeploymentCapabilities(resolved.version, resolved.isOpenSearch);
      expect(caps.usesLegacyOpenDistroSql).toBe(false);
      expect(caps.hasAsyncQuery).toBe(true);
    }
  );
});

describe('resolveClusterEngine fallback to GET /', () => {
  it('uses an honest OpenSearch main response', async () => {
    await expect(resolveClusterEngine(failing, () => Promise.resolve(OS_35))).resolves.toEqual({
      version: '3.5.0',
      isOpenSearch: true,
      provisional: false,
    });
  });

  it('uses an Elasticsearch main response', async () => {
    await expect(resolveClusterEngine(failing, () => Promise.resolve(ES_7102))).resolves.toEqual({
      version: '7.10.2',
      isOpenSearch: false,
      provisional: false,
    });
  });

  it('falls back when nodes info is empty', async () => {
    const fetchMain = jest.fn().mockResolvedValue(OS_35);
    await expect(
      resolveClusterEngine(() => Promise.resolve({ nodes: {} }), fetchMain)
    ).resolves.toMatchObject({ version: '3.5.0', isOpenSearch: true });
    expect(fetchMain).toHaveBeenCalled();
  });

  // Tagline says OpenSearch but `distribution` is missing: compat mode, and the
  // reported number is spoofed, so report the engine with an unknown version.
  it('reports compat-mode OpenSearch with an unknown, provisional version', async () => {
    const resolved = await resolveClusterEngine(failing, () => Promise.resolve(OS_35_COMPAT_MODE));
    expect(resolved).toEqual({ version: '', isOpenSearch: true, provisional: true });
    expect(
      getDeploymentCapabilities(resolved.version, resolved.isOpenSearch).usesLegacyOpenDistroSql
    ).toBe(false);
  });

  it('reports an unknown engine when the main response is empty', async () => {
    await expect(resolveClusterEngine(failing, () => Promise.resolve(undefined))).resolves.toEqual({
      version: '',
      isOpenSearch: undefined,
      provisional: true,
    });
  });

  it('propagates a GET / failure', async () => {
    await expect(
      resolveClusterEngine(failing, () => Promise.reject(new Error('down')))
    ).rejects.toThrow('down');
  });
});
