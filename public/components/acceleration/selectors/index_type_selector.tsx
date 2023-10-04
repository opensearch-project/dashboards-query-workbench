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
import {
  AccelerationIndexType,
  CreateAccelerationForm,
  DataTableFieldsType,
} from '../../../../common/types';
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
          const dataTableFields: DataTableFieldsType[] = data.map((field, index) => ({
            id: `${idPrefix}${index + 1}`,
            fieldName: field.col_name,
            dataType: field.data_type,
          }));
          setAccelerationFormData({
            ...accelerationFormData,
            dataTableFields: dataTableFields,
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
