/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiSpacer,
} from '@elastic/eui';
import React, { useState } from 'react';
import { ACCELERATION_TIME_INTERVAL } from '../../../../common/constants';
import { CreateAccelerationForm } from '../../../../common/types/';
import { DefineIndexOptions } from '../selectors/define_index_options';
import { IndexSettingOptions } from '../selectors/index_setting_options';
import { AccelerationDataSourceSelector } from '../selectors/source_selector';
import { accelerationQueryBuilder } from '../visual_editors/query_builder';
import { QueryVisualEditor } from '../visual_editors/query_visual_editor';
import { CautionBannerCallout } from './caution_banner_callout';
import { CreateAccelerationHeader } from './create_acceleration_header';

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
    database: '',
    dataTableFields: [],
    accelerationIndexType: 'skipping',
    skippingIndexQueryData: [],
    coveringIndexQueryData: [],
    materializedViewQueryData: {
      columnsValues: [],
      groupByTumbleValue: {
        timeField: '',
        tumbleWindow: 0,
        tumbleInterval: '',
      },
    },
    accelerationIndexName: '',
    primaryShardsCount: 5,
    replicaShardsCount: 1,
    refreshType: 'auto',
    checkpointLocation: undefined,
    refreshIntervalOptions: {
      refreshWindow: 1,
      refreshInterval: ACCELERATION_TIME_INTERVAL[1].value,
    },
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
          <EuiSpacer size="xxl" />
          <IndexSettingOptions
            accelerationFormData={accelerationFormData}
            setAccelerationFormData={setAccelerationFormData}
          />
          <EuiSpacer size="xxl" />
          <DefineIndexOptions
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
