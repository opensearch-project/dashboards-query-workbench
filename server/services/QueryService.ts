/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import 'core-js/stable';
import _ from 'lodash';
import 'regenerator-runtime/runtime';
import { Logger, RequestHandlerContext } from '../../../../src/core/server';
import { getDeploymentCapabilities } from '../../common/utils/deployment_capabilities';
import { ClusterInfoService } from './ClusterInfoService';

// SQL/PPL query + translate actions that have `_opendistro/*` legacy variants in
// sqlPlugin.js. Async/datasource actions are OpenSearch-only and intentionally omitted.
const LEGACY_ELIGIBLE_ACTIONS = new Set([
  'sql.sqlQuery',
  'sql.sqlJson',
  'sql.sqlCsv',
  'sql.sqlText',
  'sql.translateSQL',
  'sql.pplQuery',
  'sql.pplJson',
  'sql.pplCsv',
  'sql.pplText',
  'sql.translatePPL',
]);

export class QueryService {
  private client: unknown;
  private dataSourceEnabled: boolean;
  private logger: Logger;
  private clusterInfoService: ClusterInfoService;

  constructor(
    client: unknown,
    dataSourceEnabled: boolean,
    logger: Logger,
    clusterInfoService: ClusterInfoService
  ) {
    this.client = client;
    this.dataSourceEnabled = dataSourceEnabled;
    this.logger = logger;
    this.clusterInfoService = clusterInfoService;
  }

  // Map a `_plugins/*` client action to its `_opendistro/*` legacy variant when the
  // target cluster is legacy OpenDistro (Elasticsearch). Non-eligible actions and
  // OpenSearch clusters are returned unchanged. `isOpenSearch` is the authoritative
  // engine signal (distribution / data-source engine type).
  private legacyActionFor(action: string, version: string, isOpenSearch?: boolean): string {
    if (!LEGACY_ELIGIBLE_ACTIONS.has(action)) {
      return action;
    }
    return getDeploymentCapabilities(version, isOpenSearch).usesLegacyOpenDistroSql
      ? `${action}Legacy`
      : action;
  }

  // Local (co-located) cluster: version + engine from the primed ClusterInfoService.
  private resolveLocalClusterAction = async (action: string): Promise<string> => {
    const { version, isOpenSearch } = await this.clusterInfoService.getVersion();
    return this.legacyActionFor(action, version, isOpenSearch);
  };

  // Data-source (MDS) cluster: resolve that data source's version + engine, then pick
  // the legacy action for Elasticsearch data sources.
  private resolveDataSourceAction = async (
    action: string,
    dataSourceMDSId: string,
    context: RequestHandlerContext
  ): Promise<string> => {
    if (!LEGACY_ELIGIBLE_ACTIONS.has(action)) {
      return action;
    }
    const { version, isOpenSearch } = await this.clusterInfoService.getDataSourceInfo(
      dataSourceMDSId,
      context
    );
    return this.legacyActionFor(action, version, isOpenSearch);
  };

  describeQueryPostInternal = async (
    request: Record<string, unknown>,
    format: string,
    responseFormat: string,
    body: Record<string, unknown>,
    context: RequestHandlerContext
  ) => {
    try {
      const params = {
        body: JSON.stringify(body),
      };

      let client = this.client;
      let queryResponse;

      const { dataSourceMDSId } = request.query;
      if (this.dataSourceEnabled && dataSourceMDSId) {
        client = context.dataSource.opensearch.legacy.getClient(dataSourceMDSId);
        // Data-source cluster: route ES 6.x/7.x data sources to `_opendistro/*`.
        const dsAction = await this.resolveDataSourceAction(
          format,
          dataSourceMDSId as string,
          context
        );
        queryResponse = await client.callAPI(dsAction, params);
      } else {
        // Local cluster: route Elasticsearch 6.x/7.x to the `_opendistro/*` endpoint.
        const localAction = await this.resolveLocalClusterAction(format);
        queryResponse = await this.client.asScoped(request).callAsCurrentUser(localAction, params);
      }

      return {
        data: {
          ok: true,
          resp: _.isEqual(responseFormat, 'json') ? JSON.stringify(queryResponse) : queryResponse,
        },
      };
    } catch (err) {
      this.logger.info('error describeQueryPostInternal');
      this.logger.info(err);

      return {
        data: {
          ok: false,
          resp: err.message,
          body: err.body,
          statusCode: err.statusCode || 400,
        },
      };
    }
  };

  describeQueryJobIdInternal = async (
    request: Record<string, unknown>,
    format: string,
    jobId: string,
    responseFormat: string,
    context: Record<string, unknown>,
    dataSourceMDSId: string
  ) => {
    try {
      let client = this.client;
      let queryResponse;

      if (this.dataSourceEnabled && dataSourceMDSId) {
        client = context.dataSource.opensearch.legacy.getClient(dataSourceMDSId);
        queryResponse = await client.callAPI(format, {
          jobId: jobId,
        });
      } else {
        queryResponse = await this.client.asScoped(request).callAsCurrentUser(format, {
          jobId: jobId,
        });
      }
      return {
        data: {
          ok: true,
          resp: _.isEqual(responseFormat, 'json') ? JSON.stringify(queryResponse) : queryResponse,
        },
      };
    } catch (err) {
      this.logger.info(err);
      this.logger.info(request.query);

      return {
        data: {
          ok: false,
          resp: err.message,
          body: err.body,
          statusCode: err.statusCode || 400,
        },
      };
    }
  };

