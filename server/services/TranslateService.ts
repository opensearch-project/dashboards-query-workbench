/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { Logger, RequestHandlerContext } from '../../../../src/core/server';
import { getDeploymentCapabilities } from '../../common/utils/deployment_capabilities';
import { ClusterInfoService } from './ClusterInfoService';

export class TranslateService {
  private client: unknown;
  private dataSourceEnabled: boolean;
  private clusterInfoService: ClusterInfoService;

  constructor(
    client: unknown,
    dataSourceEnabled: boolean,
    _logger: Logger,
    clusterInfoService: ClusterInfoService
  ) {
    this.client = client;
    this.dataSourceEnabled = dataSourceEnabled;
    this.clusterInfoService = clusterInfoService;
  }

  // Local cluster: swap `sql.translateX` -> `sql.translateXLegacy` on ES 6.x/7.x.
  private resolveLocalClusterAction = async (action: string): Promise<string> => {
    const version = await this.clusterInfoService.getVersion();
    return getDeploymentCapabilities(version).usesLegacyOpenDistroSql ? `${action}Legacy` : action;
  };

  // Data-source (MDS) cluster: probe that data source's version, then swap on ES 6.x/7.x.
  private resolveDataSourceAction = async (
    action: string,
    dataSourceMDSId: string,
    context: RequestHandlerContext
  ): Promise<string> => {
    const version = await this.clusterInfoService.getDataSourceVersion(dataSourceMDSId, context);
    return getDeploymentCapabilities(version).usesLegacyOpenDistroSql ? `${action}Legacy` : action;
  };

  translateSQL = async (context: Record<string, unknown>, request: Record<string, unknown>) => {
    try {
      const queryRequest = {
        query: request.body.query,
      };

      const params = {
        body: JSON.stringify(queryRequest),
      };
      let client = this.client;
      let queryResponse;
      const { dataSourceMDSId } = request.query;
      if (this.dataSourceEnabled && dataSourceMDSId) {
        client = context.dataSource.opensearch.legacy.getClient(dataSourceMDSId);
        const dsAction = await this.resolveDataSourceAction(
          'sql.translateSQL',
          dataSourceMDSId as string,
          (context as unknown) as RequestHandlerContext
        );
        queryResponse = await client.callAPI(dsAction, params);
      } else {
        const localAction = await this.resolveLocalClusterAction('sql.translateSQL');
        queryResponse = await client.asScoped(request).callAsCurrentUser(localAction, params);
      }

      const ret = {
        data: {
          ok: true,
          resp: queryResponse,
        },
      };
      return ret;
    } catch (err) {
      console.log(err);
      return {
        data: {
          ok: false,
          resp: err.message,
        },
      };
    }
  };

  translatePPL = async (context: Record<string, unknown>, request: Record<string, unknown>) => {
    try {
      const queryRequest = {
        query: request.body.query,
      };

      const params = {
        body: JSON.stringify(queryRequest),
      };

      let queryResponse;
      let client = this.client;
      const { dataSourceMDSId } = request.query;
      if (this.dataSourceEnabled && dataSourceMDSId) {
        client = context.dataSource.opensearch.legacy.getClient(dataSourceMDSId);
        const dsAction = await this.resolveDataSourceAction(
          'sql.translatePPL',
          dataSourceMDSId as string,
          (context as unknown) as RequestHandlerContext
        );
        queryResponse = await client.callAPI(dsAction, params);
      } else {
        const localAction = await this.resolveLocalClusterAction('sql.translatePPL');
        queryResponse = await client.asScoped(request).callAsCurrentUser(localAction, params);
      }
      return {
        data: {
          ok: true,
          resp: queryResponse,
        },
      };
    } catch (err) {
      console.log(err);
      return {
        data: {
          ok: false,
          resp: err.message,
        },
      };
    }
  };
}
