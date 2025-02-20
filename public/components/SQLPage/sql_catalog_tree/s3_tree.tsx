/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiText,
  EuiTreeView,
} from '@elastic/eui';
import produce from 'immer';
import React, { useEffect, useState } from 'react';
import {
  TREE_ITEM_COVERING_INDEX_DEFAULT_NAME,
  TREE_ITEM_DATABASE_NAME_DEFAULT_NAME,
  TREE_ITEM_MATERIALIZED_VIEW_DEFAULT_NAME,
  TREE_ITEM_SKIPPING_INDEX_DEFAULT_NAME,
  TREE_ITEM_TABLE_NAME_DEFAULT_NAME,
} from '../../../../common/constants';
import { AsyncQueryStatus, CachedDataSourceStatus, TreeItem } from '../../../../common/types';
import { useToast } from '../../../../common/utils/toast_helper';
import { getRenderAccelerationDetailsFlyout } from '../../../dependencies/register_observability_dependencies';
import { catalogCacheRefs } from '../../../framework/catalog_cache_refs';
import '../table_view.scss';
import {
  createLabel,
  findIndexObject,
  findMaterializedViewsForDatabase,
  findSkippingAndCoveringIndexNames,
  getAccelerationsFromCache,
  getTablesFromCache,
  iconCreation,
  isEitherObjectCacheEmpty,
  loadTreeItem,
  pageLanguage,
} from './s3_tree_helpers';

interface S3TreeProps {
  dataSource: string;
  updateSQLQueries: (query: string) => void;
  refreshTree: boolean;
  dataSourceEnabled: boolean;
  dataSourceMDSId: string;
  language: string;
  updatePPLQueries: (query: string) => void;
}

