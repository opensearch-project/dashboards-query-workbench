/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, ChangeEvent } from 'react';
import { CreateAccelerationForm } from '../../../../common/types';
import {
  EuiFieldNumber,
  EuiFieldText,
  EuiFormRow,
  EuiRadioGroup,
  htmlIdGenerator,
} from '@elastic/eui';

const idPrefix = htmlIdGenerator()();

interface IndexSettingOptionsProps {
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const IndexSettingOptions = ({
  accelerationFormData,
  setAccelerationFormData,
}: IndexSettingOptionsProps) => {
  const refreshOptions = [
    {
      id: `${idPrefix}0`,
      label: 'Auto Refresh',
    },
    {
      id: `${idPrefix}1`,
      label: 'Refresh by interval',
    },
  ];
  const [indexName, setIndexName] = useState('');
  const [indexAlias, setIndexAlias] = useState('');
  const [primaryShards, setPrimaryShards] = useState(5);
  const [replicaCount, setReplicaCount] = useState(1);
  const [refreshTypeSelected, setRefreshTypeSelected] = useState(`${idPrefix}0`);
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState('1');

  const onChangeIndexName = (e: ChangeEvent<HTMLInputElement>) => {
    setAccelerationFormData({ ...accelerationFormData, accelerationIndexName: e.target.value });
    setIndexName(e.target.value);
  };

  const onChangeindexAlias = (e: ChangeEvent<HTMLInputElement>) => {
    setAccelerationFormData({ ...accelerationFormData, accelerationIndexAlias: e.target.value });
    setIndexAlias(e.target.value);
  };

  const onChangePrimaryShards = (e: ChangeEvent<HTMLInputElement>) => {
    setAccelerationFormData({ ...accelerationFormData, primaryShardsCount: +e.target.value });
    setPrimaryShards(+e.target.value);
  };

  const onChangeReplicaCount = (e: ChangeEvent<HTMLInputElement>) => {
    setAccelerationFormData({ ...accelerationFormData, replicaShardsCount: +e.target.value });
    setReplicaCount(+e.target.value);
  };

  const onChangeRefreshType = (optionId: React.SetStateAction<string>) => {
    setAccelerationFormData({
      ...accelerationFormData,
      refreshType: optionId === `${idPrefix}0` ? 'auto' : 'interval',
    });
    setRefreshTypeSelected(optionId);
  };

  const onChangeRefreshIntervalSeconds = (e: ChangeEvent<HTMLInputElement>) => {
    setAccelerationFormData({
      ...accelerationFormData,
      refreshIntervalSeconds: e.target.value + 's',
    });
    setRefreshIntervalSeconds(e.target.value);
  };

  return (
    <>
      <EuiFormRow
        label="Index name"
        helpText='Must be in lowercase letters. Cannot begin with underscores or hyphens. Spaces, commas, and characters :, ", *, +, /, , |, ?, #, > are not allowed. Skipping Index names are pre-generated and cannot be changed.'
      >
        <EuiFieldText
          placeholder="Enter Index Name"
          value={indexName}
          onChange={onChangeIndexName}
          aria-label="Enter Index Name"
        />
      </EuiFormRow>
      <EuiFormRow
        label="Index alias"
        helpText="Allow this index to be referenced by existing aliases or specify a new alias."
      >
        <EuiFieldText
          placeholder="Enter Index alias - Optional"
          value={indexAlias}
          onChange={(e) => onChangeindexAlias(e)}
          aria-label="Enter Index alias"
        />
      </EuiFormRow>
      <EuiFormRow
        label="Number of primary shards"
        helpText="Specify the number of primary shards for the index. Default is 5. 
        The number of primary shards cannot be changed after the index is created."
      >
        <EuiFieldNumber
          placeholder="Number of primary shards"
          value={primaryShards}
          onChange={(e) => onChangePrimaryShards(e)}
          aria-label="Number of primary shards"
          min={1}
          max={100}
        />
      </EuiFormRow>
      <EuiFormRow
        label="Number of replicas"
        helpText="Specify the number of replicas each primary shard should have. Default is 1."
      >
        <EuiFieldNumber
          placeholder="Number of replicas"
          value={replicaCount}
          onChange={onChangeReplicaCount}
          aria-label="Number of replicas"
          min={0}
          max={100}
        />
      </EuiFormRow>
      <EuiFormRow
        label="Refresh type"
        helpText="Indicate the refresh method required to update the data in acceleration index."
      >
        <EuiRadioGroup
          options={refreshOptions}
          idSelected={refreshTypeSelected}
          onChange={onChangeRefreshType}
          name="refresh type radio group"
        />
      </EuiFormRow>

      {refreshTypeSelected === `${idPrefix}1` && (
        <EuiFormRow
          label="Refresh interval"
          helpText="Specify how often the index should refresh, which publishes the most recent changes and make them available for search. Default is 1 second."
        >
          <EuiFieldNumber
            placeholder="Refresh interval"
            value={refreshIntervalSeconds}
            onChange={onChangeRefreshIntervalSeconds}
            aria-label="Refresh interval"
            append={'second(s)'}
            min={1}
          />
        </EuiFormRow>
      )}
    </>
  );
};
