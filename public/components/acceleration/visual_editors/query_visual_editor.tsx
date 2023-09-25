/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiSpacer } from '@elastic/eui';
import { CreateAccelerationForm } from '../../../../common/types';
import { IndexSettingOptions } from './index_setting_options';
import { SkippingIndexBuilder } from './skipping_index/skipping_index_builder';
import { CoveringIndexBuilder } from './covering_index/covering_index_builder';

interface QueryVisualEditorProps {
  accelerationFormData: CreateAccelerationForm;
  setAccelerationFormData: React.Dispatch<React.SetStateAction<CreateAccelerationForm>>;
}

export const QueryVisualEditor = ({
  accelerationFormData,
  setAccelerationFormData,
}: QueryVisualEditorProps) => {
  return (
    <>
      <IndexSettingOptions
        accelerationFormData={accelerationFormData}
        setAccelerationFormData={setAccelerationFormData}
      />
      <EuiSpacer size="l" />
      {accelerationFormData.accelerationIndexType === 'skipping' && (
        <SkippingIndexBuilder
          accelerationFormData={accelerationFormData}
          setAccelerationFormData={setAccelerationFormData}
        />
      )}
      {accelerationFormData.accelerationIndexType === 'covering' && (
        <CoveringIndexBuilder
          accelerationFormData={accelerationFormData}
          setAccelerationFormData={setAccelerationFormData}
        />
      )}
    </>
  );
};
