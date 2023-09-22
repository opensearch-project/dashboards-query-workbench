/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiSpacer,
  EuiText,
  EuiLink,
} from '@elastic/eui';
import React from 'react';
import { OPENSEARCH_ACC_DOCUMENTATION_URL } from '../../../../common/constants';

export const CreateAccelerationHeader = () => {
  return (
    <div>
      <EuiPageHeader>
        <EuiPageHeaderSection>
          <EuiTitle size="l" data-test-subj="acceleration-header">
            <h1>Create Acceleration Index</h1>
          </EuiTitle>
        </EuiPageHeaderSection>
      </EuiPageHeader>
      <EuiSpacer size="s" />
      <EuiText size="s" color="subdued">
        Create OpenSearch Indexes from external data connections for better performance.{' '}
        <EuiLink external={true} href={OPENSEARCH_ACC_DOCUMENTATION_URL} target="_blank">
          Learn more
        </EuiLink>
      </EuiText>
    </div>
  );
};
