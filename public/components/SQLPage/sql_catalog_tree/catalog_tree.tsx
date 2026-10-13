/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption, EuiEmptyPrompt, EuiFlexItem, EuiIcon } from '@elastic/eui';
import React from 'react';
import { useCapabilities } from '../../../framework/capabilities_context';
import { OSTree } from './os_tree';
import { S3Tree } from './s3_tree';

interface CatalogTreeProps {
  selectedItems: EuiComboBoxOptionOption[];
  updateSQLQueries: (query: string) => void;
  refreshTree: boolean;
  dataSourceEnabled: boolean;
  dataSourceMDSId: string;
  clusterTab: string;
  language: string;
  updatePPLQueries: (query: string) => void;
}

const DATA_SOURCE_CONNECTIONS_TAB = 'Data source Connections';
const OPENSEARCH_DATASOURCE_LABEL = 'OpenSearch';

const SelectConnectionPrompt = () => (
  <EuiFlexItem grow={false}>
    <EuiEmptyPrompt
      icon={<EuiIcon type="database" size="m" />}
      iconColor="subdued"
      titleSize="xs"
      body={<p>Select a Data Source Connection to fetch Databases</p>}
    />
  </EuiFlexItem>
);

const UnsupportedCatalogPrompt = () => (
  <EuiFlexItem grow={false}>
    <EuiEmptyPrompt
      icon={<EuiIcon type="database" size="m" />}
      iconColor="subdued"
      titleSize="xs"
      body={<p>Catalog browsing is not supported on this OpenSearch version.</p>}
    />
  </EuiFlexItem>
);

export const CatalogTree = ({
  selectedItems,
  updateSQLQueries,
  refreshTree,
  dataSourceEnabled,
  dataSourceMDSId,
  clusterTab,
  language,
  updatePPLQueries,
}: CatalogTreeProps) => {
  const caps = useCapabilities();

  const isOpenSearch = selectedItems?.[0]?.label === OPENSEARCH_DATASOURCE_LABEL;
  const isDataSourceTab = clusterTab === DATA_SOURCE_CONNECTIONS_TAB;

  // Local cluster index browsing — runs against the host OpenSearch directly.
  if (selectedItems !== undefined && isOpenSearch && !isDataSourceTab) {
    return (
      <OSTree
        selectedItems={selectedItems}
        updateSQLQueries={updateSQLQueries}
        refreshTree={refreshTree}
        dataSourceEnabled={dataSourceEnabled}
        dataSourceMDSId={dataSourceMDSId}
      />
    );
  }

  // S3 / Flint catalog browsing — needs obs 2.13+ catalog-cache APIs and a
  // non-OpenSearch datasource pick on the S3 tab.
  if (selectedItems !== undefined && !isOpenSearch && isDataSourceTab) {
    if (!caps.hasCatalogCache) {
      return <UnsupportedCatalogPrompt />;
    }
    return (
      <S3Tree
        dataSource={selectedItems[0].label}
        updateSQLQueries={updateSQLQueries}
        refreshTree={refreshTree}
        dataSourceEnabled={dataSourceEnabled}
        dataSourceMDSId={dataSourceMDSId}
        language={language}
        updatePPLQueries={updatePPLQueries}
      />
    );
  }

  return <SelectConnectionPrompt />;
};
