/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


import 'core-js/stable';
import _ from 'lodash';
import 'regenerator-runtime/runtime';

export default class QueryService {
  private client: any;
  constructor(client: any) {
    this.client = client;
  }

  describeQueryPostInternal = async (request: any, format: string, responseFormat: string, body: any) => {
    try {
      const params = {
        body: JSON.stringify(body),
      };

      const queryResponse = await this.client.asScoped(request).callAsCurrentUser(format, params);
      return {
        data: {
          ok: true,
          resp: _.isEqual(responseFormat, 'json') ? JSON.stringify(queryResponse) : queryResponse,
        },
      };
    } catch (err) {
      console.log(err);
      return {
        data: {
          ok: false,
          resp: err.message,
          body: err.body
        },
      };
    }
  };

  describeQueryJobIdInternal = async (request: any, format: string, jobId: string, responseFormat: string) => {
    try {
      const queryResponse = await this.client.asScoped(request).callAsCurrentUser(format, {
        jobId: jobId,
      });
      return {
        data: {
          ok: true,
          resp: _.isEqual(responseFormat, 'json') ? JSON.stringify(queryResponse) : queryResponse,
        },
      };
    } catch (err) {
      console.log(err);
      return {
        data: {
          ok: false,
          resp: err.message,
          body: err.body
        },
      };
    }
  };

  describeQueryGetInternalSync = async (request: any, format: string, responseFormat: string) => {
    try {
      const queryResponse = await this.client.asScoped(request).callAsCurrentUser(format);
      return {
        data: {
          ok: true,
          resp: _.isEqual(responseFormat, 'json') ? JSON.stringify(queryResponse) : queryResponse,
        },
      };
    } catch (err) {
      console.log(err);
      return {
        data: {
          ok: false,
          resp: err.message,
          body: err.body
        },
      };
    }
  };


  describeSQLQuery = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sqlQuery', 'json', request.body);
  };

  describePPLQuery = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.pplQuery', 'json', request.body);
  };

  describeSQLCsv = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sqlCsv', null, request.body);
  };

  describePPLCsv = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.pplCsv', null, request.body);
  };

  describeSQLJson = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sqlJson', 'json', request.body);
  };

  describePPLJson = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.pplJson', 'json', request.body);
  };

  describeSQLText = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sqlText', null, request.body);
  };

  describePPLText = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.pplText', null, request.body);
  };

  describeSQLAsyncQuery = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sparkSqlQuery', null, request.body);
  };

  describeSQLAsyncGetQuery = async (request: any, jobId: string) => {
    return this.describeQueryJobIdInternal(request, 'sql.sparkSqlGetQuery', jobId, null);
  };
  describeSyncQueryDataSources = async (request: any) => {
    return this.describeQueryGetInternalSync(request, 'sql.datasourcesGetQuery', null);
  };
  describeAsyncDeleteQuery = async (request: any, jobId: string) => {
    return this.describeQueryJobIdInternal(request, 'sql.asyncDeleteQuery', jobId, null);
  };
}