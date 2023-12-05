/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiFlexGroup,
  EuiIcon,
  EuiLoadingSpinner,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiText,
} from '@elastic/eui';
import React, { useState } from 'react';
import { AsyncQueryLoadingStatus } from '../../../common/types';

interface AsyncQueryBodyProps {
  asyncLoadingStatus: AsyncQueryLoadingStatus;
  cancelAsyncQuery: () => void;
  asyncQueryError: string;
}

export function AsyncQueryBody(props: AsyncQueryBodyProps) {
  const { asyncLoadingStatus, cancelAsyncQuery, asyncQueryError } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);

  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  let modal;
  if (isModalVisible) {
    modal = (
      <EuiModal onClose={closeModal}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>Error</EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>{asyncQueryError}</EuiModalBody>

        <EuiModalFooter>
          <EuiButton onClick={closeModal} fill>
            Close
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    );
  }

  return (
    <EuiFlexGroup direction="column" alignItems="center">
      {asyncLoadingStatus === 'failed' ? (
        <>
          <EuiIcon size="l" type="alert" color="danger" />
          <EuiText>
            <h3>Query failed</h3>
          </EuiText>
          <EuiText>The query failed to execute and the operation could not be complete.</EuiText>
          <EuiButton onClick={() => showModal()}>View error details</EuiButton>
          {modal}
        </>
      ) : (
        <>
          <EuiLoadingSpinner size="l" />
          <EuiText>
            <h3>Query running</h3>
          </EuiText>
          <EuiText>Status: {asyncLoadingStatus}</EuiText>
          <EuiButton onClick={cancelAsyncQuery}>Cancel</EuiButton>
        </>
      )}
    </EuiFlexGroup>
  );
}
