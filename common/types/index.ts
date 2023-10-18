/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export type AggregationFunctionType = 'count' | 'sum' | 'avg' | 'max' | 'min';

export interface MaterializedViewColumn {
  id: string;
  functionName: AggregationFunctionType;
  functionParam: string;
  fieldAlias?: string;
}

export type SkippingIndexAccMethodType = 'PARTITION' | 'VALUE_SET' | 'MIN_MAX';

export interface SkippingIndexRowType {
  id: string;
  fieldName: string;
  dataType: string;
  accelerationMethod: SkippingIndexAccMethodType;
}

export interface DataTableFieldsType {
  id: string;
  fieldName: string;
  dataType: string;
}

export interface RefreshIntervalType {
  refreshWindow: number;
  refreshInterval: string;
}

export type AccelerationIndexType = 'skipping' | 'covering' | 'materialized';

export interface GroupByTumbleType {
  timeField: string;
  tumbleWindow: number;
  tumbleInterval: string;
}

export interface materializedViewQueryType {
  columnsValues: MaterializedViewColumn[];
  groupByTumbleValue: GroupByTumbleType;
}

export interface FormErrorsType {
  dataSourceError: string[];
  databaseError: string[];
  dataTableError: string[];
  skippingIndexError: string[];
  coveringIndexError: string[];
  materializedViewError: string[];
  indexNameError: string[];
  primaryShardsError: string[];
  replicaShardsError: string[];
  refreshIntervalError: string[];
  checkpointLocationError: string[];
}

export interface CreateAccelerationForm {
  dataSource: string;
  database: string;
  dataTable: string;
  dataTableFields: DataTableFieldsType[];
  accelerationIndexType: AccelerationIndexType;
  skippingIndexQueryData: SkippingIndexRowType[];
  coveringIndexQueryData: string[];
  materializedViewQueryData: materializedViewQueryType;
  accelerationIndexName: string;
  primaryShardsCount: number;
  replicaShardsCount: number;
  refreshType: 'interval' | 'auto';
  checkpointLocation: string | undefined;
  refreshIntervalOptions: RefreshIntervalType;
  formErrors: FormErrorsType;
}

export type AsyncQueryLoadingStatus = 'SUCCESS' | 'FAILED' | 'RUNNING' | 'SCHEDULED' | 'CANCELED';
export type TreeItemType = 'covering_index' | 'skipping_index' | 'table' | 'database' | 'materialized_view' | 'Load Materialized View' | 'badge'

export interface TreeItem {
  name: string;
  type: TreeItemType;
  isExpanded: boolean;
  values?: TreeItem[];
}
