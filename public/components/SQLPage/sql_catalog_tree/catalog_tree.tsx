/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption, EuiEmptyPrompt, EuiFlexItem, EuiIcon } from '@elastic/eui';
import React from 'react';
import { OSTree } from './os_tree';
import { S3Tree } from './s3_tree';
import { CoreStart } from '../../../../../../src/core/public';

interface CatalogTreeProps {
  selectedItems: EuiComboBoxOptionOption[];
  updateSQLQueries: (query: string) => void;
  refreshTree: boolean;
  dataSourceEnabled: boolean;
  dataSourceMDSId: string;
  clusterTab: string;
  language: string;
  updatePPLQueries: (query: string) => void;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
}

export const CatalogTree = ({
  selectedItems,
  updateSQLQueries,
  refreshTree,
  dataSourceEnabled,
  dataSourceMDSId,
  clusterTab,
  language,
  updatePPLQueries,
  http,
  notifications,
}: CatalogTreeProps) => {
  return (
    <>
      {selectedItems !== undefined &&
      selectedItems[0].label === 'OpenSearch' &&
      clusterTab !== 'Data source Connections' ? (
        <OSTree
          selectedItems={selectedItems}
          updateSQLQueries={updateSQLQueries}
          refreshTree={refreshTree}
          dataSourceEnabled={dataSourceEnabled}
          dataSourceMDSId={dataSourceMDSId}
        />
      ) : selectedItems[0].label !== 'OpenSearch' && clusterTab === 'Data source Connections' ? (
        <S3Tree
          dataSource={selectedItems[0].label}
          updateSQLQueries={updateSQLQueries}
          refreshTree={refreshTree}
          dataSourceEnabled={dataSourceEnabled}
          dataSourceMDSId={dataSourceMDSId}
          language={language}
          updatePPLQueries={updatePPLQueries}
          http={http}
          notifications={notifications}
        />
      ) : (
        <EuiFlexItem grow={false}>
          <EuiEmptyPrompt
            icon={<EuiIcon type="database" size="m" />}
            iconColor="subdued"
            titleSize="xs"
            body={<p>Select a Data Source Connection to fetch Databases</p>}
          />
        </EuiFlexItem>
      )}
    </>
  );
};
