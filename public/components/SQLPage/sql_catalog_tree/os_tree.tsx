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
import React, { useCallback, useEffect, useState } from 'react';
import { useCapabilities } from '../../../framework/capabilities_context';
import { getTreeContent } from './os_tree_helpers';

interface OSTreeProps {
  selectedItems: EuiComboBoxOptionOption[];
  updateSQLQueries: (query: string) => void;
  refreshTree: boolean;
  dataSourceEnabled: boolean;
  dataSourceMDSId: string;
}
export const OSTree = ({
  selectedItems,
  updateSQLQueries: _updateSQLQueries,
  refreshTree,
  dataSourceEnabled,
  dataSourceMDSId,
}: OSTreeProps) => {
  const [treeData, setTreeData] = useState<Node[]>([]);
  const [isTreeLoading, setIsTreeLoading] = useState({
    status: false,
    message: '',
  });
  const caps = useCapabilities();

  // `isStale` lets a superseded load drop its result instead of writing it. Capabilities
  // resolve asynchronously, so the first load runs against DEFAULT_CAPABILITIES and asks
  // Elasticsearch the quoted `SHOW tables LIKE '%'`, which matches nothing there (verified:
  // 0 rows on 7.4-7.9, where the unquoted form returns the indices). The reload that fires
  // once the engine is known asks the correct form, but both requests are in flight at once
  // and without this guard whichever *returns* last wins -- so the stale one can overwrite a
  // correctly loaded tree with "Failed to load indices".
  const loadtree = useCallback(
    async (isStale: () => boolean) => {
      setTreeData([]);
      setIsTreeLoading({
        status: true,
        message: '',
      });
      const { treeContent, loadingStatus } = await getTreeContent(
        selectedItems,
        dataSourceEnabled,
        dataSourceMDSId,
        caps
      );
      if (isStale()) {
        return;
      }
      setTreeData(treeContent);
      setIsTreeLoading({ ...loadingStatus });
    },
    [selectedItems, dataSourceEnabled, dataSourceMDSId, caps]
  );

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
          <EuiIcon type="database" aria-hidden={true} />
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
          <EuiIcon type="alert" aria-hidden={true} />
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
    let superseded = false;
    loadtree(() => superseded);
    return () => {
      superseded = true;
    };
    // loadtree excluded: it depends on selectedItems (unstable array prop), causing infinite re-renders.
    // caps.usesLegacyOpenDistroSql IS included: capabilities resolve asynchronously after a
    // data-source switch, and the tree must reload once the engine is known — otherwise it
    // keeps the stale first load (quoted `SHOW tables LIKE '%'` → 0 rows on Elasticsearch).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems, refreshTree, dataSourceMDSId, caps.usesLegacyOpenDistroSql]);

  return <div>{treeRenderer}</div>;
};
