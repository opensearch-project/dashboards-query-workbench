/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from '@elastic/eui';
import React from 'react';
import { OSTree } from './os_tree';
import { S3Tree } from './s3_tree';

interface CatalogTreeProps {
  selectedItems: EuiComboBoxOptionOption[];
  updateSQLQueries: (query: string) => void;
  refreshTree: boolean;
  dataSourceEnabled: boolean;
  selectedDataSourceId: string;
  clusterTab: string
}

export const CatalogTree = ({ selectedItems, updateSQLQueries, refreshTree, dataSourceEnabled, selectedDataSourceId, clusterTab}: CatalogTreeProps) => {
  return (
    <>
      {selectedItems !== undefined && selectedItems[0].label === 'OpenSearch' && clusterTab !== 'Data Connections'? (
        <OSTree
          selectedItems={selectedItems}
          updateSQLQueries={updateSQLQueries}
          refreshTree={refreshTree}
          dataSourceEnabled={dataSourceEnabled}
          dataSourceId={selectedDataSourceId}
        />
      ) : selectedItems[0].label !== 'OpenSearch' && (
        <S3Tree
          dataSource={selectedItems[0].label}
          updateSQLQueries={updateSQLQueries}
          refreshTree={refreshTree}
          dataSourceEnabled={dataSourceEnabled}
          dataSourceId={selectedDataSourceId}
        />
      )}
    </>
  );
};
