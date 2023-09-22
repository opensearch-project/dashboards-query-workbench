/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MaterializedViewColumn {
  id: string;
  functionName: 'count' | 'sum' | 'avg' | 'min' | 'max';
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

export interface CreateAccelerationForm {
  dataSource: string;
  dataTable: string;
  dataTableFields: DataTableFieldsType[];
  accelerationIndexType: 'skipping' | 'covering' | 'materialized';
  queryBuilderType: 'visual' | 'code';
  skippingIndexQueryData: SkippingIndexRowType[];
  coveringIndexQueryData: string;
  materializedViewQueryData: string;
  accelerationIndexName: string;
  accelerationIndexAlias: string;
  primaryShardsCount: number;
  replicaShardsCount: number;
  refreshType: 'interval' | 'auto';
  refreshIntervalSeconds: string | undefined;
}
