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
import React, { useEffect, useState } from 'react';
import { AccelerationIndexType } from '../../../common/types';

interface AccelerationIndexFlyoutProps {
  accelerationIndexType: AccelerationIndexType;
  dataSource: string;
  database: string;
  dataTable: string;
  indexName?: string;
  resetFlyout: () => void;
  updateSQLQueries: (query: string) => void;
}

export const AccelerationIndexFlyout = ({
  accelerationIndexType,
  dataSource,
  database,
  dataTable,
  indexName,
  resetFlyout,
  updateSQLQueries,
}: AccelerationIndexFlyoutProps) => {
  const [indexMetaData, setindexMetaData] = useState({
    describeQuery: '',
    dropQuery: '',
    indexName: '',
    contextType: '',
  });

  const generateQueryAndIndexName = () => {
    let accelerationQuery = '';
    let generatedIndexName = '';

    switch (accelerationIndexType) {
      case 'skipping':
        accelerationQuery = `SKIPPING INDEX ON ${dataSource}.${database}.${dataTable}`;
        generatedIndexName = `flint_${dataSource}_${database}_${dataTable}_skipping_index`;
        break;
      case 'covering':
        accelerationQuery = `INDEX ${indexName} ON ${dataSource}.${database}.${dataTable}`;
        generatedIndexName = `flint_${dataSource}_${database}_${dataTable}_${indexName}_index`;
        break;
      case 'materialized':
        accelerationQuery = `MATERIALIZED VIEW ${dataSource}.${database}.${dataTable}`;
        generatedIndexName = `flint_${dataSource}_${database}_${dataTable}`;
        break;
    }

    return {
      describeQuery: accelerationQuery ? `DESC ${accelerationQuery}` : accelerationQuery,
      dropQuery: accelerationQuery ? `DROP ${accelerationQuery}` : accelerationQuery,
      indexName: generatedIndexName,
      contextType: accelerationIndexType === 'materialized' ? 'view' : 'index',
    };
  };

  const updateDescribeQuery = () => {
    updateSQLQueries(indexMetaData.describeQuery);
    resetFlyout();
  };

  const updateDropQuery = () => {
    updateSQLQueries(indexMetaData.dropQuery);
    resetFlyout();
  };

  useEffect(() => {
    setindexMetaData(generateQueryAndIndexName());
  }, []);

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
            <h3>{`Acceleration ${indexMetaData.contextType} source`}</h3>
          </EuiText>
          <EuiHorizontalRule margin="s" />
          <EuiDescriptionList>
            <EuiDescriptionListTitle>Data Source</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>{dataSource}</EuiDescriptionListDescription>
            <EuiDescriptionListTitle>Database</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>{database}</EuiDescriptionListDescription>
            {accelerationIndexType !== 'materialized' && (
              <>
                <EuiDescriptionListTitle>Data Table</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>{dataTable}</EuiDescriptionListDescription>
              </>
            )}
            <EuiDescriptionListTitle>Acceleration Type</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>{accelerationIndexType}</EuiDescriptionListDescription>
          </EuiDescriptionList>
          <EuiSpacer size="xl" />
          <EuiText>
            <h3>{`Acceleration ${indexMetaData.contextType} destination`}</h3>
          </EuiText>
          <EuiHorizontalRule margin="s" />
          <EuiDescriptionList>
            <EuiDescriptionListTitle>OpenSearch Index</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>{indexMetaData.indexName}</EuiDescriptionListDescription>
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
                    {`Describe ${indexMetaData.contextType}`}
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
                    {`Drop ${indexMetaData.contextType}`}
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
