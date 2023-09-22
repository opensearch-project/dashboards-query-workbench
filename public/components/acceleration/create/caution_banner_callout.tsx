/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCallOut } from '@elastic/eui';
import React from 'react';

export const CautionBannerCallout = () => {
  return (
    <EuiCallOut title="Considerations for data indexing" color="warning" iconType="iInCircle">
      <p>
        Warning about not indexing personal or sensitive data, something about the cost of indexing.
      </p>
    </EuiCallOut>
  );
};
