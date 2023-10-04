/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFormRow,
  EuiLink,
  EuiText,
  htmlIdGenerator,
} from '@elastic/eui';
import React, { useEffect, useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import {
  ACCELERATION_DEFUALT_SKIPPING_INDEX_NAME,
  ACCELERATION_INDEX_TYPES,
  ACC_INDEX_TYPE_DOCUMENTATION_URL,
} from '../../../../common/constants';
import { AccelerationIndexType, CreateAccelerationForm } from '../../../../common/types';
import { getJobId, pollQueryStatus } from '../../SQLPage/utils';

interface IndexTypeSelectorProps {
  http: CoreStart['http'];
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const IndexTypeSelector = ({
  http,
  accelerationFormData,
  setAccelerationFormData,
}: IndexTypeSelectorProps) => {
  const [selectedIndexType, setSelectedIndexType] = useState<EuiComboBoxOptionOption<string>[]>([
    ACCELERATION_INDEX_TYPES[0],
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accelerationFormData.dataTable !== '') {
      setLoading(true);
      const idPrefix = htmlIdGenerator()();
      const query = {
        lang: 'sql',
        query: `DESC ${accelerationFormData.dataSource}.${accelerationFormData.database}.${accelerationFormData.dataTable}`,
        datasource: accelerationFormData.dataSource,
      };
      getJobId(query, http, (id: string) => {
        pollQueryStatus(id, http, (data: any[]) => {
          setAccelerationFormData({
            ...accelerationFormData,
            dataTableFields: [
              { id: `${idPrefix}1`, fieldName: 'Field1', dataType: 'Integer' },
              { id: `${idPrefix}2`, fieldName: 'Field2', dataType: 'Integer' },
              { id: `${idPrefix}3`, fieldName: 'Field3', dataType: 'Integer' },
              { id: `${idPrefix}4`, fieldName: 'Field4', dataType: 'Integer' },
              { id: `${idPrefix}5`, fieldName: 'Field5', dataType: 'Integer' },
              { id: `${idPrefix}6`, fieldName: 'Field6', dataType: 'Integer' },
              { id: `${idPrefix}7`, fieldName: 'Field7', dataType: 'Integer' },
              { id: `${idPrefix}8`, fieldName: 'Field8', dataType: 'Integer' },
              { id: `${idPrefix}9`, fieldName: 'Field9', dataType: 'Integer' },
              { id: `${idPrefix}10`, fieldName: 'Field10', dataType: 'Integer' },
              { id: `${idPrefix}11`, fieldName: 'Field11', dataType: 'Integer' },
              { id: `${idPrefix}12`, fieldName: 'Field12', dataType: 'TimestampType' },
            ],
          });
          setLoading(false);
        });
      });
    }
  }, [accelerationFormData.dataTable]);

  const onChangeIndexType = (indexTypeOption: EuiComboBoxOptionOption<string>[]) => {
    const indexType = indexTypeOption[0].value as AccelerationIndexType;
    setAccelerationFormData({
      ...accelerationFormData,
      accelerationIndexType: indexType,
      accelerationIndexName:
        indexType === 'skipping' ? ACCELERATION_DEFUALT_SKIPPING_INDEX_NAME : '',
    });
    setSelectedIndexType(indexTypeOption);
  };
  return (
    <>
      <EuiFormRow
        label="Index type"
        helpText="Select the type of index you want to create. Each index type has benefits and costs."
        labelAppend={
          <EuiText size="xs">
            <EuiLink href={ACC_INDEX_TYPE_DOCUMENTATION_URL} target="_blank">
              Help
            </EuiLink>
          </EuiText>
        }
      >
        <EuiComboBox
          placeholder="Select an index type"
          singleSelection={{ asPlainText: true }}
          options={ACCELERATION_INDEX_TYPES}
          selectedOptions={selectedIndexType}
          onChange={onChangeIndexType}
          isInvalid={selectedIndexType.length === 0}
          isClearable={false}
          isLoading={loading}
        />
      </EuiFormRow>
    </>
  );
};
