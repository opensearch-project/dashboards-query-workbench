/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import { CreateAccelerationForm, SkippingIndexRowType } from '../../../../common/types';

const buildSkippingIndexColumns = (skippingIndexQueryData: SkippingIndexRowType[]) => {
  return _.reduce(
    skippingIndexQueryData,
    function (columns, n, index) {
      const columnValue = columns + `   ${n.fieldName} ${n.accelerationMethod}`;
      if (index !== skippingIndexQueryData.length - 1) return `${columnValue}, \n`;
      else return `${columnValue} \n`;
    },
    ''
  );
};

const skippingIndexQueryBuilder = (accelerationformData: CreateAccelerationForm) => {
  /*
   * Skipping Index Example
   *
   * CREATE SKIPPING INDEX ON table_name
   * FOR COLUMNS (
   *    field1 VALUE_SET,
   *    field2 PARTITION,
   *    field3 MIN_MAX,
   * )
   */
  let codeQuery = 'CREATE SKIPPING INDEX ON ' + accelerationformData.dataTable;
  codeQuery = codeQuery + '\n FOR COLUMNS ( \n';
  codeQuery = codeQuery + buildSkippingIndexColumns(accelerationformData.skippingIndexQueryData);
  codeQuery = codeQuery + ')';
  return codeQuery;
};

const coveringIndexQueryBuilder = (accelerationformData: CreateAccelerationForm) => {
  return '';
};

const materializedQueryViewBuilder = (accelerationformData: CreateAccelerationForm) => {
  return '';
};

export const accelerationQueryBuilder = (accelerationformData: CreateAccelerationForm) => {
  switch (accelerationformData.accelerationIndexType) {
    case 'skipping': {
      return skippingIndexQueryBuilder(accelerationformData);
    }
    case 'covering': {
      return coveringIndexQueryBuilder(accelerationformData);
    }
    case 'materialized': {
      return materializedQueryViewBuilder(accelerationformData);
    }
    default: {
      return '';
    }
  }
};
