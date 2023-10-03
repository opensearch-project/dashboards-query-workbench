/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlexGroup, EuiText, EuiLoadingSpinner, EuiButton } from '@elastic/eui';
import { AsyncQueryLoadingStatus } from '../../../common/types';
import React from 'react';

interface AsyncQueryBodyProps {
  asyncLoading: boolean;
  asyncLoadingStatus: AsyncQueryLoadingStatus;
  cancelAsyncQuery: () => void;
}

export function AsyncQueryBody(props: AsyncQueryBodyProps) {
  const { asyncLoading, asyncLoadingStatus, cancelAsyncQuery } = props;

  // TODO: implement query failure display
  // TODO: implement query cancellation

  return (
    <EuiFlexGroup direction="column" alignItems="center">
      <EuiLoadingSpinner size="l" />
      <EuiText>
        <h3>Query running</h3>
      </EuiText>
      <EuiText>status: {asyncLoadingStatus}</EuiText>
      <EuiButton onClick={cancelAsyncQuery}>Cancel</EuiButton>
    </EuiFlexGroup>
  );
}
