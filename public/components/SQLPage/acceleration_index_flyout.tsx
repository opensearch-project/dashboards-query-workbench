/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiHorizontalRule,
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
  updateSQLQueries: (query: string) => void;
}

export const AccelerationIndexFlyout = ({
  dataSource,
  database,
  dataTable,
  indexName,
  resetFlyout,
  updateSQLQueries,
}: AccelerationIndexFlyoutProps) => {
  const updateDescribeQuery = () => {
    const describeQuery =
      indexName === 'skipping_index'
        ? `DESC SKIPPING INDEX ON ${dataSource}.${database}.${dataTable}`
        : `DESC INDEX ${indexName} ON ${dataSource}.${database}.${dataTable}`;
    updateSQLQueries(describeQuery);
    resetFlyout();
  };

  const updateDropQuery = () => {
    const describeQuery =
      indexName === 'skipping_index'
        ? `DROP SKIPPING INDEX ON ${dataSource}.${database}.${dataTable}`
        : `DROP INDEX ${indexName} ON ${dataSource}.${database}.${dataTable}`;
    updateSQLQueries(describeQuery);
    resetFlyout();
  };

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
          <h2>Acceleration index Source</h2>
          <EuiHorizontalRule margin="s" />
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
          <h3>Acceleration index destination</h3>
          <EuiHorizontalRule margin="s" />
          <EuiFlexGroup>
            <EuiFlexItem>
              <h3>OpenSearch Index</h3>
              <EuiSpacer />
              <p>
                {indexName === 'skipping_index'
                  ? `flint_${dataSource}_${database}_${dataTable}_skipping_index`
                  : `flint_${dataSource}_${database}_${dataTable}_${indexName}_index`}
              </p>
            </EuiFlexItem>
          </EuiFlexGroup>
          <h3>Acceleration index actions</h3>
          <EuiHorizontalRule margin="s" />
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiButton
                iconSide="right"
                fill
                iconType="lensApp"
                onClick={updateDescribeQuery}
                size="s"
              >
                Describe Index
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiButton
                iconSide="right"
                iconType="trash"
                onClick={updateDropQuery}
                color="danger"
                size="s"
              >
                Drop Index
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup>
            <EuiFlexItem>
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
