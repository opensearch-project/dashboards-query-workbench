/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


import 'core-js/stable';
import 'regenerator-runtime/runtime';
import _ from 'lodash';

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

  describeQueryGetInternal = async (request: any, format: string, jobId: string, responseFormat: string) => {
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

  describeSQLQuery = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sqlQuery', 'json', {query: request.body.query});
  };

  describePPLQuery = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.pplQuery', 'json', {query: request.body.query});
  };

  describeSQLCsv = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sqlCsv', null, {query: request.body.query});
  };

  describePPLCsv = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.pplCsv', null, {query: request.body.query});
  };

  describeSQLJson = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sqlJson', 'json', {query: request.body.query});
  };

  describePPLJson = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.pplJson', 'json', {query: request.body.query});
  };

  describeSQLText = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sqlText', null, {query: request.body.query});
  };

  describePPLText = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.pplText', null, {query: request.body.query});
  };

  describeSQLAsyncQuery = async (request: any) => {
    return this.describeQueryPostInternal(request, 'sql.sparkSqlQuery', null, request.body);
  };

  describeSQLAsyncGetQuery = async (request: any, jobId: string) => {
    return this.describeQueryGetInternal(request, 'sql.sparkSqlGetQuery', jobId, null);
  };
}
