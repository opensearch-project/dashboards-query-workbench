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
    // Prefer the version recorded on the data-source saved object. It is frequently
    // empty (nothing populates it in many setups), so fall back to probing the data
    // source cluster directly via cluster_info — otherwise an Elasticsearch data
    // source is misdetected as modern OpenSearch and the ES gates never fire.
    try {
      const ds = await savedObjects.client.get<DataSourceAttributes>('data-source', mdsId);
      const savedVersion = ds.attributes?.dataSourceVersion;
      if (savedVersion) {
        return getDeploymentCapabilities(savedVersion);
      }
    } catch (err) {
      console.error('Error fetching data source version from saved object:', err);
    }
    try {
      const res: { data?: { ok?: boolean; version?: string } } = await http.get(
        '/api/sql_console/cluster_info',
        { query: { dataSourceMDSId: mdsId } }
      );
      if (res?.data?.ok && res.data.version) {
        return getDeploymentCapabilities(res.data.version);
      }
    } catch (err) {
      console.error('Error probing data source cluster version:', err);
    }
    return getDeploymentCapabilities(undefined);
  }

  try {
    const res: { data?: { ok?: boolean; version?: string } } = await http.get(
      '/api/sql_console/cluster_info'
    );
    if (res?.data?.ok) {
      return getDeploymentCapabilities(res.data.version);
    }
    return getDeploymentCapabilities(undefined);
  } catch (err) {
    console.error('Error probing local cluster version:', err);
    return getDeploymentCapabilities(undefined);
  }
}
