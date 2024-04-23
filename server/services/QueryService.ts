/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


import 'core-js/stable';
import _ from 'lodash';
import 'regenerator-runtime/runtime';
import { Logger, RequestHandlerContext } from '../../../../src/core/server';


export default class QueryService {
  private client: any;
  private dataSourceEnabled: boolean;
  private logger: Logger;

  constructor(client: any, dataSourceEnabled: boolean, logger: Logger) {
    this.client = client;
    this.dataSourceEnabled = dataSourceEnabled;
    this.logger = logger;
  }

  describeQueryPostInternal = async (request: any, format: string, responseFormat: string, body: any, context: RequestHandlerContext) => {
    try {
      const params = {
        body: JSON.stringify(body),
      };

      let client = this.client;
      let queryResponse;

      const {dataSourceId} = request.query;
      if (this.dataSourceEnabled && dataSourceId) {
        client = context.dataSource.opensearch.legacy.getClient(dataSourceId);
        queryResponse = await client.callAPI(format, params);
      } else {
        queryResponse = await this.client.asScoped(request).callAsCurrentUser(format, params);
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
      this.logger.info(request.query);

      console.log(err, request.query);
      return {
        data: {
          ok: false,
          resp: err.message,
          body: err.body
        },
      };
    }
  };

  describeQueryJobIdInternal = async (request: any, format: string, jobId: string, responseFormat: string, context: any) => {
    try {
      let client = this.client;
      let queryResponse;

      if (this.dataSourceEnabled) {
        const {dataSourceId} = request.query;

        client = context.dataSource.opensearch.legacy.getClient(dataSourceId);
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
      this.logger.info('error describeQueryJobIdInternal');
      this.logger.info(err);
      this.logger.info(request.query);

      console.log(err, request.query);
      return {
        data: {
          ok: false,
          resp: err.message,
          body: err.body
        },
      };
    }
  };

  describeQueryGetInternalSync = async (request: any, format: string, responseFormat: string, context: any) => {
    try {
      let client = this.client;
      let queryResponse;
      const dataSourceId  = request.params.dataSourceId;
      if (this.dataSourceEnabled && dataSourceId) {
        client = context.dataSource.opensearch.legacy.getClient(dataSourceId);
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
          body: err.body
        },
      };
    }
  };


  describeSQLQuery = async (context: any, request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sqlQuery', 'json', request.body, context);
  };

  describePPLQuery = async (context: any, request: any) => {
    return this.describeQueryPostInternal(request, 'sql.pplQuery', 'json', request.body, context);
  };

  describeSQLCsv = async (context: any, request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sqlCsv', null, request.body, context);
  };

  describePPLCsv = async (context: any, request: any) => {
    return this.describeQueryPostInternal(request, 'sql.pplCsv', null, request.body, context);
  };

  describeSQLJson = async (context: any, request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sqlJson', 'json', request.body, context);
  };

  describePPLJson = async (context: any,request: any) => {
    return this.describeQueryPostInternal(request, 'sql.pplJson', 'json', request.body, context);
  };

  describeSQLText = async (context: any,request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sqlText', null, request.body, context);
  };

  describePPLText = async (context: any,request: any) => {
    return this.describeQueryPostInternal(request, 'sql.pplText', null, request.body, context);
  };

  describeSQLAsyncQuery = async (context: any,request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sparkSqlQuery', null, request.body, context);
  };

  describeSQLAsyncGetQuery = async (context: any,request: any, jobId: string) => {
    return this.describeQueryJobIdInternal(request, 'sql.sparkSqlGetQuery', jobId, null, context);
  };
  describeSyncQueryDataSources = async (context: any,request: any) => {
    return this.describeQueryGetInternalSync(request, 'sql.datasourcesGetQuery', null, context);
  };
  describeAsyncDeleteQuery = async (context: any,request: any, jobId: string) => {
    return this.describeQueryJobIdInternal(request, 'sql.asyncDeleteQuery', jobId, null, context);
  };
}