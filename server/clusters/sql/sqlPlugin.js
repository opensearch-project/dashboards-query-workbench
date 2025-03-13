/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SQL_TRANSLATE_ROUTE,
  SQL_QUERY_ROUTE,
  PPL_QUERY_ROUTE,
  PPL_TRANSLATE_ROUTE,
  FORMAT_CSV,
  FORMAT_TEXT,
  SPARK_SQL_QUERY_ROUTE,
  DATASOURCES_GET_QUERY,
} from '../../services/utils/constants';

export default function sqlPlugin(Client, config, components) {
  const ca = components.clientAction.factory;

  Client.prototype.sql = components.clientAction.namespaceFactory();
  const sql = Client.prototype.sql.prototype;

  sql.translateSQL = ca({
    url: {
      fmt: `${SQL_TRANSLATE_ROUTE}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.translatePPL = ca({
    url: {
      fmt: `${PPL_TRANSLATE_ROUTE}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.sqlQuery = ca({
    url: {
      fmt: `${SQL_QUERY_ROUTE}`,
    },
    needBody: true,
    method: 'POST',
  }); //default: jdbc

  sql.pplQuery = ca({
    url: {
      fmt: `${PPL_QUERY_ROUTE}`,
    },
    needBody: true,
    method: 'POST',
  }); //default: jdbc

  sql.sqlCsv = ca({
    url: {
      fmt: `${SQL_QUERY_ROUTE}?${FORMAT_CSV}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.pplCsv = ca({
    url: {
      fmt: `${PPL_QUERY_ROUTE}?${FORMAT_CSV}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.sqlText = ca({
    url: {
      fmt: `${SQL_QUERY_ROUTE}?${FORMAT_TEXT}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.pplText = ca({
    url: {
      fmt: `${PPL_QUERY_ROUTE}?${FORMAT_TEXT}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.sparkSqlQuery = ca({
    url: {
      fmt: `${SPARK_SQL_QUERY_ROUTE}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.sparkSqlGetQuery = ca({
    url: {
      fmt: `${SPARK_SQL_QUERY_ROUTE}/<%=jobId%>`,
      req: {
        jobId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'GET',
  });

  sql.datasourcesGetQuery = ca({
    url: {
      fmt: `${DATASOURCES_GET_QUERY}`,
    },
    needBody: false,
    method: 'GET',
  });

  sql.asyncDeleteQuery = ca({
    url: {
      fmt: `${SPARK_SQL_QUERY_ROUTE}/<%=jobId%>`,
      req: {
        jobId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'DELETE',
  });
}
