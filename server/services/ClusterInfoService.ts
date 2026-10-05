/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ILegacyClusterClient, Logger, RequestHandlerContext } from '../../../../src/core/server';

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

/**
 * Resolves and caches the connected cluster's version and engine.
 *
 * The local probe uses OSD's internal (admin) credentials so it doesn't depend on
 * the current user having `cluster:monitor/main`. Engine is taken from the info
 * response's `version.distribution` (local) or the data-source saved object's
 * `dataSourceEngineType` (MDS) — both authoritative — used purely to shape which
 * workbench features are enabled for the deployment.
 */
export class ClusterInfoService {
  private infoPromise: Promise<ClusterEngineInfo> | null = null;
  // Per-data-source (MDS) cache, keyed by data-source id. A failed lookup is evicted
  // so the next caller retries.
  private dataSourceInfoCache = new Map<string, Promise<ClusterEngineInfo>>();

  constructor(
    private readonly client: ILegacyClusterClient,
    private readonly logger: Logger
  ) {}

  /**
   * Returns the cached local cluster info. First call triggers the probe; subsequent
   * calls share the in-flight or resolved promise. On failure the cache is cleared so
   * the next caller retries.
   */
  getVersion(): Promise<ClusterEngineInfo> {
    if (!this.infoPromise) {
      this.infoPromise = this.probe().catch((err) => {
        this.logger.warn(`ClusterInfoService: probe failed, will retry on next request: ${err}`);
        this.infoPromise = null;
        return { version: '', isOpenSearch: undefined };
      });
    }
    return this.infoPromise;
  }

  private async probe(): Promise<ClusterEngineInfo> {
    const info = await this.client.callAsInternalUser('info');
    const version = info?.version?.number ?? '';
    // OpenSearch sets version.distribution === 'opensearch'; Elasticsearch has no
    // such field, so its absence marks a legacy ES/OpenDistro cluster.
    const isOpenSearch = info?.version?.distribution === 'opensearch';
    this.logger.debug(
      `ClusterInfoService: resolved cluster version "${version}" isOpenSearch=${isOpenSearch}`
    );
    return { version, isOpenSearch };
  }

  /**
   * Returns the version + engine of a remote cluster reached via a data-source
   * connection (MDS). Resolved from the data-source saved object's
   * `dataSourceVersion` / `dataSourceEngineType`, falling back to a live `info`
   * probe. Cached per data-source id; a failed lookup is evicted for retry.
   */
  getDataSourceInfo(
    dataSourceMDSId: string,
    context: RequestHandlerContext
  ): Promise<ClusterEngineInfo> {
    let cached = this.dataSourceInfoCache.get(dataSourceMDSId);
    if (!cached) {
      cached = this.probeDataSource(dataSourceMDSId, context).catch((err) => {
        this.logger.warn(
          `ClusterInfoService: data source ${dataSourceMDSId} lookup failed, will retry: ${err}`
        );
        this.dataSourceInfoCache.delete(dataSourceMDSId);
        return { version: '', isOpenSearch: undefined };
      });
      this.dataSourceInfoCache.set(dataSourceMDSId, cached);
    }
    return cached;
  }

  private async probeDataSource(
    dataSourceMDSId: string,
    context: RequestHandlerContext
  ): Promise<ClusterEngineInfo> {
    // 1. Saved object: recorded version + engine type (authoritative, no round-trip).
    //    `dataSourceEngineType` is 'Elasticsearch' | 'OpenSearch' | 'OpenSearch
    //    Serverless' | ...; only an explicit 'Elasticsearch' is treated as legacy.
    try {
      const ds = await context.core.savedObjects.client.get('data-source', dataSourceMDSId);
      const attrs = ds?.attributes as {
        dataSourceVersion?: string;
        dataSourceEngineType?: string;
      };
      const version = attrs?.dataSourceVersion ?? '';
      const engineType = attrs?.dataSourceEngineType;
      if (version) {
        const isOpenSearch = engineType ? engineType !== 'Elasticsearch' : undefined;
        this.logger.info(
          `ClusterInfoService: data source ${dataSourceMDSId} saved version "${version}" engine "${
            engineType ?? 'unknown'
          }"`
        );
        return { version, isOpenSearch };
      }
    } catch (err) {
      this.logger.warn(
        `ClusterInfoService: data source ${dataSourceMDSId} saved-object read failed: ${err}`
      );
    }
    // 2. Fall back to a live probe via the MODERN (non-legacy) data-source client,
    //    which exposes the base `info` API. The legacy client only carries this
    //    plugin's custom `sql.*` actions (registerCustomApiSchema), so it cannot.
    //    NB: opensearch.getClient is async (Promise<OpenSearchClient>), unlike the
    //    synchronous opensearch.legacy.getClient.
    const client = await context.dataSource.opensearch.getClient(dataSourceMDSId);
    const resp = await client.info();
    const version = resp?.body?.version?.number ?? '';
    const isOpenSearch = resp?.body?.version?.distribution === 'opensearch';
    this.logger.info(
      `ClusterInfoService: probed data source ${dataSourceMDSId} version "${version}" isOpenSearch=${isOpenSearch}`
    );
    if (!version) {
      throw new Error('empty version from data source info probe');
    }
    return { version, isOpenSearch };
  }
}
