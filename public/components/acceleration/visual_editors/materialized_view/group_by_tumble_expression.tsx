/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiExpression,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiPopover,
  EuiSelect,
} from '@elastic/eui';
import React, { useEffect, useState } from 'react';
import { ACCELERATION_TIME_INTERVAL } from '../../../../../common/constants';
import { CreateAccelerationForm, GroupByTumbleType } from '../../../../../common/types';
import { pluralizeTime } from '../../create/utils';

interface GroupByTumbleExpressionProps {
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const GroupByTumbleExpression = ({
  accelerationFormData,
  setAccelerationFormData,
}: GroupByTumbleExpressionProps) => {
  const [IsGroupPopOverOpen, setIsGroupPopOverOpen] = useState(false);
  const [groupbyValues, setGroupByValues] = useState<GroupByTumbleType>({
    timeField: '',
    tumbleWindow: 1,
    tumbleInterval: ACCELERATION_TIME_INTERVAL[0].value,
  });

  const onChangeTumbleWindow = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupByValues({ ...groupbyValues, tumbleWindow: +e.target.value });
  };

  const onChangeTumbleInterval = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupByValues({ ...groupbyValues, tumbleInterval: e.target.value });
  };

  const onChangeTimeField = (selectedOptions: EuiComboBoxOptionOption[]) => {
    if (selectedOptions.length > 0)
      setGroupByValues({ ...groupbyValues, timeField: selectedOptions[0].label });
  };

  useEffect(() => {
    setAccelerationFormData({
      ...accelerationFormData,
      materializedViewQueryData: {
        ...accelerationFormData.materializedViewQueryData,
        groupByTumbleValue: groupbyValues,
      },
    });
  }, [groupbyValues]);

  return (
    <EuiFlexItem grow={false}>
      <EuiPopover
        id="groupByTumblePopOver"
        button={
          <EuiExpression
            description="GROUP BY"
            value={`TUMBLE(${groupbyValues.timeField}, '${groupbyValues.tumbleWindow} ${
              groupbyValues.tumbleInterval
            }${pluralizeTime(groupbyValues.tumbleWindow)}')`}
            isActive={IsGroupPopOverOpen}
            onClick={() => setIsGroupPopOverOpen(true)}
            isInvalid={groupbyValues.timeField === ''}
          />
        }
        isOpen={IsGroupPopOverOpen}
        closePopover={() => setIsGroupPopOverOpen(false)}
        panelPaddingSize="s"
        anchorPosition="downLeft"
      >
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiFormRow label="Time Field">
              <EuiComboBox
                placeholder="Select one or more options"
                singleSelection={{ asPlainText: true }}
                options={accelerationFormData.dataTableFields
                  .filter((value) => value.dataType.includes('TimestampType'))
                  .map((value) => ({ label: value.fieldName }))}
                selectedOptions={[{ label: groupbyValues.timeField }]}
                onChange={onChangeTimeField}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFormRow label="Tumble Window">
              <EuiFieldNumber
                value={groupbyValues.tumbleWindow}
                onChange={onChangeTumbleWindow}
                min={1}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFormRow label="Tumble Interval">
              <EuiSelect
                value={groupbyValues.tumbleInterval}
                onChange={onChangeTumbleInterval}
                options={ACCELERATION_TIME_INTERVAL}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPopover>
    </EuiFlexItem>
  );
};
