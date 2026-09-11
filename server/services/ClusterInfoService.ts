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
   * (MDS). The data-source saved object's `dataSourceVersion` is frequently empty,
   * so we probe the cluster directly (GET / on that data source). Cached per
   * data-source id; a failed probe returns '' and is evicted for retry.
   */
  getDataSourceVersion(
    dataSourceMDSId: string,
    context: RequestHandlerContext
  ): Promise<string> {
    let cached = this.dataSourceVersionCache.get(dataSourceMDSId);
    if (!cached) {
      cached = this.probeDataSource(dataSourceMDSId, context).catch((err) => {
        this.logger.warn(
          `ClusterInfoService: data source ${dataSourceMDSId} probe failed, will retry: ${err}`
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
    const client = context.dataSource.opensearch.legacy.getClient(dataSourceMDSId);
    const info = await client.callAPI('info');
    const version = info?.version?.number ?? '';
    this.logger.debug(
      `ClusterInfoService: resolved data source ${dataSourceMDSId} version "${version}"`
    );
    return version;
  }
}
