/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexGroup,
  EuiText,
  EuiLoadingSpinner,
  EuiButton,
  EuiIcon,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
} from '@elastic/eui';
import { AsyncQueryLoadingStatus } from '../../../common/types';
import React, { useState } from 'react';

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
      {asyncLoadingStatus == 'FAILED' ? (
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
