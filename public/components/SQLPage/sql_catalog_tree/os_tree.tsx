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
}
export const OSTree = ({ selectedItems, updateSQLQueries, refreshTree }: OSTreeProps) => {
  const [treeData, setTreeData] = useState<Node[]>([]);
  const [isTreeLoading, setIsTreeLoading] = useState({
    status: false,
    message: '',
  });

  const loadtree = async () => {
    setTreeData([]);
    setIsTreeLoading({
      status: true,
      message: 'Fetching associated objects ...',
    });
    const { treeContent, loadingStatus } = await getTreeContent(selectedItems);
    setTreeData(treeContent);
    setIsTreeLoading({ ...loadingStatus });
  };

  const treeLoadingStateRenderer = (
    <EuiFlexGroup alignItems="center" gutterSize="s" direction="column">
      <EuiSpacer />
      <EuiFlexItem>
        <EuiLoadingSpinner size="l" />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>Loading tree data</EuiFlexItem>
      <EuiFlexItem grow={false}>
        <div style={{ padding: '10px' }}>
          <EuiFlexItem>
            <EuiText textAlign="center" color="subdued">
              Loading may take over 30 seconds
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText textAlign="center" color="subdued">
              Status: {isTreeLoading.status}
            </EuiText>
          </EuiFlexItem>
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  const treeStateRenderer =
    isTreeLoading.message === '' ? (
      <EuiTreeView
        aria-label="OpenSearch Folder Tree"
        data-test-subj="opensearch-tree"
        items={treeData}
      />
    ) : (
      <EuiFlexGroup alignItems="center" gutterSize="s" direction="column">
        <EuiSpacer />
        <EuiFlexItem>
          <EuiIcon type="alert" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>Failed to load the tree</EuiFlexItem>
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
  }, [selectedItems, refreshTree]);

  return <div>{treeRenderer}</div>;
};
