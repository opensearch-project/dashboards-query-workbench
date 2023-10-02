/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SkippingIndexRowType, materializedViewQueryType } from '../../common/types';

export const skippingIndexDataMock: SkippingIndexRowType[] = [
  {
    id: '1',
    fieldName: 'field1',
    dataType: 'string',
    accelerationMethod: 'PARTITION',
  },
  {
    id: '2',
    fieldName: 'field2',
    dataType: 'number',
    accelerationMethod: 'VALUE_SET',
  },
];

export const coveringIndexDataMock: string[] = ['field1', 'field2', 'field3'];

export const materializedViewEmptyDataMock = {
  columnsValues: [],
  groupByTumbleValue: {
    timeField: '',
    tumbleWindow: 0,
    tumbleInterval: '',
  },
};

export const materializedViewEmptyTumbleDataMock: materializedViewQueryType = {
  columnsValues: [
    {
      id: '1',
      functionName: 'count',
      functionParam: 'field1',
    },
  ],
  groupByTumbleValue: {
    timeField: '',
    tumbleWindow: 0,
    tumbleInterval: 'second',
  },
};

export const materializedViewStaleDataMock: materializedViewQueryType = {
  columnsValues: [],
  groupByTumbleValue: {
    timeField: 'timestamp',
    tumbleWindow: 10,
    tumbleInterval: 'hour',
  },
};

export const materializedViewValidDataMock: materializedViewQueryType = {
  columnsValues: [
    {
      id: '1',
      functionName: 'count',
      functionParam: 'field1',
    },
    {
      id: '2',
      functionName: 'sum',
      functionParam: 'field2',
    },
  ],
  groupByTumbleValue: {
    timeField: 'timestamp',
    tumbleWindow: 5,
    tumbleInterval: 'hour',
  },
};
