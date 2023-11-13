/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFieldNumber,
  EuiFieldText,
  EuiFormRow,
  EuiRadioGroup,
  EuiSelect,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import producer from 'immer';
import React, { ChangeEvent, useState } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { ACCELERATION_TIME_INTERVAL } from '../../../../common/constants';
import { CreateAccelerationForm } from '../../../../common/types';
import {
  hasError,
  validateCheckpointLocation,
  validatePrimaryShardCount,
  validateRefreshInterval,
  validateReplicaCount,
} from '../create/utils';
import { IndexTypeSelector } from './index_type_selector';

interface IndexSettingOptionsProps {
  http: CoreStart['http'];
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const IndexSettingOptions = ({
  http,
  accelerationFormData,
  setAccelerationFormData,
}: IndexSettingOptionsProps) => {
  const autoRefreshId = 'refresh-option-1';
  const intervalRefreshId = 'refresh-option-2';
  const refreshOptions = [
    {
      id: autoRefreshId,
      label: 'Auto Refresh',
    },
    {
      id: intervalRefreshId,
      label: 'Refresh by interval',
    },
  ];

  const [primaryShards, setPrimaryShards] = useState(1);
  const [replicaCount, setReplicaCount] = useState(1);
  const [refreshTypeSelected, setRefreshTypeSelected] = useState(autoRefreshId);
  const [refreshWindow, setRefreshWindow] = useState(1);
  const [refreshInterval, setRefreshInterval] = useState(ACCELERATION_TIME_INTERVAL[1].value);
  const [checkpoint, setCheckpoint] = useState('');

  const onChangePrimaryShards = (e: ChangeEvent<HTMLInputElement>) => {
    const countPrimaryShards = parseInt(e.target.value, 10);
    setAccelerationFormData({ ...accelerationFormData, primaryShardsCount: countPrimaryShards });
    setPrimaryShards(countPrimaryShards);
  };

  const onChangeReplicaCount = (e: ChangeEvent<HTMLInputElement>) => {
    const replicaCount = parseInt(e.target.value, 10);
    setAccelerationFormData({ ...accelerationFormData, replicaShardsCount: replicaCount });
    setReplicaCount(replicaCount);
  };

  const onChangeRefreshType = (optionId: React.SetStateAction<string>) => {
    setAccelerationFormData({
      ...accelerationFormData,
      refreshType: optionId === autoRefreshId ? 'auto' : 'interval',
    });
    setRefreshTypeSelected(optionId);
  };

  const onChangeRefreshWindow = (e: ChangeEvent<HTMLInputElement>) => {
    const windowCount = parseInt(e.target.value, 10);
    setAccelerationFormData(
      producer((accData) => {
        accData.refreshIntervalOptions.refreshWindow = windowCount;
      })
    );
    setRefreshWindow(windowCount);
  };

  const onChangeRefreshInterval = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const refreshIntervalValue = e.target.value;
    setAccelerationFormData(
      producer((accData) => {
        accData.refreshIntervalOptions.refreshInterval = refreshIntervalValue;
      })
    );
    setRefreshInterval(refreshIntervalValue);
  };

  const onChangeCheckpoint = (e: ChangeEvent<HTMLInputElement>) => {
    const checkpointLocation = e.target.value;
    setAccelerationFormData({ ...accelerationFormData, checkpointLocation: checkpointLocation });
    setCheckpoint(checkpointLocation);
  };