export const S3Tree = ({
  dataSource,
  updateSQLQueries,
  refreshTree,
  dataSourceMDSId,
  language,
  updatePPLQueries,
}: S3TreeProps) => {
  const { setToast } = useToast();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [currentSelectedDatabase, setCurrentSelectedDatabase] = useState('');
  const renderAccelerationDetailsFlyout = getRenderAccelerationDetailsFlyout();
  const [isTreeLoading, setIsTreeLoading] = useState({
    status: false,
    message: '',
  });
  const [isObjectLoading, setIsObjectLoading] = useState({
    tableStatus: false,
    accelerationsStatus: false,
  });
  const {
    loadStatus: loadDatabasesStatus,
    startLoading: startDatabasesLoading,
    stopLoading: stopDatabasesLoading,
  } = catalogCacheRefs.useLoadDatabasesToCache();
  const {
    loadStatus: loadTablesStatus,
    startLoading: startLoadingTables,
    stopLoading: stopLoadingTables,
  } = catalogCacheRefs.useLoadTablesToCache();
  const {
    loadStatus: loadAccelerationsStatus,
    startLoading: startLoadingAccelerations,
    stopLoading: stopLoadingAccelerations,
  } = catalogCacheRefs.useLoadAccelerationsToCache();

  const refreshDatabasesinTree = () => {
    const currentTree = [...treeData];
    currentTree.map((db) => {
      setTreeData(
        produce((draft) => {
          const databaseToUpdate = draft.find((database) => database.name === db.name);
          if (databaseToUpdate) {
            databaseToUpdate.isExpanded = false;
            databaseToUpdate.isLoading = false;
            databaseToUpdate.values = [];
          }
        })
      );
    });
  };

  const updateDatabaseState = (databaseName: string, isLoading: boolean, values?: TreeItem[]) => {
    setTreeData(
      produce((draft) => {
        const databaseToUpdate = draft.find((database) => database.name === databaseName);
        if (databaseToUpdate) {
          databaseToUpdate.isExpanded = true;
          databaseToUpdate.isLoading = isLoading;
          if (values !== undefined) {
            databaseToUpdate.values = databaseToUpdate.values
              ? databaseToUpdate.values.concat(values)
              : values;
          }
        }
      })
    );
  };

  const constructObjectTree = (
    database: string,
    tablesData: string[],
    accelerationsData: any[]
  ) => {
    const tablesTreeItems = tablesData.map((table) => {
      const indices = findSkippingAndCoveringIndexNames(accelerationsData, database, table);

      const tableValues = indices.map((index) => {
        return index === TREE_ITEM_SKIPPING_INDEX_DEFAULT_NAME
          ? loadTreeItem(
              [TREE_ITEM_SKIPPING_INDEX_DEFAULT_NAME],
              TREE_ITEM_SKIPPING_INDEX_DEFAULT_NAME
            )[0]
          : loadTreeItem([index], TREE_ITEM_COVERING_INDEX_DEFAULT_NAME)[0];
      });

      const tableTreeItem = loadTreeItem(
        [table],
        TREE_ITEM_TABLE_NAME_DEFAULT_NAME,
        tableValues
      )[0];
      return tableTreeItem;
    });

    const mvItems = findMaterializedViewsForDatabase(accelerationsData, database);
    const mvTreeItems = loadTreeItem(mvItems, TREE_ITEM_MATERIALIZED_VIEW_DEFAULT_NAME);

    updateDatabaseState(database, true, [...tablesTreeItems, ...mvTreeItems]);
  };

  const onClickDatabase = (database: TreeItem) => {
    if (currentSelectedDatabase === '') {
      setCurrentSelectedDatabase(database.name);
      updateDatabaseState(database.name, true);
      if (!isEitherObjectCacheEmpty(dataSource, database.name, dataSourceMDSId)) {
        const tablesData = getTablesFromCache(dataSource, database.name, dataSourceMDSId);
        const accelerationsData = getAccelerationsFromCache(dataSource, dataSourceMDSId);

        constructObjectTree(database.name, tablesData, accelerationsData);
        updateDatabaseState(database.name, false);
        setCurrentSelectedDatabase('');
      } else {
        updateDatabaseState(database.name, true);
        setIsObjectLoading({
          tableStatus: true,
          accelerationsStatus: true,
        });
        startLoadingTables({
          dataSourceName: dataSource,
          databaseName: database.name,
          dataSourceMDSId,
        });
        startLoadingAccelerations({ dataSourceName: dataSource, dataSourceMDSId });
        updateDatabaseState(database.name, true);
      }
    } else {
      setToast('Can only load one database at a time', 'warning');
    }
  };

  const onClickAcceleration = (
    databaseName: string,
    tableName: string | undefined,
    accelerationName: string
  ) => {
    const accelerationsData = getAccelerationsFromCache(dataSource, dataSourceMDSId);
    const accelerationObject = findIndexObject(
      accelerationsData,
      databaseName,
      tableName,
      accelerationName
    );
    renderAccelerationDetailsFlyout({
      acceleration: accelerationObject,
      dataSourceName: dataSource,
      handleRefresh: refreshDatabasesinTree,
      dataSourceMDSId,
    });
  };

  const treeDataDatabases = treeData.map((database, index) => ({
    label: createLabel(
      database,
      dataSource,
      database.name,
      index,
      updateSQLQueries,
      updatePPLQueries
    ),
    icon: iconCreation(database),
    id: 'element_' + index,
    callback: () => {
      if (database.values?.length === 0) {
        onClickDatabase(database);
      }
    },
    isSelectable: true,
    isExpanded: database.isExpanded,
    children: database.values?.map((table, idx) => ({
      label: createLabel(table, dataSource, database.name, idx, updateSQLQueries, updatePPLQueries),
      id: `${database.name}_${table.name}`,
      icon: iconCreation(table),
      callback: () => {
        if (table.type === TREE_ITEM_MATERIALIZED_VIEW_DEFAULT_NAME) {
          onClickAcceleration(database.name, undefined, table.name);
        }
      },
      isSelectable: true,
      isExpanded: table.isExpanded,
      children: table.values?.map((indexChild, idxValue) => ({
        label: createLabel(indexChild, table.name, idxValue),
        id: `${database.name}_${table.name}_${indexChild.name}`,
        icon: iconCreation(indexChild),
        callback: () => {
          if (
            indexChild.type === TREE_ITEM_SKIPPING_INDEX_DEFAULT_NAME ||
            indexChild.type === TREE_ITEM_COVERING_INDEX_DEFAULT_NAME
          ) {
            onClickAcceleration(database.name, table.name, indexChild.name);
          }
        },
      })),
    })),
  }));

  const onRefreshTree = () => {
    setIsTreeLoading({ status: true, message: '' });
    startDatabasesLoading({ dataSourceName: dataSource, dataSourceMDSId });
  };

  const onLoadS3Tree = () => {
    setIsTreeLoading({ status: true, message: '' });
    const dsCache = catalogCacheRefs.CatalogCacheManager!.getOrCreateDataSource(
      dataSource,
      dataSourceMDSId
    );
    if (dsCache.status === CachedDataSourceStatus.Updated) {
      const databases = dsCache.databases.map((db) => db.name);
      setTreeData(loadTreeItem(databases, TREE_ITEM_DATABASE_NAME_DEFAULT_NAME));
      setIsTreeLoading({ status: false, message: '' });
    } else if (dsCache.status === CachedDataSourceStatus.Empty) {
      startDatabasesLoading({ dataSourceName: dataSource, dataSourceMDSId });
    }
  };

  useEffect(() => {
    const status = loadDatabasesStatus.toLowerCase();
    if (status === AsyncQueryStatus.Success) {
      refreshDatabasesinTree();
      setIsTreeLoading({ status: false, message: '' });
<<<<<<< HEAD
      const dsCache = catalogCacheRefs.CatalogCacheManager!.getOrCreateDataSource(dataSource, dataSourceMDSId);
=======
      const dsCache = catalogCacheRefs.CatalogCacheManager!.getOrCreateDataSource(
        dataSource,
        dataSourceMDSId
      );
>>>>>>> eebe626 ([Bug]Side tree flyout fix in async operations (#448))
      if (dsCache.status === CachedDataSourceStatus.Updated) {
        const databases = dsCache.databases.map((db) => db.name);
        setTreeData(loadTreeItem(databases, TREE_ITEM_DATABASE_NAME_DEFAULT_NAME));
      }
    } else if (status === AsyncQueryStatus.Failed || status === AsyncQueryStatus.Cancelled) {
      setIsTreeLoading({ status: false, message: 'Failed to load databases' });
    }
  }, [loadDatabasesStatus]);

  useEffect(() => {
    const status = loadTablesStatus.toLowerCase();
    if (status === AsyncQueryStatus.Success) {
      setIsObjectLoading({ ...isObjectLoading, tableStatus: false });
    } else if (status === AsyncQueryStatus.Failed || status === AsyncQueryStatus.Cancelled) {
      setIsObjectLoading({ ...isObjectLoading, tableStatus: false });
    }
  }, [loadTablesStatus]);

  useEffect(() => {
    const status = loadAccelerationsStatus.toLowerCase();
    if (status === AsyncQueryStatus.Success) {
      setIsObjectLoading({ ...isObjectLoading, accelerationsStatus: false });
    } else if (status === AsyncQueryStatus.Failed || status === AsyncQueryStatus.Cancelled) {
      setIsObjectLoading({ ...isObjectLoading, accelerationsStatus: false });
    }
  }, [loadAccelerationsStatus]);

  useEffect(() => {
    pageLanguage(language);
    onLoadS3Tree();
  }, [dataSource, dataSourceMDSId, language]);

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  useEffect(() => {
    if (isFirstRender) {
      return;
    }
    // This will only execute on changes to refreshTree after the initial render
    onRefreshTree();
  }, [refreshTree]);

  useEffect(() => {
    if (
      !(isObjectLoading.accelerationsStatus || isObjectLoading.tableStatus) &&
      currentSelectedDatabase !== ''
    ) {
      const tablesData = getTablesFromCache(dataSource, currentSelectedDatabase, dataSourceMDSId);
      const accelerationsData = getAccelerationsFromCache(dataSource);

      constructObjectTree(currentSelectedDatabase, tablesData, accelerationsData);
      updateDatabaseState(currentSelectedDatabase, false);
      setCurrentSelectedDatabase('');
    }
  }, [isObjectLoading]);

  useEffect(() => {
    return () => {
      stopDatabasesLoading();
      stopLoadingTables();
      stopLoadingAccelerations();
    };
  }, []);

  const treeLoadingStateRenderer = (
    <EuiFlexGroup alignItems="center" gutterSize="s" direction="column">
      <EuiSpacer />
      <EuiFlexItem>
        <EuiLoadingSpinner size="l" />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>Loading databases</EuiFlexItem>
      <EuiFlexItem grow={false}>
        <div style={{ padding: '10px' }}>
          <EuiFlexItem>
            <EuiText textAlign="center" color="subdued">
              Loading may take over 30 seconds
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText textAlign="center" color="subdued">
              Status: {loadDatabasesStatus}
            </EuiText>
          </EuiFlexItem>
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  const treeViewRenderer =
    treeData.length === 0 ? (
      <EuiFlexGroup alignItems="center" gutterSize="s" direction="column">
        <EuiSpacer />
        <EuiFlexItem>
          <EuiIcon type="database" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>No databases found</EuiFlexItem>
      </EuiFlexGroup>
    ) : (
      <EuiTreeView
        aria-label="S3 Datasource Folder Tree"
        data-test-subj="s3-datasource-tree"
        className="workbench-tree"
        items={treeDataDatabases}
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
        <EuiFlexItem grow={false}>Failed to load databases</EuiFlexItem>
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
  return <div>{treeRenderer}</div>;
};
