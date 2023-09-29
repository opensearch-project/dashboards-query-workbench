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

export interface SkippingIndexRowType {
  id: string;
  fieldName: string;
  dataType: string;
  accelerationMethod: 'PARTITION' | 'VALUE_SET' | 'MIN_MAX';
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
  refreshIntervalOptions: RefreshIntervalType | undefined;
}
