/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, useState } from 'react';
import {
  EuiPopover,
  EuiButtonEmpty,
  EuiPopoverTitle,
  EuiPopoverFooter,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiFormRow,
  EuiComboBox,
  htmlIdGenerator,
  EuiSpacer,
} from '@elastic/eui';

import {
  AggregationFunctionType,
  CreateAccelerationForm,
  MaterializedViewColumn,
} from '../../../../../common/types';
import { ACCELERATION_AGGREGRATION_FUNCTIONS } from '../../../../../common/constants';
import { useEffect } from 'react';
import _ from 'lodash';

interface AddColumnPopOverProps {
  isColumnPopOverOpen: boolean;
  setIsColumnPopOverOpen: React.Dispatch<React.SetStateAction<boolean>>;
  columnExpressionValues: MaterializedViewColumn[];
  setColumnExpressionValues: React.Dispatch<React.SetStateAction<MaterializedViewColumn[]>>;
  accelerationFormData: CreateAccelerationForm;
}

export const AddColumnPopOver = ({
  isColumnPopOverOpen,
  setIsColumnPopOverOpen,
  columnExpressionValues,
  setColumnExpressionValues,
  accelerationFormData,
}: AddColumnPopOverProps) => {
  const [selectedFunction, setSelectedFunction] = useState([
    ACCELERATION_AGGREGRATION_FUNCTIONS[0],
  ]);
  const [selectedField, setSelectedField] = useState([]);
  const [selectedAlias, setSeletedAlias] = useState('');

  const resetSelectedField = () => {
    if (accelerationFormData.dataTableFields.length > 0) {
      const defaultFieldName = accelerationFormData.dataTableFields[0].fieldName;
      setSelectedField([{ label: defaultFieldName }]);
    }
  };

  const resetValues = () => {
    setSelectedFunction([ACCELERATION_AGGREGRATION_FUNCTIONS[0]]);
    resetSelectedField();
    setSeletedAlias('');
  };

  const onChangeAlias = (e: ChangeEvent<HTMLInputElement>) => {
    setSeletedAlias(e.target.value);
  };

  useEffect(() => {
    resetSelectedField();
  }, []);

  return (
    <EuiPopover
      panelPaddingSize="s"
      button={
        <EuiButtonEmpty
          iconType="plusInCircle"
          aria-label="add column"
          onClick={() => {
            resetValues();
            setIsColumnPopOverOpen(!isColumnPopOverOpen);
          }}
          size="xs"
        >
          Add Column
        </EuiButtonEmpty>
      }
      isOpen={isColumnPopOverOpen}
      closePopover={() => setIsColumnPopOverOpen(false)}
    >
      <EuiPopoverTitle>Add Column</EuiPopoverTitle>
      <>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFormRow label="Aggregate function">
              <EuiComboBox
                singleSelection={{ asPlainText: true }}
                options={ACCELERATION_AGGREGRATION_FUNCTIONS}
                selectedOptions={selectedFunction}
                onChange={setSelectedFunction}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow label="Aggregation field">
              <EuiComboBox
                singleSelection={{ asPlainText: true }}
                options={[
                  { label: '*', disabled: selectedFunction[0].label !== 'count' },
                  ...accelerationFormData.dataTableFields.map((x) => ({ label: x.fieldName })),
                ]}
                selectedOptions={selectedField}
                onChange={setSelectedField}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiFormRow label="Column alias - optional">
          <EuiFieldText name="aliasField" onChange={onChangeAlias} />
        </EuiFormRow>
      </>
      <EuiPopoverFooter>
        <EuiButton
          size="s"
          fill
          onClick={() => {
            setColumnExpressionValues([
              ...columnExpressionValues,
              {
                id: htmlIdGenerator()(),
                functionName: selectedFunction[0].label as AggregationFunctionType,
                functionParam: selectedField[0].label,
                fieldAlias: selectedAlias,
              },
            ]);
            setIsColumnPopOverOpen(false);
          }}
        >
          Add
        </EuiButton>
      </EuiPopoverFooter>
    </EuiPopover>
  );
};