  return (
    <>
      <EuiText data-test-subj="index-settings-header">
        <h3>Index settings</h3>
      </EuiText>
      <EuiSpacer size="s" />
      <IndexTypeSelector
        http={http}
        accelerationFormData={accelerationFormData}
        setAccelerationFormData={setAccelerationFormData}
      />
      <EuiFormRow
        label="Number of primary shards"
        helpText="Specify the number of primary shards for the index. Default is 1. The number of primary shards cannot be changed after the index is created."
        isInvalid={hasError(accelerationFormData.formErrors, 'primaryShardsError')}
        error={accelerationFormData.formErrors.primaryShardsError}
      >
        <EuiFieldNumber
          placeholder="Number of primary shards"
          value={primaryShards}
          onChange={onChangePrimaryShards}
          aria-label="Number of primary shards"
          min={1}
          max={100}
          onBlur={(e) => {
            setAccelerationFormData(
              producer((accData) => {
                accData.formErrors.primaryShardsError = validatePrimaryShardCount(
                  parseInt(e.target.value, 10)
                );
              })
            );
          }}
          isInvalid={hasError(accelerationFormData.formErrors, 'primaryShardsError')}
        />
      </EuiFormRow>
      <EuiFormRow
        label="Number of replicas"
        helpText="Specify the number of replicas each primary shard should have. Default is 1."
        isInvalid={hasError(accelerationFormData.formErrors, 'replicaShardsError')}
        error={accelerationFormData.formErrors.replicaShardsError}
      >
        <EuiFieldNumber
          placeholder="Number of replicas"
          value={replicaCount}
          onChange={onChangeReplicaCount}
          aria-label="Number of replicas"
          min={0}
          max={100}
          onBlur={(e) => {
            setAccelerationFormData(
              producer((accData) => {
                accData.formErrors.replicaShardsError = validateReplicaCount(
                  parseInt(e.target.value, 10)
                );
              })
            );
          }}
          isInvalid={hasError(accelerationFormData.formErrors, 'replicaShardsError')}
        />
      </EuiFormRow>
      <EuiFormRow
        label="Refresh type"
        helpText="Specify how often the index should refresh, which publishes the most recent changes and make them available for search. Default is set to auto refresh when data at the source changes."
      >
        <EuiRadioGroup
          options={refreshOptions}
          idSelected={refreshTypeSelected}
          onChange={onChangeRefreshType}
          name="refresh type radio group"
        />
      </EuiFormRow>
      {refreshTypeSelected === intervalRefreshId && (
        <EuiFormRow
          label="Refresh interval"
          helpText="Specify how often the index should refresh, which publishes the most recent changes and make them available for search"
          isInvalid={hasError(accelerationFormData.formErrors, 'refreshIntervalError')}
          error={accelerationFormData.formErrors.refreshIntervalError}
        >
          <EuiFieldNumber
            placeholder="Refresh interval"
            value={refreshWindow}
            onChange={onChangeRefreshWindow}
            aria-label="Refresh interval"
            min={1}
            isInvalid={hasError(accelerationFormData.formErrors, 'refreshIntervalError')}
            onBlur={(e) => {
              setAccelerationFormData(
                producer((accData) => {
                  accData.formErrors.refreshIntervalError = validateRefreshInterval(
                    refreshTypeSelected,
                    parseInt(e.target.value, 10)
                  );
                })
              );
            }}
            append={
              <EuiSelect
                value={refreshInterval}
                onChange={onChangeRefreshInterval}
                options={ACCELERATION_TIME_INTERVAL}
              />
            }
          />
        </EuiFormRow>
      )}
      <EuiFormRow
        label={
          accelerationFormData.accelerationIndexType === 'materialized'
            ? 'Checkpoint location'
            : 'Checkpoint location - optional'
        }
        helpText="The HDFS compatible file system location path for incremental refresh job checkpoint."
        isInvalid={hasError(accelerationFormData.formErrors, 'checkpointLocationError')}
        error={accelerationFormData.formErrors.checkpointLocationError}
      >
        <EuiFieldText
          placeholder="s3://checkpoint/location"
          value={checkpoint}
          onChange={onChangeCheckpoint}
          aria-label="Use aria labels when no actual label is in use"
          isInvalid={hasError(accelerationFormData.formErrors, 'checkpointLocationError')}
          onBlur={(e) => {
            setAccelerationFormData(
              producer((accData) => {
                accData.formErrors.checkpointLocationError = validateCheckpointLocation(
                  accData.accelerationIndexType,
                  e.target.value
                );
              })
            );
          }}
        />
      </EuiFormRow>
    </>
  );
};
