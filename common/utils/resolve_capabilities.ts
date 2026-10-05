/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart, SavedObjectsStart } from '../../../../src/core/public';
import { DataSourceAttributes } from '../../../../src/plugins/data_source/common/data_sources';
import { DeploymentCapabilities, getDeploymentCapabilities } from './deployment_capabilities';

export interface ResolveCapabilitiesArgs {
  http: CoreStart['http'];
  savedObjects: SavedObjectsStart;
  dataSourceEnabled: boolean;
  mdsId: string | undefined;
}

/**
 * Reads the version string from wherever it lives and converts it to capabilities.
 *
 * - With MDS + mdsId: the version is an attribute on the data-source saved object.
 *   (Cross-version MDS testing path — not used in managed-service production.)
 * - Without MDS: probe the local cluster via GET /api/sql_console/cluster_info.
 *   (Primary production path.)
 *
 * Any failure falls back to the "unknown" capabilities default.
 */
export async function resolveDeploymentCapabilities(
  args: ResolveCapabilitiesArgs
): Promise<DeploymentCapabilities> {
  const { http, savedObjects, dataSourceEnabled, mdsId } = args;

  if (dataSourceEnabled && mdsId) {
    // Read version + engine from the data-source saved object. `dataSourceEngineType`
    // ('Elasticsearch' | 'OpenSearch' | 'OpenSearch Serverless' | ...) is the
    // authoritative engine signal — only an explicit 'Elasticsearch' is legacy, so
    // this stays correct even when OpenSearch reaches major 6/7. If the saved object
    // lacks a version, fall back to a live cluster_info probe (which also returns the
    // engine derived from the cluster's info.version.distribution).
    try {
      const ds = await savedObjects.client.get<DataSourceAttributes>('data-source', mdsId);
      const savedVersion = ds.attributes?.dataSourceVersion;
      const engineType = ds.attributes?.dataSourceEngineType as unknown as string | undefined;
      if (savedVersion) {
        const isOpenSearch = engineType ? engineType !== 'Elasticsearch' : undefined;
        return getDeploymentCapabilities(savedVersion, isOpenSearch);
      }
    } catch (err) {
      console.error('Error fetching data source version from saved object:', err);
    }
    try {
      const res: { data?: { ok?: boolean; version?: string; isOpenSearch?: boolean } } =
        await http.get('/api/sql_console/cluster_info', { query: { dataSourceMDSId: mdsId } });
      if (res?.data?.ok && res.data.version) {
        return getDeploymentCapabilities(res.data.version, res.data.isOpenSearch);
      }
    } catch (err) {
      console.error('Error probing data source cluster version:', err);
    }
    return getDeploymentCapabilities(undefined);
  }

  try {
    const res: { data?: { ok?: boolean; version?: string; isOpenSearch?: boolean } } =
      await http.get('/api/sql_console/cluster_info');
    if (res?.data?.ok) {
      return getDeploymentCapabilities(res.data.version, res.data.isOpenSearch);
    }
    return getDeploymentCapabilities(undefined);
  } catch (err) {
    console.error('Error probing local cluster version:', err);
    return getDeploymentCapabilities(undefined);
  }
}
