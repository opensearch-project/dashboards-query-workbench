/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ILegacyClusterClient, Logger, RequestHandlerContext } from '../../../../src/core/server';

/**
 * Resolves and caches the local OpenSearch cluster's version at plugin start time.
 *
 * The probe uses OSD's internal (admin) credentials so it doesn't depend on the
 * current user having `cluster:monitor/main`. The cluster version is not
 * user-sensitive and it's consulted purely to shape which workbench features
 * are enabled for the deployment.
 */
export class ClusterInfoService {
  private versionPromise: Promise<string> | null = null;
  // Version cache for clusters reached via a data-source connection (MDS), keyed
  // by data-source id. A failed probe is evicted so the next caller retries.
  private dataSourceVersionCache = new Map<string, Promise<string>>();

  constructor(private readonly client: ILegacyClusterClient, private readonly logger: Logger) {}

  /**
   * Returns the cached cluster version. First call triggers the probe; subsequent
   * calls share the in-flight or resolved promise. If the probe fails, the cache
   * is cleared so the next caller retries.
   */
  getVersion(): Promise<string> {
    if (!this.versionPromise) {
      this.versionPromise = this.probe().catch((err) => {
        this.logger.warn(`ClusterInfoService: probe failed, will retry on next request: ${err}`);
        this.versionPromise = null;
        return '';
      });
    }
    return this.versionPromise;
  }

  private async probe(): Promise<string> {
    const info = await this.client.callAsInternalUser('info');
    const version = info?.version?.number ?? '';
    this.logger.debug(`ClusterInfoService: resolved cluster version "${version}"`);
    return version;
  }

  /**
   * Returns the version of a remote cluster reached via a data-source connection
   * (MDS). Resolved from the data-source saved object's `dataSourceVersion` — the
   * field OSD populates on connect and that the version filter already relies on.
   * Cached per data-source id; a failed lookup returns '' and is evicted for retry.
   */
  getDataSourceVersion(
    dataSourceMDSId: string,
    context: RequestHandlerContext
  ): Promise<string> {
    let cached = this.dataSourceVersionCache.get(dataSourceMDSId);
    if (!cached) {
      cached = this.probeDataSource(dataSourceMDSId, context).catch((err) => {
        this.logger.warn(
          `ClusterInfoService: data source ${dataSourceMDSId} version lookup failed, will retry: ${err}`
        );
        this.dataSourceVersionCache.delete(dataSourceMDSId);
        return '';
      });
      this.dataSourceVersionCache.set(dataSourceMDSId, cached);
    }
    return cached;
  }

  private async probeDataSource(
    dataSourceMDSId: string,
    context: RequestHandlerContext
  ): Promise<string> {
    // 1. Recorded saved-object version (no cluster round-trip), when present.
    try {
      const ds = await context.core.savedObjects.client.get('data-source', dataSourceMDSId);
      const savedVersion = (ds?.attributes as { dataSourceVersion?: string })?.dataSourceVersion;
      if (savedVersion) {
        this.logger.info(
          `ClusterInfoService: data source ${dataSourceMDSId} saved version "${savedVersion}"`
        );
        return savedVersion;
      }
    } catch (err) {
      this.logger.warn(
        `ClusterInfoService: data source ${dataSourceMDSId} saved-object read failed: ${err}`
      );
    }
    // 2. Probe the cluster via the MODERN (non-legacy) data-source client, which
    //    exposes the base `info` API. The legacy client here only carries this
    //    plugin's custom `sql.*` actions (registerCustomApiSchema), so it cannot.
    const client = context.dataSource.opensearch.getClient(dataSourceMDSId);
    const resp = await client.info();
    const version = resp?.body?.version?.number ?? '';
    this.logger.info(
      `ClusterInfoService: probed data source ${dataSourceMDSId} version "${version}"`
    );
    if (!version) {
      throw new Error('empty version from data source info probe');
    }
    return version;
  }
}
