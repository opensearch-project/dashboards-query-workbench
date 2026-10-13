/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEFAULT_CAPABILITIES, getDeploymentCapabilities } from '../deployment_capabilities';

describe('getDeploymentCapabilities - usesLegacyOpenDistroSql', () => {
  // Elasticsearch / OpenDistro (major 6-7) use the legacy SQL stack: the
  // `_opendistro/_sql` endpoint and an unquoted `SHOW TABLES LIKE %` pattern.
  // Verified against ES 6.8-7.10 backends.
  it.each(['6.8.0', '7.1.1', '7.4.2', '7.7.0', '7.8.0', '7.9.1', '7.10.2'])(
    'flags ES/OpenDistro %s as legacy OpenDistro SQL',
    (version) => {
      expect(getDeploymentCapabilities(version).usesLegacyOpenDistroSql).toBe(true);
    }
  );

  // OpenSearch (major 1/2/3) uses the V2 SQL engine (`_plugins/_sql` + quoted `'%'`).
  it.each(['1.0.0', '1.3.2', '2.11.0', '2.13.0', '3.0.0', '3.5.0'])(
    'flags OpenSearch %s as modern (not legacy)',
    (version) => {
      expect(getDeploymentCapabilities(version).usesLegacyOpenDistroSql).toBe(false);
    }
  );

  it('defaults to modern (not legacy) when the version is unknown', () => {
    expect(getDeploymentCapabilities(undefined).usesLegacyOpenDistroSql).toBe(false);
    expect(DEFAULT_CAPABILITIES.usesLegacyOpenDistroSql).toBe(false);
  });
});

describe('getDeploymentCapabilities - hasPpl', () => {
  // PPL was introduced in OpenDistro 1.11 = Elasticsearch 7.9.1, so it is absent
  // on ES 6.x and 7.0-7.8. Verified against the ES staging backends.
  it.each(['6.8.0', '7.1.1', '7.4.2', '7.7.0', '7.8.0'])(
    'reports no PPL on Elasticsearch %s (< 7.9)',
    (version) => {
      expect(getDeploymentCapabilities(version).hasPpl).toBe(false);
    }
  );

  // ES 7.9+ and ALL OpenSearch versions have PPL — must not be hidden (no regression).
  it.each(['7.9.1', '7.10.2', '1.0.0', '1.3.2', '2.11.0', '2.13.0', '3.0.0', '3.5.0'])(
    'reports PPL available on %s (ES >= 7.9 or any OpenSearch)',
    (version) => {
      expect(getDeploymentCapabilities(version).hasPpl).toBe(true);
    }
  );

  it('defaults to PPL available when the version is unknown', () => {
    expect(getDeploymentCapabilities(undefined).hasPpl).toBe(true);
    expect(DEFAULT_CAPABILITIES.hasPpl).toBe(true);
  });
});

describe('getDeploymentCapabilities - Elasticsearch collapses to S-min', () => {
  // ES major 6/7 numerically exceed the OpenSearch feature thresholds (2.11+), so
  // guard against `semver.gte` wrongly enabling async/Flint/data-source features.
  it.each(['6.8.0', '7.1.1', '7.7.0', '7.9.1', '7.10.2'])(
    'disables modern OpenSearch features on Elasticsearch %s',
    (version) => {
      const caps = getDeploymentCapabilities(version);
      expect(caps.state).toBe('S-min');
      expect(caps.hasAsyncQuery).toBe(false);
      expect(caps.hasDataSources).toBe(false);
      expect(caps.hasFlintDDL).toBe(false);
      expect(caps.hasAccelerationFlyout).toBe(false);
    }
  );

  // No regression: OpenSearch 2.13+ keeps the full modern feature set.
  it('keeps modern features enabled on OpenSearch 2.13.0 (S-full)', () => {
    const caps = getDeploymentCapabilities('2.13.0');
    expect(caps.state).toBe('S-full');
    expect(caps.hasAsyncQuery).toBe(true);
    expect(caps.hasDataSources).toBe(true);
    expect(caps.hasFlintDDL).toBe(true);
    expect(caps.hasAccelerationFlyout).toBe(true);
  });
});

describe('getDeploymentCapabilities - explicit engine signal overrides version heuristic', () => {
  // Future-proofing: when OpenSearch itself reaches major 6/7, the authoritative
  // distribution/engineType signal (isOpenSearch=true) must keep it on the modern
  // path — NOT be misread as legacy Elasticsearch by the version-major fallback.
  it.each(['6.0.0', '7.10.2'])(
    'treats %s as modern OpenSearch when isOpenSearch=true',
    (version) => {
      const caps = getDeploymentCapabilities(version, true);
      expect(caps.usesLegacyOpenDistroSql).toBe(false);
      expect(caps.state).toBe('S-full');
      expect(caps.hasDataSources).toBe(true);
      expect(caps.hasPpl).toBe(true);
    }
  );

  // And an explicit Elasticsearch signal forces the legacy path + S-min regardless.
  it.each(['6.8.0', '7.9.1', '7.10.2'])(
    'treats %s as legacy Elasticsearch when isOpenSearch=false',
    (version) => {
      const caps = getDeploymentCapabilities(version, false);
      expect(caps.usesLegacyOpenDistroSql).toBe(true);
      expect(caps.state).toBe('S-min');
      expect(caps.hasDataSources).toBe(false);
    }
  );
});
