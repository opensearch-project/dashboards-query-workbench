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
          <h3>Acceleration index Source</h3>
          <EuiHorizontalRule />
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <h3>Data Source</h3>
              <EuiSpacer />
              <p>{dataSource}</p>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <h3>Database</h3>
              <EuiSpacer />
              <p>{database}</p>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <h3>Table</h3>
              <EuiSpacer />
              <p>{dataTable}</p>
            </EuiFlexItem>
          </EuiFlexGroup>
          <h3>Acceleration index destination</h3>
          <EuiHorizontalRule />
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
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
          <EuiHorizontalRule />
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <EuiButton iconSide="right" fill iconType="lensApp" onClick={updateDescribeQuery}>
                Describe Index
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton iconSide="right" iconType="trash" onClick={updateDropQuery} color="danger">
                Drop Index
              </EuiButton>
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
