/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
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
import { AsyncQueryStatus } from '../../../common/types';

interface AsyncQueryBodyProps {
  asyncLoadingStatus: AsyncQueryStatus;
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
          <EuiSmallButton onClick={closeModal} fill>
            Close
          </EuiSmallButton>
        </EuiModalFooter>
      </EuiModal>
    );
  }

  return (
    <EuiFlexGroup direction="column" alignItems="center">
      {asyncLoadingStatus === AsyncQueryStatus.Failed ? (
        <>
          <EuiIcon size="l" type="alert" color="danger" />
          <EuiText>
            <h3>Query failed</h3>
          </EuiText>
          <EuiText>The query failed to execute and the operation could not be complete.</EuiText>
          <EuiSmallButton onClick={() => showModal()}>View error details</EuiSmallButton>
          {modal}
        </>
      ) : (
        <>
          <EuiLoadingSpinner size="l" />
          <EuiText>
            <h3>Query running</h3>
          </EuiText>
          <EuiText>Status: {asyncLoadingStatus}</EuiText>
          {asyncLoadingStatus !== AsyncQueryStatus.Scheduled && (
            <EuiSmallButton onClick={cancelAsyncQuery}>Cancel</EuiSmallButton>
          )}
        </>
      )}
    </EuiFlexGroup>
  );
}
