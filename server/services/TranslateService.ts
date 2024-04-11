/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { Logger } from "../../../../src/core/server";

export default class TranslateService {
  private client: any;
  private dataSourceEnabled: boolean;

  constructor(client: any, dataSourceEnabled: boolean, logger: Logger) {
    this.client = client;
    this.dataSourceEnabled = dataSourceEnabled;
  }

  translateSQL = async (context: any, request: any) => {
    try {
      const queryRequest = {
        query: request.body.query,
      };

      const params = {
        body: JSON.stringify(queryRequest),
      };
      let client = this.client;
      let queryResponse;
      const {dataSourceId} = request.query;
      if (this.dataSourceEnabled && dataSourceId) {
        client = context.dataSource.opensearch.legacy.getClient(dataSourceId);
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

  translatePPL = async (context: any, request: any) => {
    try {
      const queryRequest = {
        query: request.body.query,
      };

      const params = {
        body: JSON.stringify(queryRequest),
      };

      let queryResponse;
      let client = this.client;
      const {dataSourceId} = request.query;
      console.log(dataSourceId)
      if (this.dataSourceEnabled && dataSourceId) {
        client = context.dataSource.opensearch.legacy.getClient(dataSourceId);
        queryResponse = await client
        .callAPI('sql.translatePPL', params);
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
