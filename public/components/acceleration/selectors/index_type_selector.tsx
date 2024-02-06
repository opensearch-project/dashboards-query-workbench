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
import { useToast } from '../../../../common/toast';
import {
  AccelerationIndexType,
  CreateAccelerationForm,
  DataTableFieldsType,
} from '../../../../common/types';
import { getJobId, pollQueryStatus } from '../../../../common/utils/async_query_helpers';

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
  const { setToast } = useToast();
  const [selectedIndexType, setSelectedIndexType] = useState<
    Array<EuiComboBoxOptionOption<string>>
  >([ACCELERATION_INDEX_TYPES[0]]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accelerationFormData.dataTable !== '') {
      setLoading(true);
      const idPrefix = htmlIdGenerator()();
      const query = {
        lang: 'sql',
        query: `DESC \`${accelerationFormData.dataSource}\`.\`${accelerationFormData.database}\`.\`${accelerationFormData.dataTable}\``,
        datasource: accelerationFormData.dataSource,
      };
      const errorMessage = 'ERROR: failed to load table columns';
      getJobId(accelerationFormData.dataSource, query, http, (id: string) => {
        if (id === undefined) {
          setToast(errorMessage, 'danger');
        } else {
          pollQueryStatus(id, http, (data: { status: string; results: any[] }) => {
            if (data.status === 'SUCCESS') {
              const dataTableFields: DataTableFieldsType[] = data.results
                .filter((row) => !row[0].startsWith('#'))
                .map((row, index) => ({
                  id: `${idPrefix}${index + 1}`,
                  fieldName: row[0],
                  dataType: row[1],
                }));
              setAccelerationFormData({
                ...accelerationFormData,
                dataTableFields,
              });
              setLoading(false);
            }
            if (data.status === 'FAILED') {
              setLoading(false);
              setToast(errorMessage, 'danger');
            }
          });
        }
      });
    }
  }, [accelerationFormData.dataTable]);

  const onChangeIndexType = (indexTypeOption: Array<EuiComboBoxOptionOption<string>>) => {
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
