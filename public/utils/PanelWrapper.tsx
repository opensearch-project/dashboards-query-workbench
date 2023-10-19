/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiPanel } from '@elastic/eui';
import React from 'react';

export function PanelWrapper({
  shouldWrap,
  children,
}: {
  shouldWrap: boolean;
  children: React.ReactNode;
}) {
  return shouldWrap ? (
    <div style={{ padding: 25 }}>
      <EuiPanel paddingSize="none">{children}</EuiPanel>
    </div>
  ) : (
    <>{children}</>
  );
}
