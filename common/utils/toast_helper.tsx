/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiCodeBlock,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
} from '@elastic/eui';
import React from 'react';
import { MountPoint, ToastInputFields } from '../../../../src/core/public';
import { toMountPoint } from '../../../../src/plugins/opensearch_dashboards_react/public';
import { coreRefs } from '../../public/framework/core_refs';

type Color = 'success' | 'primary' | 'warning' | 'danger' | undefined;

export const useToast = () => {
  const toasts = coreRefs.toasts!;

  const setToast = (title: string, color: Color = 'success', text?: string | MountPoint) => {
    const newToast: ToastInputFields = {
      id: new Date().toISOString(),
      title,
      text,
    };
    switch (color) {
      case 'danger': {
        toasts.addDanger(newToast);
        break;
      }
      case 'warning': {
        toasts.addWarning(newToast);
        break;
      }
      default: {
        toasts.addSuccess(newToast);
        break;
      }
    }
  };

  return { setToast };
};

const loadErrorModal = (errorDetailsMessage: string) => {
  const openModal = coreRefs.overlays?.openModal!;
  const modal = openModal(
    toMountPoint(
      <EuiModal onClose={() => modal.close()}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>Error details</EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiCodeBlock language="json" fontSize="m" paddingSize="m" isCopyable>
            {errorDetailsMessage}
          </EuiCodeBlock>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiSmallButton onClick={() => modal.close()}>Close</EuiSmallButton>
        </EuiModalFooter>
      </EuiModal>
    )
  );
};

export const RaiseErrorToast = ({
  errorToastMessage,
  errorDetailsMessage,
}: {
  errorToastMessage: string;
  errorDetailsMessage: string;
}) => {
  const { setToast } = useToast();
  setToast(
    errorToastMessage,
    'danger',
    toMountPoint(
      <EuiSmallButton color="danger" size="s" onClick={() => loadErrorModal(errorDetailsMessage)}>
        Error details
      </EuiSmallButton>
    )
  );

  return <></>;
};
