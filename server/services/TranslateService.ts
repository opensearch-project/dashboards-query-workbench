/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { Logger } from '../../../../src/core/server';

export class TranslateService {
  private client: unknown;
  private dataSourceEnabled: boolean;

  constructor(client: unknown, dataSourceEnabled: boolean, _logger: Logger) {
    this.client = client;
    this.dataSourceEnabled = dataSourceEnabled;
  }

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
        queryResponse = await client.callAPI('sql.translateSQL', params);
      } else {
        queryResponse = await client
          .asScoped(request)
          .callAsCurrentUser('sql.translateSQL', params);
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
        queryResponse = await client.callAPI('sql.translatePPL', params);
      } else {
        queryResponse = await client
          .asScoped(request)
          .callAsCurrentUser('sql.translatePPL', params);
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
