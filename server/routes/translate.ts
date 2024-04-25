/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


import { schema } from '@osd/config-schema';
import { IOpenSearchDashboardsResponse, IRouter, OpenSearchServiceSetup, ResponseError } from '../../../../src/core/server';
import TranslateService from '../services/TranslateService';

export default function translate(server: IRouter, service: TranslateService, openSearchServiceSetup: OpenSearchServiceSetup) {
  server.post(
    {
      path: '/api/sql_console/translatesql',
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceMDSId: schema.maybe(schema.string({ defaultValue: '' }))
        })
      },
    },
    async (context, request, response): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const retVal = await service.translateSQL(context, request);
      return response.ok({
        body: retVal,
      });
    }
  );

  server.post(
    {
      path: '/api/sql_console/translateppl',
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceMDSId: schema.maybe(schema.string({ defaultValue: '' }))
        })
      },
    },
    async (context, request, response): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const retVal = await service.translatePPL(context, request);
      return response.ok({
        body: retVal,
      });
    }
  );
}
