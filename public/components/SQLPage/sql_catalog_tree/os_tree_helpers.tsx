/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption, EuiIcon, EuiText, EuiToolTip } from '@elastic/eui';
import { Node } from '@opensearch-project/oui/src/eui_components/tree_view/tree_view';
import _ from 'lodash';
import React from 'react';
import {
  FETCH_OPENSEARCH_INDICES_PATH,
  LOAD_OPENSEARCH_INDICES_QUERY,
} from '../../../../common/constants';
import { coreRefs } from '../../../framework/core_refs';

export const generateOpenSearchTree = (indices: string[]) => {
  const openSearchIndicesTree = indices.map((indexName, idx) => ({
    label: (
      <div key={indexName}>
        <EuiToolTip position="right" content={indexName} delay="long">
          <EuiText>{_.truncate(indexName, { length: 50 })}</EuiText>
        </EuiToolTip>{' '}
      </div>
    ),
    icon: <EuiIcon type="database" size="m" />,
    id: 'element_' + idx,
    isSelectable: false,
  }));
  return openSearchIndicesTree;
};

export const loadOpenSearchTree = async (dataSourceEnabled: boolean, dataSourceMDSId: string): Promise<{
  treeContent: Node[];
  loadingStatus: { status: boolean; message: string };
}> => {
  const loadQuery = { query: LOAD_OPENSEARCH_INDICES_QUERY };
  const http = coreRefs!.http;
  let loadedTree = {
    treeContent: [] as Node[],
    loadingStatus: {} as { status: boolean; message: string },
  };
  try {
    let query = {}
    if(dataSourceEnabled && dataSourceMDSId){
      query = {dataSourceMDSId: dataSourceMDSId};
    }
    const res = await http!.post(FETCH_OPENSEARCH_INDICES_PATH, {body: JSON.stringify({query: LOAD_OPENSEARCH_INDICES_QUERY}), query});
    const responseObj = JSON.parse(res.data.resp);
    const dataRows: any[][] = _.get(responseObj, 'datarows');
    if (dataRows.length > 0) {
      const fields = dataRows.map((data) => {
        return data[2];
      });

      loadedTree = {
        treeContent: generateOpenSearchTree(fields),
        loadingStatus: { status: false, message: '' },
      };
    } else {
      loadedTree = {
        treeContent: [],
        loadingStatus: { status: false, message: 'Failed to load OpenSearch indices' },
      };
    }
  } catch (err) {
    console.error(err);
    loadedTree = {
      treeContent: [],
      loadingStatus: {
        status: false,
        message: 'Failed to load OpenSearch indices, please check user permissions',
      },
    };
    // TODO:  setToast
  }
  return loadedTree;
};
export const getTreeContent = async (selectedItems: EuiComboBoxOptionOption[] , dataSourceEnabled: boolean, dataSourceMDSId: string) => {
  if (selectedItems[0].label === 'OpenSearch') {
    const { treeContent, loadingStatus } = await loadOpenSearchTree(dataSourceEnabled, dataSourceMDSId);
    return { treeContent, loadingStatus, s3TreeItems: [] };
  }
};
