/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import semver from 'semver';

/**
 * Engine + version detection that never infers the engine from a version number.
 *
 * Version numbers can't tell engines apart: with
 * `compatibility.override_main_response_version: true`, OpenSearch's `GET /`
 * reports `7.10.2` and drops `version.distribution` (V2438443386), and a future
 * OpenSearch 6.x/7.x would collide with Elasticsearch outright. So:
 *
 * 1. Primary: Nodes Info. Every OpenSearch 1.0+ node ships modules, and every
 *    module reports `opensearch_version`. Node `version` is the real version; the
 *    compat override only touches `GET /` (TransportMainAction). For OpenSearch,
 *    one request returns both engine and version. Its absence proves nothing
 *    (see isOpenSearchNodesInfo).
 * 2. Fallback (Nodes Info denied, unavailable, or no `opensearch_version`, which
 *    includes every Elasticsearch cluster): `GET /`. Engine from `distribution`
 *    or the tagline, which compat mode leaves alone (same rule as OSD core's
 *    backend_compatibility plugin, backend_detector.ts). OpenSearch omits
 *    `distribution` only in compat mode, so a tagline-only OpenSearch response
 *    means the version number is spoofed and the real version is unknown.
 */

export interface MainResponse {
  version?: {
    number?: string;
    distribution?: string;
  };
  tagline?: string;
}

interface ModuleInfo {
  opensearch_version?: string;
}

export interface NodesInfoResponse {
  nodes?: Record<string, { version?: string; modules?: ModuleInfo[] } | undefined>;
}

export interface ResolvedClusterEngine {
  /** Empty when unknown; capability resolution then uses its defaults. */
  version: string;
  /** `undefined` = couldn't tell; callers fall back to a version heuristic. */
  isOpenSearch?: boolean;
  /** True when the answer is incomplete and should not be cached. */
  provisional: boolean;
}

/**
 * Nodes Info request shape: the `plugins` metric (which includes modules) keeps the
 * server from building jvm/os/settings sections, and the filter trims each module
 * to its `opensearch_version` key.
 *   GET /_nodes/_all/plugins?filter_path=nodes.*.version,nodes.*.modules.opensearch_version
 */
export const NODES_INFO_NODE_ID = '_all';
export const NODES_INFO_METRIC = 'plugins';
export const NODES_ENGINE_FILTER_PATH = ['nodes.*.version', 'nodes.*.modules.opensearch_version'];

export function isOpenSearchMainResponse(info: MainResponse | undefined): boolean | undefined {
  if (!info?.version) {
    return undefined;
  }
  return (
    info.version.distribution?.toLowerCase() === 'opensearch' ||
    !!info.tagline?.toLowerCase().includes('opensearch')
  );
}

/** Lowest node version, so features stay off until every node supports them. */
export function minNodeVersion(nodesInfo: NodesInfoResponse | undefined): string | undefined {
  const versions = Object.values(nodesInfo?.nodes ?? {})
    .map((node) => (node?.version ? semver.coerce(node.version) : null))
    .filter((v): v is semver.SemVer => v !== null);
  if (versions.length === 0) {
    return undefined;
  }
  return versions.sort(semver.compare)[0].version;
}

/**
 * Engine from module metadata: `true` if any module reports `opensearch_version`,
 * otherwise `undefined`. A missing key is never read as Elasticsearch: it looks
 * identical to an OpenSearch response that lost its modules (filter mismatch,
 * proxy, field rename), and a wrong `false` would pin the legacy path for the
 * process lifetime. Elasticsearch costs one extra `GET /`, decided by the tagline.
 */
export function isOpenSearchNodesInfo(
  nodesInfo: NodesInfoResponse | undefined
): boolean | undefined {
  const nodes = Object.values(nodesInfo?.nodes ?? {});
  return nodes.some((node) => node?.modules?.some((m) => m?.opensearch_version !== undefined))
    ? true
    : undefined;
}

/**
 * Resolves engine + real version: Nodes Info first, `GET /` only if that fails or
 * is inconclusive. Errors from `fetchMainResponse` propagate to the caller.
 */
export async function resolveClusterEngine(
  fetchNodesInfo: () => Promise<NodesInfoResponse>,
  fetchMainResponse: () => Promise<MainResponse | undefined>,
  onNodesInfoError?: (err: unknown) => void
): Promise<ResolvedClusterEngine> {
  try {
    const nodesInfo = await fetchNodesInfo();
    const isOpenSearch = isOpenSearchNodesInfo(nodesInfo);
    const version = minNodeVersion(nodesInfo);
    if (isOpenSearch !== undefined && version) {
      return { version, isOpenSearch, provisional: false };
    }
    onNodesInfoError?.(new Error('nodes info had no engine or version markers'));
  } catch (err) {
    onNodesInfoError?.(err);
  }

  const info = await fetchMainResponse();
  const reported = info?.version?.number ?? '';
  const isOpenSearch = isOpenSearchMainResponse(info);
  if (isOpenSearch === undefined) {
    return { version: reported, isOpenSearch: undefined, provisional: true };
  }
  // Elasticsearch's main response is never spoofed.
  if (!isOpenSearch) {
    return { version: reported, isOpenSearch: false, provisional: false };
  }
  if (info?.version?.distribution) {
    return { version: reported, isOpenSearch: true, provisional: false };
  }
  // OpenSearch in compat mode: engine known, version number is a lie.
  return { version: '', isOpenSearch: true, provisional: true };
}
