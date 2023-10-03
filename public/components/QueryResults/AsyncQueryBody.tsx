/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlexGroup, EuiText, EuiLoadingSpinner } from '@elastic/eui';
import { AsyncQueryLoadingStatus } from '../../../common/types';
import React from 'react';

interface AsyncQueryBodyProps {
  asyncLoading: boolean;
  asyncLoadingStatus: AsyncQueryLoadingStatus;
}

export function AsyncQueryBody(props: AsyncQueryBodyProps) {
  const { asyncLoading, asyncLoadingStatus } = props;

  // TODO: implement query failure display
  // TODO: implement query cancellation

  return (
    <EuiFlexGroup direction="column" alignItems="center">
      <EuiLoadingSpinner size="l" />
      <EuiText>
        <h3>Query running</h3>
      </EuiText>
      <EuiText>stage: {asyncLoadingStatus}</EuiText>
    </EuiFlexGroup>
  );
}
