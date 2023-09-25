/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBox,
  EuiExpression,
  EuiPopover,
  EuiPopoverTitle,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import React, { useState } from 'react';
import { CreateAccelerationForm } from '../../../../../common/types';
import _ from 'lodash';

interface CoveringIndexBuilderProps {
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const CoveringIndexBuilder = ({
  accelerationFormData,
  setAccelerationFormData,
}: CoveringIndexBuilderProps) => {
  const [isPopOverOpen, setIsPopOverOpen] = useState(false);
  const [columnsValue, setColumnsValue] = useState('(add columns here)');
  const [selectedOptions, setSelected] = useState([]);

  const onChange = (selectedOptions: any[]) => {
    let expresseionValue = '(add columns here)';
    if (selectedOptions.length > 0) {
      expresseionValue =
        '(' +
        _.reduce(
          selectedOptions,
          function (columns, n, index) {
            const columnValue = columns + `${n.label}`;
            if (index !== selectedOptions.length - 1) return `${columnValue}, `;
            else return columnValue;
          },
          ''
        ) +
        ')';
    }
    setColumnsValue(expresseionValue);
    setSelected(selectedOptions);
  };

  return (
    <>
      <EuiText data-test-subj="covering-index-builder">
        <h3>Covering index definition</h3>
      </EuiText>
      <EuiSpacer size="s" />
      <EuiExpression
        description="CREATE INDEX"
        value={accelerationFormData.accelerationIndexName}
      />
      <EuiExpression description="ON" value={accelerationFormData.dataTable} />
      <EuiPopover
        id="popover1"
        button={
          <EuiExpression
            description=""
            value={columnsValue}
            isActive={isPopOverOpen}
            onClick={() => setIsPopOverOpen(true)}
          />
        }
        isOpen={isPopOverOpen}
        closePopover={() => setIsPopOverOpen(false)}
        panelPaddingSize="s"
        anchorPosition="downLeft"
      >
        <>
          <EuiPopoverTitle paddingSize="l">Columns</EuiPopoverTitle>
          <EuiComboBox
            placeholder="Select one or more options"
            options={accelerationFormData.dataTableFields.map((x) => {
              return { label: x.fieldName };
            })}
            selectedOptions={selectedOptions}
            onChange={onChange}
          />
        </>
      </EuiPopover>
    </>
  );
};
