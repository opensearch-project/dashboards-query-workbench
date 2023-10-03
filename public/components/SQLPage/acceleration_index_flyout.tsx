/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import React from 'react';

interface AccelerationIndexFlyoutProps {
  dataSource: string;
  database: string;
  dataTable: string;
  indexName: string;
  resetFlyout: () => void;
}

export const AccelerationIndexFlyout = ({
  dataSource,
  database,
  dataTable,
  indexName,
  resetFlyout,
}: AccelerationIndexFlyoutProps) => {
  return (
    <>
      <EuiFlyout ownFocus onClose={resetFlyout} aria-labelledby="flyoutTitle" size="m">
        <EuiFlyoutHeader hasBorder>
          <div>
            <EuiPageHeader>
              <EuiPageHeaderSection>
                <EuiTitle size="l" data-test-subj="acceleration-index-desc-header">
                  <h1>{indexName}</h1>
                </EuiTitle>
              </EuiPageHeaderSection>
            </EuiPageHeader>
          </div>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiFlexGroup>
            <EuiFlexItem>
              <h3>Data Source</h3>
              <EuiSpacer />
              <p>{dataSource}</p>
            </EuiFlexItem>
            <EuiFlexItem>
              <h3>Database</h3>
              <EuiSpacer />
              <p>{database}</p>
            </EuiFlexItem>
            <EuiFlexItem>
              <h3>Table</h3>
              <EuiSpacer />
              <p>{dataTable}</p>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty iconType="cross" onClick={resetFlyout} flush="left">
                Close
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    </>
  );
};
