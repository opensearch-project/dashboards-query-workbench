/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlexGroup, EuiText, EuiLoadingSpinner, EuiButton, EuiIcon } from '@elastic/eui';
import { AsyncQueryLoadingStatus } from '../../../common/types';
import React from 'react';

interface AsyncQueryBodyProps {
  asyncLoadingStatus: AsyncQueryLoadingStatus;
  cancelAsyncQuery: () => void;
  asyncQueryError: string;
}

export function AsyncQueryBody(props: AsyncQueryBodyProps) {
  const { asyncLoadingStatus, cancelAsyncQuery, asyncQueryError } = props;

  // TODO: implement query failure display
  // TODO: implement query cancellation

  return (
    <EuiFlexGroup direction="column" alignItems="center">
      {asyncLoadingStatus == 'FAILED' ? (
        <>
          <EuiIcon size="l" type="alert" color="danger" />
          <EuiText>
            <h3>Query failed</h3>
          </EuiText>
          <EuiText>error: {asyncQueryError}</EuiText>
        </>
      ) : (
        <>
          <EuiLoadingSpinner size="l" />
          <EuiText>
            <h3>Query running</h3>
          </EuiText>
          <EuiText>status: {asyncLoadingStatus}</EuiText>
          <EuiButton onClick={cancelAsyncQuery}>Cancel</EuiButton>
        </>
      )}
    </EuiFlexGroup>
  );
}
