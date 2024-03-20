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
}

export const CatalogTree = ({ selectedItems, updateSQLQueries, refreshTree }: CatalogTreeProps) => {
  return (
    <>
      {selectedItems !== undefined && selectedItems[0].label === 'OpenSearch' ? (
        <OSTree
          selectedItems={selectedItems}
          updateSQLQueries={updateSQLQueries}
          refreshTree={refreshTree}
        />
      ) : (
        <S3Tree
          dataSource={selectedItems[0].label}
          updateSQLQueries={updateSQLQueries}
          refreshTree={refreshTree}
        />
      )}
    </>
  );
};
