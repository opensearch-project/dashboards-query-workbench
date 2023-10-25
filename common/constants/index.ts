/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLUGIN_ID = 'queryWorkbenchDashboards';
export const PLUGIN_NAME = 'Query Workbench';
export const OPENSEARCH_ACC_DOCUMENTATION_URL =
  'https://opensearch.org/docs/latest/dashboards/management/accelerate-external-data/';
export const ACC_INDEX_TYPE_DOCUMENTATION_URL =
  'https://github.com/opensearch-project/opensearch-spark/blob/main/docs/index.md';

export const TREE_ITEM_SKIPPING_INDEX_DEFAULT_NAME = `skipping_index`;
export const TREE_ITEM_COVERING_INDEX_DEFAULT_NAME = `covering_index`;
export const TREE_ITEM_MATERIALIZED_VIEW_DEFAULT_NAME = `materialized_view`;
export const TREE_ITEM_DATABASE_NAME_DEFAULT_NAME = `database`;
export const TREE_ITEM_TABLE_NAME_DEFAULT_NAME = `table`;
export const TREE_ITEM_LOAD_MATERIALIZED_BADGE_NAME = `Load Materialized View`;
export const TREE_ITEM_BADGE_NAME = `badge`;
export const LOAD_OPENSEARCH_INDICES_QUERY = `SHOW tables LIKE '%';`;
export const SKIPPING_INDEX_QUERY = `CREATE SKIPPING INDEX ON myS3.logs_db.http_logs 
(status VALUE_SET) 
WITH (
  auto_refresh = true
  )`;
export const COVERING_INDEX_QUERY = `CREATE INDEX covering_idx ON myS3.logs_db.http_logs
 (status) 
 WITH (
  auto_refresh = true
  )`;
export const CREATE_DATABASE_QUERY = `CREATE DATABASE myS3.logs_db`;
export const CREATE_TABLE_QUERY = `CREATE EXTERNAL TABLE myS3.logs_db.logs (
  key BIGINT,
  status INTEGER,
  size FLOAT,
  agent STRING,
  timestamp DATE
)
USING JSON
OPTIONS (
  path 's3://test/path',
  compression 'gzip'
);`;

export const ACCELERATION_INDEX_TYPES = [
  { label: 'Skipping Index', value: 'skipping' },
  { label: 'Covering Index', value: 'covering' },
  { label: 'Materialized View', value: 'materialized' },
];

export const ACCELERATION_AGGREGRATION_FUNCTIONS = [
  { label: 'count' },
  { label: 'sum' },
  { label: 'avg' },
  { label: 'max' },
  { label: 'min' },
];

export const ACCELERATION_TIME_INTERVAL = [
  { text: 'millisecond(s)', value: 'millisecond' },
  { text: 'second(s)', value: 'second' },
  { text: 'hour(s)', value: 'hour' },
  { text: 'day(s)', value: 'day' },
  { text: 'week(s)', value: 'week' },
];

export const SKIPPING_INDEX_ACCELERATION_METHODS = [
  { value: 'PARTITION', text: 'Partition' },
  { value: 'VALUE_SET', text: 'Value Set' },
  { value: 'MIN_MAX', text: 'Min Max' },
];

export const ACCELERATION_ADD_FIELDS_TEXT = '(add fields here)';
export const ACCELERATION_INDEX_NAME_REGEX = /^[a-z][a-z_]*$/;
export const ACCELERATION_S3_URL_REGEX = /^(s3|s3a):\/\/[a-zA-Z0-9.\-]+/;
export const ACCELERATION_DEFUALT_SKIPPING_INDEX_NAME = 'skipping';

export const ACCELERATION_INDEX_NAME_INFO = `All OpenSearch acceleration indices have a naming format of pattern: \`prefix_<index name>_suffix\`. They share a common prefix structure, which is \`flint_<data source name>_<database name>_<table name>_\`. Additionally, they may have a suffix that varies based on the index type. 
##### Skipping Index
- For 'Skipping' indices, a fixed index name 'skipping' is used, and this name cannot be modified by the user. The suffix added to this type is \`_index\`.
  - An example of a 'Skipping' index name would be: \`flint_mydatasource_mydb_mytable_skipping_index\`.
##### Covering Index
- 'Covering' indices allow users to specify their index name. The suffix added to this type is \`_index\`.
  - For instance, a 'Covering' index name could be: \`flint_mydatasource_mydb_mytable_myindexname_index\`.
##### Materialized View Index
- 'Materialized View' indices also enable users to define their index name, but they do not have a suffix.
  - An example of a 'Materialized View' index name might look like: \`flint_mydatasource_mydb_mytable_myindexname\`.
##### Note:
- All user given index names must be in lowercase letters. Index name cannot begin with underscores. Spaces, commas, and characters -, :, ", *, +, /, \, |, ?, #, >, or < are not allowed.  
  `;

export const OPENSEARCH_SQL_INIT_QUERY = `SHOW tables LIKE '%';`;
export const TIMESTAMP_DATATYPE = 'timestamp';
export const FETCH_OPENSEARCH_INDICES_PATH = '/api/sql_console/sqlquery';
export const POLL_INTERVAL_MS = 2000;
export const ASYNC_QUERY_ENDPOINT = '/api/spark_sql_console';
export const ASYNC_QUERY_JOB_ENDPOINT = ASYNC_QUERY_ENDPOINT + '/job/';
export const ASYNC_QUERY_SESSION_ID = 'async-query-session-id';

export const SAMPLE_PPL_QUERY = 'source = <datasource>.<database>.<table> | head 10';
export const SAMPLE_SQL_QUERY = 'select * from <datasource>.<database>.<table> limit 10';
