/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSpacer,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlyoutFooter,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import React, { useState } from 'react';
import { CreateAccelerationHeader } from './create_acceleration_header';
import { CautionBannerCallout } from './caution_banner_callout';
import { AccelerationDataSourceSelector } from '../selectors/source_selector';
import { IndexTypeSelector } from '../selectors/index_type_selector';
import { CreateAccelerationForm } from '../../../../common/types/';
import { QueryVisualEditor } from '../visual_editors/query_visual_editor';
import { accelerationQueryBuilder } from '../visual_editors/query_builder';

export interface CreateAccelerationProps {
  dataSource: string;
  setIsFlyoutVisible(visible: boolean): void;
  updateQueries: (query: string) => void;
}

export const CreateAcceleration = ({
  dataSource,
  setIsFlyoutVisible,
  updateQueries,
}: CreateAccelerationProps) => {
  const [accelerationFormData, setAccelerationFormData] = useState<CreateAccelerationForm>({
    dataSource: '',
    dataTable: '',
    dataTableFields: [],
    accelerationIndexType: 'skipping',
    queryBuilderType: 'visual',
    skippingIndexQueryData: [],
    coveringIndexQueryData: '',
    materializedViewQueryData: '',
    accelerationIndexName: '',
    accelerationIndexAlias: '',
    primaryShardsCount: 5,
    replicaShardsCount: 1,
    refreshType: 'auto',
    refreshIntervalSeconds: undefined,
  });

  const copyToEditor = () => {
    updateQueries(accelerationQueryBuilder(accelerationFormData));
  };

  return (
    <>
      <EuiFlyout
        ownFocus
        onClose={() => setIsFlyoutVisible(false)}
        aria-labelledby="flyoutTitle"
        size="m"
      >
        <EuiFlyoutHeader hasBorder>
          <CreateAccelerationHeader />
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <CautionBannerCallout />
          <EuiSpacer size="l" />
          <AccelerationDataSourceSelector
            accelerationFormData={accelerationFormData}
            setAccelerationFormData={setAccelerationFormData}
          />
          <IndexTypeSelector
            accelerationFormData={accelerationFormData}
            setAccelerationFormData={setAccelerationFormData}
          />
          <EuiSpacer size="m" />
          <QueryVisualEditor
            accelerationFormData={accelerationFormData}
            setAccelerationFormData={setAccelerationFormData}
          />
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                iconType="cross"
                onClick={() => setIsFlyoutVisible(false)}
                flush="left"
              >
                Close
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                onClick={() => {
                  copyToEditor();
                  setIsFlyoutVisible(false);
                }}
                fill
              >
                Copy Query to Editor
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    </>
  );
};
