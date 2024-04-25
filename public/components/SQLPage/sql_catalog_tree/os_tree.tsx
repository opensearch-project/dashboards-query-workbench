/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiText,
  EuiTreeView,
} from '@elastic/eui';
import React, { useEffect, useState } from 'react';
import { getTreeContent } from './os_tree_helpers';

interface OSTreeProps {
  selectedItems: EuiComboBoxOptionOption[];
  updateSQLQueries: (query: string) => void;
  refreshTree: boolean;
  dataSourceEnabled: boolean;
  dataSourceMDSId: string;
}
export const OSTree = ({ selectedItems, updateSQLQueries, refreshTree, dataSourceEnabled, dataSourceMDSId }: OSTreeProps) => {
  const [treeData, setTreeData] = useState<Node[]>([]);
  const [isTreeLoading, setIsTreeLoading] = useState({
    status: false,
    message: '',
  });

  const loadtree = async () => {
    setTreeData([]);
    setIsTreeLoading({
      status: true,
      message: '',
    });
    const { treeContent, loadingStatus } = await getTreeContent(selectedItems, dataSourceEnabled, dataSourceMDSId);
    setTreeData(treeContent);
    setIsTreeLoading({ ...loadingStatus });
  };

  const treeLoadingStateRenderer = (
    <EuiFlexGroup alignItems="center" gutterSize="s" direction="column">
      <EuiSpacer />
      <EuiFlexItem>
        <EuiLoadingSpinner size="l" />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>Loading indices</EuiFlexItem>
    </EuiFlexGroup>
  );

  const treeViewRenderer =
    treeData.length === 0 ? (
      <EuiFlexGroup alignItems="center" gutterSize="s" direction="column">
        <EuiSpacer />
        <EuiFlexItem>
          <EuiIcon type="database" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>No indices found</EuiFlexItem>
      </EuiFlexGroup>
    ) : (
      <EuiTreeView
        aria-label="OpenSearch Folder Tree"
        data-test-subj="opensearch-tree"
        items={treeData}
      />
    );

  const treeStateRenderer =
    isTreeLoading.message === '' ? (
      treeViewRenderer
    ) : (
      <EuiFlexGroup alignItems="center" gutterSize="s" direction="column">
        <EuiSpacer />
        <EuiFlexItem>
          <EuiIcon type="alert" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>Failed to load indices</EuiFlexItem>
        <EuiFlexItem grow={false}>
          <div style={{ padding: '10px' }}>
            <EuiFlexItem>
              <EuiText textAlign="center" color="subdued">
                {isTreeLoading.message}
              </EuiText>
            </EuiFlexItem>
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
    );

  const treeRenderer = (
    <>
      {isTreeLoading.status && isTreeLoading.message === ''
        ? treeLoadingStateRenderer
        : treeStateRenderer}
    </>
  );

  useEffect(() => {
    loadtree();
  }, [selectedItems, refreshTree, dataSourceMDSId]);

  return <div>{treeRenderer}</div>;
};
