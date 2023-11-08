/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiDescriptionList,
  EuiDescriptionListDescription,
  EuiDescriptionListTitle,
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
  EuiText,
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
                  <h2>{indexName}</h2>
                </EuiTitle>
              </EuiPageHeaderSection>
            </EuiPageHeader>
          </div>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiText>
            <h3>Acceleration index source</h3>
          </EuiText>
          <EuiHorizontalRule margin="s" />
          <EuiDescriptionList>
            <EuiDescriptionListTitle>Data Source</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>{dataSource}</EuiDescriptionListDescription>
            <EuiDescriptionListTitle>Database</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>{database}</EuiDescriptionListDescription>
            <EuiDescriptionListTitle>Data Table</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>{dataTable}</EuiDescriptionListDescription>
          </EuiDescriptionList>
          <EuiSpacer size="xl" />
          <EuiText>
            <h3>Acceleration index destination</h3>
          </EuiText>
          <EuiHorizontalRule margin="s" />
          <EuiDescriptionList>
            <EuiDescriptionListTitle>OpenSearch Index</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
              {indexName === 'skipping_index'
                ? `flint_${dataSource}_${database}_${dataTable}_skipping_index`
                : `flint_${dataSource}_${database}_${dataTable}_${indexName}_index`}
            </EuiDescriptionListDescription>
          </EuiDescriptionList>
          <EuiSpacer size="xl" />
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty iconType="cross" onClick={resetFlyout} flush="left">
                Close
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup>
                <EuiFlexItem grow={false}>
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
                <EuiFlexItem grow={false}>
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
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    </>
  );
};
