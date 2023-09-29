/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiExpression,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  htmlIdGenerator,
} from '@elastic/eui';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { CreateAccelerationForm, MaterializedViewColumn } from '../../../../../common/types';
import { AddColumnPopOver } from './add_column_popover';
import { ColumnExpression } from './column_expression';
import { GroupByTumbleExpression } from './group_by_tumble_expression';

interface MaterializedViewBuilderProps {
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

const newColumnExpressionId = htmlIdGenerator()();

export const MaterializedViewBuilder = ({
  accelerationFormData,
  setAccelerationFormData,
}: MaterializedViewBuilderProps) => {
  const [isColumnPopOverOpen, setIsColumnPopOverOpen] = useState(false);
  const [columnExpressionValues, setColumnExpressionValues] = useState<MaterializedViewColumn[]>(
    []
  );

  useEffect(() => {
    if (accelerationFormData.dataTableFields.length > 0) {
      setColumnExpressionValues([
        {
          id: newColumnExpressionId,
          functionName: 'count',
          functionParam: accelerationFormData.dataTableFields[0].fieldName,
          fieldAlias: 'counter1',
        },
      ]);
    }
  }, [accelerationFormData.dataTableFields]);

  useEffect(() => {
    setAccelerationFormData({
      ...accelerationFormData,
      materializedViewQueryData: {
        ...accelerationFormData.materializedViewQueryData,
        columnsValues: columnExpressionValues,
      },
    });
  }, [columnExpressionValues]);

  return (
    <>
      <EuiText data-test-subj="covering-index-builder">
        <h3>Materialized view definition</h3>
      </EuiText>
      <EuiSpacer size="s" />
      <EuiExpression
        description="CREATE MATERIALIZED VIEW"
        value={`${accelerationFormData.dataSource}.${accelerationFormData.database}.${accelerationFormData.accelerationIndexName}`}
      />

      <EuiFlexItem grow={false}>
        <EuiExpression description="[IF NOT EXISTS]" value="" />
      </EuiFlexItem>

      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiExpression color="accent" description="AS SELECT" value="" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <AddColumnPopOver
            isColumnPopOverOpen={isColumnPopOverOpen}
            setIsColumnPopOverOpen={setIsColumnPopOverOpen}
            columnExpressionValues={columnExpressionValues}
            setColumnExpressionValues={setColumnExpressionValues}
            accelerationFormData={accelerationFormData}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup direction="column" gutterSize="s">
        {_.map(columnExpressionValues, (_, i) => {
          return (
            <ColumnExpression
              index={i}
              currentColumnExpressionValue={columnExpressionValues[i]}
              columnExpressionValues={columnExpressionValues}
              setColumnExpressionValues={setColumnExpressionValues}
              accelerationFormData={accelerationFormData}
            />
          );
        })}
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <EuiExpression
        description="FROM"
        value={`${accelerationFormData.dataSource}.${accelerationFormData.database}.${accelerationFormData.dataTable}`}
      />
      <EuiSpacer size="s" />
      <GroupByTumbleExpression
        accelerationFormData={accelerationFormData}
        setAccelerationFormData={setAccelerationFormData}
      />
    </>
  );
};
