/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBox, EuiFormRow, EuiSpacer, EuiText } from '@elastic/eui';
import React, { useState } from 'react';
import { ACCELERATION_INDEX_TYPES } from '../../../../common/constants';
import { CreateAccelerationForm } from '../../../../common/types';

interface Indextypes {
  label: string;
  value: string;
}

interface IndexTypeSelectorProps {
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const IndexTypeSelector = ({
  accelerationFormData,
  setAccelerationFormData,
}: IndexTypeSelectorProps) => {
  const [selectedIndexType, setSelectedIndexType] = useState<Indextypes[]>([
    ACCELERATION_INDEX_TYPES[0],
  ]);
  return (
    <>
      <EuiText data-test-subj="index-type-selector-header">
        <h3>Define index</h3>
      </EuiText>
      <EuiSpacer size="s" />
      <EuiFormRow
        label="Index Type"
        helpText="Select the type of index you want to create. Each index type has benefits and costs."
      >
        <EuiComboBox
          placeholder="Acceleration Index Type"
          singleSelection={{ asPlainText: true }}
          options={ACCELERATION_INDEX_TYPES}
          selectedOptions={selectedIndexType}
          onChange={(indexType) => {
            setAccelerationFormData({
              ...accelerationFormData,
              accelerationIndexType: indexType[0].value,
            });
            setSelectedIndexType(indexType);
          }}
        />
      </EuiFormRow>
    </>
  );
};
