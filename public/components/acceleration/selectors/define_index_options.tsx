/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiIconTip,
  EuiLink,
  EuiMarkdownFormat,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
  EuiHorizontalRule,
} from '@elastic/eui';
import { CreateAccelerationForm } from '../../../../common/types';
import { validateIndexName } from '../create/utils';
import { ACCELERATION_INDEX_NAME_INFO } from '../../../../common/constants';

interface DefineIndexOptionsProps {
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const DefineIndexOptions = ({
  accelerationFormData,
  setAccelerationFormData,
}: DefineIndexOptionsProps) => {
  const [indexName, setIndexName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  let modal;

  if (isModalVisible) {
    modal = (
      <EuiModal maxWidth={850} onClose={() => setIsModalVisible(false)}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <h1>Acceleration index naming</h1>
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <EuiMarkdownFormat>{ACCELERATION_INDEX_NAME_INFO}</EuiMarkdownFormat>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButton onClick={() => setIsModalVisible(false)} fill>
            Close
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    );
  }

  const onChangeIndexName = (e: ChangeEvent<HTMLInputElement>) => {
    setAccelerationFormData({ ...accelerationFormData, accelerationIndexName: e.target.value });
    setIndexName(e.target.value);
  };

  useEffect(() => {
    accelerationFormData.accelerationIndexType === 'skipping'
      ? setIndexName('skipping')
      : setIndexName('');
  }, [accelerationFormData.accelerationIndexType]);

  const getPreprend = () => {
    const dataSource =
      accelerationFormData.dataSource !== ''
        ? accelerationFormData.dataSource
        : '{Datasource Name}';
    const database =
      accelerationFormData.database !== '' ? accelerationFormData.database : '{Database Name}';
    const dataTable =
      accelerationFormData.dataTable !== '' ? accelerationFormData.dataTable : '{Table Name}';
    const prependValue = `flint_${dataSource}_${database}_${dataTable}_`;
    return [
      prependValue,
      <EuiIconTip type="iInCircle" color="subdued" content={prependValue} position="top" />,
    ];
  };

  const getAppend = () => {
    const appendValue =
      accelerationFormData.accelerationIndexType === 'materialized' ? '' : '_index';
    return appendValue;
  };

  return (
    <>
      <EuiText data-test-subj="define-index-header">
        <h3>Index settings</h3>
      </EuiText>
      <EuiSpacer size="s" />
      <EuiFormRow
        label="Index name"
        helpText='Must be in lowercase letters. Cannot begin with underscores or hyphens. Spaces, commas, and characters :, ", *, +, /, \, |, ?, #, >, or < are not allowed. 
        Prefix and suffix are added to the name of generated OpenSearch index.'
        labelAppend={
          <EuiText size="xs">
            <EuiLink onClick={() => setIsModalVisible(true)}>Help</EuiLink>
          </EuiText>
        }
      >
        <EuiFieldText
          placeholder="Enter index name"
          value={indexName}
          onChange={onChangeIndexName}
          aria-label="Enter Index Name"
          prepend={getPreprend()}
          append={getAppend()}
          disabled={accelerationFormData.accelerationIndexType === 'skipping'}
          isInvalid={validateIndexName(indexName)}
        />
      </EuiFormRow>
      {modal}
    </>
  );
};