  describeQueryGetInternalSync = async (
    request: Record<string, unknown>,
    format: string,
    responseFormat: string,
    context: Record<string, unknown>
  ) => {
    try {
      let client = this.client;
      let queryResponse;
      const dataSourceMDSId = request.params.dataSourceMDSId;
      // Flint direct-query datasources (`_plugins/_query/_datasources`) require
      // OpenSearch 2.11+; the endpoint does not exist on Elasticsearch or older
      // OpenSearch. Some frontend callers (e.g. DataSelect) fetch this ungated by
      // capabilities, so short-circuit to an empty list here rather than letting the
      // request hit a nonexistent endpoint and surface a fatal error.
      const { version, isOpenSearch } =
        this.dataSourceEnabled && dataSourceMDSId
          ? await this.clusterInfoService.getDataSourceInfo(
              dataSourceMDSId as string,
              (context as unknown) as RequestHandlerContext
            )
          : await this.clusterInfoService.getVersion();
      if (!getDeploymentCapabilities(version, isOpenSearch).hasDataSources) {
        return { data: { ok: true, resp: [] } };
      }
      if (this.dataSourceEnabled && dataSourceMDSId) {
        client = context.dataSource.opensearch.legacy.getClient(dataSourceMDSId);
        queryResponse = await client.callAPI(format);
      } else {
        queryResponse = await this.client.asScoped(request).callAsCurrentUser(format);
      }
      return {
        data: {
          ok: true,
          resp: _.isEqual(responseFormat, 'json') ? JSON.stringify(queryResponse) : queryResponse,
        },
      };
    } catch (err) {
      this.logger.info('error describeQueryGetInternalSync');
      this.logger.info(err);
      this.logger.info(request.query);

      console.log(err, request.query);
      return {
        data: {
          ok: false,
          resp: err.message,
          body: err.body,
          statusCode: err.statusCode || 400,
        },
      };
    }
  };

  describeSQLQuery = async (context: Record<string, unknown>, request: Record<string, unknown>) => {
    return this.describeQueryPostInternal(request, 'sql.sqlQuery', 'json', request.body, context);
  };

  describePPLQuery = async (context: Record<string, unknown>, request: Record<string, unknown>) => {
    return this.describeQueryPostInternal(request, 'sql.pplQuery', 'json', request.body, context);
  };

  describeSQLCsv = async (context: Record<string, unknown>, request: Record<string, unknown>) => {
    return this.describeQueryPostInternal(request, 'sql.sqlCsv', null, request.body, context);
  };

  describePPLCsv = async (context: Record<string, unknown>, request: Record<string, unknown>) => {
    return this.describeQueryPostInternal(request, 'sql.pplCsv', null, request.body, context);
  };

  describeSQLJson = async (context: Record<string, unknown>, request: Record<string, unknown>) => {
    return this.describeQueryPostInternal(request, 'sql.sqlJson', 'json', request.body, context);
  };

  describePPLJson = async (context: Record<string, unknown>, request: Record<string, unknown>) => {
    return this.describeQueryPostInternal(request, 'sql.pplJson', 'json', request.body, context);
  };

  describeSQLText = async (context: Record<string, unknown>, request: Record<string, unknown>) => {
    return this.describeQueryPostInternal(request, 'sql.sqlText', null, request.body, context);
  };

  describePPLText = async (context: Record<string, unknown>, request: Record<string, unknown>) => {
    return this.describeQueryPostInternal(request, 'sql.pplText', null, request.body, context);
  };

  describeSQLAsyncQuery = async (
    context: Record<string, unknown>,
    request: Record<string, unknown>
  ) => {
    return this.describeQueryPostInternal(
      request,
      'sql.sparkSqlQuery',
      null,
      request.body,
      context
    );
  };

  describeSQLAsyncGetQuery = async (
    context: Record<string, unknown>,
    request: Record<string, unknown>,
    jobId: string,
    dataSourceMDSId?: string
  ) => {
    return this.describeQueryJobIdInternal(
      request,
      'sql.sparkSqlGetQuery',
      jobId,
      null,
      context,
      dataSourceMDSId
    );
  };
  describeSyncQueryDataSources = async (
    context: Record<string, unknown>,
    request: Record<string, unknown>
  ) => {
    return this.describeQueryGetInternalSync(request, 'sql.datasourcesGetQuery', null, context);
  };
  describeAsyncDeleteQuery = async (
    context: Record<string, unknown>,
    request: Record<string, unknown>,
    jobId: string,
    dataSourceMDSId?: string
  ) => {
    return this.describeQueryJobIdInternal(
      request,
      'sql.asyncDeleteQuery',
      jobId,
      null,
      context,
      dataSourceMDSId
    );
  };
}
