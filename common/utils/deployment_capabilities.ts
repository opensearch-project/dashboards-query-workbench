/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import semver from 'semver';

export type GateState = 'S-min' | 'S-async' | 'S-flint-none' | 'S-full';

export interface DeploymentCapabilities {
  version: string;
  state: GateState;
  hasDataSources: boolean;
  hasAsyncQuery: boolean;
  hasSessionId: boolean;
  hasFlintDDL: boolean;
  hasCatalogCache: boolean;
  hasAccelerationFlyout: boolean;
  // Legacy OpenSearch DSL JSON response format (`?format=json` on /_plugins/_sql).
  // Removed in SQL 3.0 via opensearch-project/sql#3367, still present on 1.3.2 and 2.x.
  // Opposite polarity from the other fields: true = "legacy feature still works".
  hasDslJsonFormat: boolean;
  // Legacy OpenDistro SQL stack (Elasticsearch 6.x/7.x). Governs two things the
  // OpenSearch (2.x/3.x) V2 SQL engine does differently:
  //   1. Endpoint: OpenDistro serves `_opendistro/_sql`; OpenSearch serves
  //      `_plugins/_sql` (which does not exist on ES and hard-errors there).
  //   2. `SHOW TABLES LIKE` takes an *unquoted* index-name pattern; the quoted
  //      `'%'` used on V2 matches no index, so the left-panel index tree fails.
  // Verified against ES 6.8-7.10 backends; only ES/OpenDistro reports major 6/7,
  // so this cleanly excludes OpenSearch (major 1/2/3).
  // Opposite polarity from most fields: true = "must use the legacy OpenDistro API".
  usesLegacyOpenDistroSql: boolean;
  // PPL (Piped Processing Language) availability. Introduced in OpenDistro 1.11 =
  // Elasticsearch 7.9.1, so it is absent on ES 6.x and 7.0-7.8 (the `_ppl` endpoint
  // isn't registered there). All OpenSearch (major 1/2/3) has PPL. Verified against
  // ES 6.8-7.10 backends. Used to hide the PPL language toggle where it doesn't exist.
  hasPpl: boolean;
}

/**
 * Capabilities used when the connected cluster's version is unknown — first
 * render before the resolver completes, probe failure, etc. Equivalent to
 * `S-full` *except* `hasDslJsonFormat` is `false` so an unknown cluster is
 * assumed to be 3.x-like (the legacy DSL JSON format was removed in 3.0).
 */
export const DEFAULT_CAPABILITIES: DeploymentCapabilities = {
  version: '',
  state: 'S-full',
  hasDataSources: true,
  hasAsyncQuery: true,
  hasSessionId: true,
  hasFlintDDL: true,
  hasCatalogCache: true,
  hasAccelerationFlyout: true,
  hasDslJsonFormat: false,
  usesLegacyOpenDistroSql: false,
  hasPpl: true,
};

export function getDeploymentCapabilities(
  version: string | undefined,
  isOpenSearchDistribution?: boolean
): DeploymentCapabilities {
  const coerced = version ? semver.coerce(version) : null;
  if (!coerced) {
    return DEFAULT_CAPABILITIES;
  }

  const v = coerced.version;
  // Engine detection drives everything else. Prefer the authoritative signal supplied
  // by the caller — OpenSearch's `info.version.distribution === 'opensearch'`, or the
  // data source's `dataSourceEngineType` — which stays correct even when OpenSearch
  // itself reaches major 6/7. Fall back to the version-major heuristic (ES/OpenDistro
  // report major 6/7; OpenSearch is 1/2/3) only when no explicit signal is available.
  const isOpenSearch =
    isOpenSearchDistribution ?? (coerced.major !== 6 && coerced.major !== 7);
  const usesLegacyOpenDistroSql = !isOpenSearch;
  // Modern OpenSearch features: gated on engine AND their OpenSearch version thresholds.
  const hasAsyncQuery = isOpenSearch && semver.gte(v, '2.11.0');
  const hasSessionId = isOpenSearch && semver.gte(v, '2.12.0');
  const hasFlintDDL = isOpenSearch && semver.gte(v, '2.13.0');
  const hasDataSources = hasAsyncQuery;
  const hasCatalogCache = isOpenSearch && semver.gte(v, '2.13.0');
  const hasAccelerationFlyout = isOpenSearch && semver.gte(v, '2.13.0');
  // Legacy DSL JSON format: works on 1.3.2 and all 2.x; removed on 3.0+.
  const hasDslJsonFormat = semver.lt(v, '3.0.0');
  // PPL: every OpenSearch has it; on Elasticsearch it exists only from 7.9 (ODFE 1.11).
  const hasPpl = isOpenSearch || semver.gte(v, '7.9.0');

  const state: GateState = !hasAsyncQuery
    ? 'S-min'
    : !hasSessionId
    ? 'S-async'
    : !hasFlintDDL
    ? 'S-flint-none'
    : 'S-full';

  return {
    version: v,
    state,
    hasDataSources,
    hasAsyncQuery,
    hasSessionId,
    hasFlintDDL,
    hasCatalogCache,
    hasAccelerationFlyout,
    hasDslJsonFormat,
    usesLegacyOpenDistroSql,
    hasPpl,
  };
}
