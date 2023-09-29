/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBox, EuiComboBoxOptionOption, EuiFormRow, EuiLink, EuiText } from '@elastic/eui';
import React, { useState } from 'react';
import {
  ACCELERATION_INDEX_TYPES,
  ACC_INDEX_TYPE_DOCUMENTATION_URL,
} from '../../../../common/constants';
import { AccelerationIndexType, CreateAccelerationForm } from '../../../../common/types';

interface IndexTypeSelectorProps {
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const IndexTypeSelector = ({
  accelerationFormData,
  setAccelerationFormData,
}: IndexTypeSelectorProps) => {
  const [selectedIndexType, setSelectedIndexType] = useState<EuiComboBoxOptionOption<string>[]>([
    ACCELERATION_INDEX_TYPES[0],
  ]);
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
          onChange={(indexType) => {
            setAccelerationFormData({
              ...accelerationFormData,
              accelerationIndexType: indexType[0].value as AccelerationIndexType,
            });
            setSelectedIndexType(indexType);
          }}
          isInvalid={selectedIndexType.length === 0}
          isClearable={false}
        />
      </EuiFormRow>
    </>
  );
};
