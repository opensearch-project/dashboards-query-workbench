/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IOpenSearchDashboardsResponse, IRouter, ResponseError } from '../../../../src/core/server';
import QueryService from '../services/QueryService';
import {
  ROUTE_PATH_GET_DATASOURCES,
  ROUTE_PATH_PPL_CSV,
  ROUTE_PATH_PPL_QUERY,
  ROUTE_PATH_PPL_TEXT,
  ROUTE_PATH_SPARK_SQL_JOB_QUERY,
  ROUTE_PATH_SPARK_SQL_QUERY,
  ROUTE_PATH_SQL_CSV,
  ROUTE_PATH_SQL_QUERY,
  ROUTE_PATH_SQL_TEXT,
} from '../utils/constants';

export function registerQueryRoute(server: IRouter, service: QueryService) {
  server.post(
    {
      path: ROUTE_PATH_SQL_QUERY,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceMDSId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const retVal = await service.describeSQLQuery(context, request);
      if (retVal.data.ok) {
        return response.ok({
          body: retVal,
        });
      } else {
        return response.custom({
          body: retVal.data.body,
          statusCode: retVal.data.statusCode,
        });
      }
    }
  );

  server.post(
    {
      path: ROUTE_PATH_PPL_QUERY,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceMDSId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const retVal = await service.describePPLQuery(context, request);
      return response.ok({
        body: retVal,
      });
    }
  );

  server.post(
    {
      path: ROUTE_PATH_SQL_CSV,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceMDSId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const retVal = await service.describeSQLCsv(context, request);
      if (retVal.data.ok) {
        return response.ok({
          body: retVal,
        });
      } else {
        return response.custom({
          body: retVal.data.body,
          statusCode: retVal.data.statusCode,
        });
      }
    }
  );

  server.post(
    {
      path: ROUTE_PATH_PPL_CSV,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceMDSId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const retVal = await service.describePPLCsv(context, request);
      if (retVal.data.ok) {
        return response.ok({
          body: retVal,
        });
      } else {
        return response.custom({
          body: retVal.data.body,
          statusCode: retVal.data.statusCode,
        });
      }
    }
  );

  server.post(
    {
      path: ROUTE_PATH_SQL_TEXT,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceMDSId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const retVal = await service.describeSQLText(context, request);
      if (retVal.data.ok) {
        return response.ok({
          body: retVal,
        });
      } else {
        return response.custom({
          body: retVal.data.body,
          statusCode: retVal.data.statusCode,
        });
      }
    }
  );

  server.post(
    {
      path: ROUTE_PATH_PPL_TEXT,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceMDSId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const retVal = await service.describePPLText(context, request);
      if (retVal.data.ok) {
        return response.ok({
          body: retVal,
        });
      } else {
        return response.custom({
          body: retVal.data.body,
          statusCode: retVal.data.statusCode,
        });
      }
    }
  );

  server.post(
    {
      path: ROUTE_PATH_SPARK_SQL_QUERY,
      validate: {
        body: schema.any(),
        query: schema.object({
          dataSourceMDSId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const retVal = await service.describeSQLAsyncQuery(context, request);
      if (retVal.data.ok) {
        return response.ok({
          body: retVal,
        });
      } else {
        return response.custom({
          body: retVal.data.body,
          statusCode: retVal.data.statusCode,
        });
      }
    }
  );

  server.get(
    {
      path: ROUTE_PATH_SPARK_SQL_JOB_QUERY + '/{id}' + '/{dataSourceMDSId?}',
      validate: {
        params: schema.object({
          id: schema.string(),
          dataSourceMDSId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const retVal = await service.describeSQLAsyncGetQuery(
        context,
        request,
        request.params.id,
        request.params.dataSourceMDSId
      );
      if (retVal.data.ok) {
        return response.ok({
          body: retVal,
        });
      } else {
        return response.custom({
          body: retVal.data.body,
          statusCode: retVal.data.statusCode,
        });
      }
    }
  );

  server.delete(
    {
      path: ROUTE_PATH_SPARK_SQL_JOB_QUERY + '/{id}' + '/{dataSourceMDSId?}',
      validate: {
        params: schema.object({
          id: schema.string(),
          dataSourceMDSId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const retVal = await service.describeAsyncDeleteQuery(
        context,
        request,
        request.params.id,
        request.params.dataSourceMDSId
      );
      return response.ok({
        body: retVal,
      });
    }
  );

  server.get(
    {
      path: `${ROUTE_PATH_GET_DATASOURCES}/{dataSourceMDSId?}`,
      validate: {
        params: schema.object({
          dataSourceMDSId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      const retVal = await service.describeSyncQueryDataSources(context, request);
      if (retVal.data.ok) {
        return response.ok({
          body: retVal,
        });
      } else {
        return response.custom({
          body: retVal.data.body,
          statusCode: retVal.data.statusCode,
        });
      }
    }
  );
}
