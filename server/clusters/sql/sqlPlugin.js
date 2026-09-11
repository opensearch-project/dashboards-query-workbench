/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SQL_TRANSLATE_ROUTE,
  SQL_QUERY_ROUTE,
  PPL_QUERY_ROUTE,
  PPL_TRANSLATE_ROUTE,
  SQL_TRANSLATE_ROUTE_LEGACY,
  SQL_QUERY_ROUTE_LEGACY,
  PPL_QUERY_ROUTE_LEGACY,
  PPL_TRANSLATE_ROUTE_LEGACY,
  FORMAT_CSV,
  FORMAT_JSON,
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

  sql.sqlJson = ca({
    url: {
      fmt: `${SQL_QUERY_ROUTE}?${FORMAT_JSON}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.pplJson = ca({
    url: {
      fmt: `${PPL_QUERY_ROUTE}?${FORMAT_JSON}`,
    },
    needBody: true,
    method: 'POST',
  });

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

  // Legacy OpenDistro (`_opendistro/*`) variants for Elasticsearch 6.x/7.x, which
  // do not serve the `_plugins/*` namespace. QueryService/TranslateService select
  // these when the target cluster is legacy OpenDistro (usesLegacyOpenDistroSql).
  sql.translateSQLLegacy = ca({
    url: {
      fmt: `${SQL_TRANSLATE_ROUTE_LEGACY}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.translatePPLLegacy = ca({
    url: {
      fmt: `${PPL_TRANSLATE_ROUTE_LEGACY}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.sqlQueryLegacy = ca({
    url: {
      fmt: `${SQL_QUERY_ROUTE_LEGACY}`,
    },
    needBody: true,
    method: 'POST',
  }); //default: jdbc

  sql.pplQueryLegacy = ca({
    url: {
      fmt: `${PPL_QUERY_ROUTE_LEGACY}`,
    },
    needBody: true,
    method: 'POST',
  }); //default: jdbc

  sql.sqlJsonLegacy = ca({
    url: {
      fmt: `${SQL_QUERY_ROUTE_LEGACY}?${FORMAT_JSON}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.pplJsonLegacy = ca({
    url: {
      fmt: `${PPL_QUERY_ROUTE_LEGACY}?${FORMAT_JSON}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.sqlCsvLegacy = ca({
    url: {
      fmt: `${SQL_QUERY_ROUTE_LEGACY}?${FORMAT_CSV}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.pplCsvLegacy = ca({
    url: {
      fmt: `${PPL_QUERY_ROUTE_LEGACY}?${FORMAT_CSV}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.sqlTextLegacy = ca({
    url: {
      fmt: `${SQL_QUERY_ROUTE_LEGACY}?${FORMAT_TEXT}`,
    },
    needBody: true,
    method: 'POST',
  });

  sql.pplTextLegacy = ca({
    url: {
      fmt: `${PPL_QUERY_ROUTE_LEGACY}?${FORMAT_TEXT}`,
    },
    needBody: true,
    method: 'POST',
  });
}
