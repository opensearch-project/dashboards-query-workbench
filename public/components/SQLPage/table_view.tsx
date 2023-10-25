/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBadge,
  EuiComboBoxOptionOption,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiText,
  EuiToolTip,
  EuiTreeView,
} from '@elastic/eui';
import { AccelerationIndexType, DatasourceTreeLoading, TreeItem, TreeItemType } from 'common/types';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { CoreStart } from '../../../../../src/core/public';
import {
  FETCH_OPENSEARCH_INDICES_PATH,
  LOAD_OPENSEARCH_INDICES_QUERY,
  TREE_ITEM_BADGE_NAME,
  TREE_ITEM_COVERING_INDEX_DEFAULT_NAME,
  TREE_ITEM_DATABASE_NAME_DEFAULT_NAME,
  TREE_ITEM_LOAD_MATERIALIZED_BADGE_NAME,
  TREE_ITEM_MATERIALIZED_VIEW_DEFAULT_NAME,
  TREE_ITEM_SKIPPING_INDEX_DEFAULT_NAME,
  TREE_ITEM_TABLE_NAME_DEFAULT_NAME,
} from '../../../common/constants';
import { useToast } from '../../../common/toast';
import { getJobId, pollQueryStatus } from '../../../common/utils/async_query_helpers';
import { AccelerationIndexFlyout } from './acceleration_index_flyout';

interface CustomView {
  http: CoreStart['http'];
  selectedItems: EuiComboBoxOptionOption[];
  updateSQLQueries: (query: string) => void;
  refreshTree: boolean;
}

export const TableView = ({ http, selectedItems, updateSQLQueries, refreshTree }: CustomView) => {
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isLoadingBanner, setIsLoading] = useState<DatasourceTreeLoading>({
    flag: false,
    status: 'Not loading',
  });
  const [indexFlyout, setIndexFlyout] = useState(<></>);
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const { setToast } = useToast();

  const resetFlyout = () => {
    setIndexFlyout(<></>);
  };

  const handleAccelerationIndexClick = (
    accelerationIndexType: AccelerationIndexType,
    dataSource: string,
    database: string,
    dataTable: string,
    indexName?: string
  ) => {
    setIndexFlyout(
      <AccelerationIndexFlyout
        accelerationIndexType={accelerationIndexType}
        dataSource={dataSource}
        database={database}
        dataTable={dataTable}
        indexName={indexName}
        resetFlyout={resetFlyout}
        updateSQLQueries={updateSQLQueries}
      />
    );
  };

  function loadTreeItem(elements: string[], type: TreeItemType): TreeItem[] {
    return elements.map((element) => {
      let treeItem: TreeItem = {
        name: element,
        type: type,
        isExpanded: false,
      };

      if (
        type != TREE_ITEM_COVERING_INDEX_DEFAULT_NAME &&
        type != TREE_ITEM_SKIPPING_INDEX_DEFAULT_NAME
      ) {
        treeItem.values = [];
        treeItem.isLoading = false;
      }
      return treeItem;
    });
  }

  const getSidebarContent = () => {
    if (selectedItems[0].label === 'OpenSearch') {
      setTableNames([]);
      setIsLoading({
        flag: false,
        status: 'Query is run',
      });
      const query = { query: LOAD_OPENSEARCH_INDICES_QUERY };
      http
        .post(FETCH_OPENSEARCH_INDICES_PATH, {
          body: JSON.stringify(query),
        })
        .then((res) => {
          const responseObj = res.data.resp ? JSON.parse(res.data.resp) : {};
          const dataRows: any[][] = _.get(responseObj, 'datarows');
          if (dataRows.length > 0) {
            const fields = dataRows.map((data) => {
              return data[2];
            });
            setTableNames(fields);
          } else {
            setIsLoading({
              flag: false,
              status: 'Error fetching data',
            });
            setToast(`ERROR fetching data`, 'danger');
          }
        })
        .catch((err) => {
          console.error(err);
          setIsLoading({
            flag: false,
            status: err,
          });
          setToast(`ERROR ${err}`, 'danger');
        });
    } else {
      setTableNames([]);
      const query = {
        lang: 'sql',
        query: `SHOW SCHEMAS IN ${selectedItems[0]['label']}`,
        datasource: selectedItems[0]['label'],
      };
      getJobId(query, http, (id) => {
        if (id === undefined) {
          const errorMessage = 'ERROR fetching databases';
          setIsLoading({
            flag: false,
            status: errorMessage,
          });
          setToast(errorMessage, 'danger');
        }
        pollQueryStatus(id, http, (data) => {
          setIsLoading({ flag: true, status: data.status });
          if (data.status === 'SUCCESS') {
            const fetchedDatanases = [].concat(...data.results);
            setTreeData(loadTreeItem(fetchedDatanases, TREE_ITEM_DATABASE_NAME_DEFAULT_NAME));
            setIsLoading({ flag: false, status: data.status });
          } else if (data.status === 'FAILED') {
            setIsLoading({
              flag: false,
              status: data.error,
            });
            setToast(`ERROR ${data.error}`, 'danger');
          }
        });
      });
    }
  };

  useEffect(() => {
    setIsLoading({
      flag: true,
      status: 'Query Not Run',
    });
    getSidebarContent();
  }, [selectedItems, refreshTree]);

  const handleDatabaseClick = (databaseName: string) => {
    setTreeData((prevTreeData) => {
      return prevTreeData.map((database) => {
        if (database.name === databaseName) {
          return { ...database, isExpanded: true, isLoading: true };
        }
        return database;
      });
    });
    setSelectedDatabase(databaseName);
    const query = {
      lang: 'sql',
      query: `SHOW TABLES IN ${selectedItems[0]['label']}.${databaseName}`,
      datasource: selectedItems[0]['label'],
    };
    getJobId(query, http, (id) => {
      if (id === undefined) {
        const errorMessage = 'ERROR fetching Tables';
        setIsLoading({
          flag: false,
          status: errorMessage,
        });
        setTreeData((prevTreeData) => {
          return prevTreeData.map((database) => {
            if (database.name === databaseName) {
              return { ...database, isExpanded: true, isLoading: false };
            }
            return database;
          });
        });
        setToast(errorMessage, 'danger');
      } else {
        pollQueryStatus(id, http, (data) => {
          if (data.status === 'SUCCESS') {
            const fetchTables = data.results.map((subArray) => subArray[1]);
            let values = loadTreeItem(fetchTables, TREE_ITEM_TABLE_NAME_DEFAULT_NAME);
            let mvObj = loadTreeItem(
              [TREE_ITEM_LOAD_MATERIALIZED_BADGE_NAME],
              TREE_ITEM_LOAD_MATERIALIZED_BADGE_NAME
            );
            values = [...values, ...mvObj];
            setTreeData((prevTreeData) => {
              return prevTreeData.map((database) => {
                if (database.name === databaseName) {
                  return { ...database, values: values, isExpanded: true, isLoading: false };
                }
                return database;
              });
            });
          } else if (data.status === 'FAILED') {
            setIsLoading({
              flag: false,
              status: data.error,
            });
            setToast(`ERROR ${data.error}`, 'danger');
          }
        });
      }
    });
  };

  const loadCoveringIndex = (tableName: string) => {
    const coverQuery = {
      lang: 'sql',
      query: `SHOW INDEX ON ${selectedItems[0]['label']}.${selectedDatabase}.${tableName}`,
      datasource: selectedItems[0]['label'],
    };
    getJobId(coverQuery, http, (id) => {
      if (id === undefined) {
        const errorMessage = 'ERROR fetching Covering Index';
        setIsLoading({
          flag: false,
          status: errorMessage,
        });
        setTreeData((prevTreeData) => {
          return prevTreeData.map((database) => {
            if (database.name === selectedDatabase) {
              return {
                ...database,
                values: database.values?.map((table) => {
                  if (table.name === tableName) {
                    return {
                      ...table,
                      isLoading: false,
                      isExpanded: false,
                    };
                  }
                  return table;
                }),
              };
            }
            return database;
          });
        });
        setToast(errorMessage, 'danger');
      }
      pollQueryStatus(id, http, (data) => {
        if (data.status === 'SUCCESS') {
          const res = [].concat(data.results);
          let coverIndexObj = loadTreeItem(res, TREE_ITEM_COVERING_INDEX_DEFAULT_NAME);
          setTreeData((prevTreeData) => {
            return prevTreeData.map((database) => {
              if (database.name === selectedDatabase) {
                return {
                  ...database,
                  values: database.values?.map((table) => {
                    if (table.name === tableName) {
                      let newValues = table.values?.concat(...coverIndexObj);
                      if (newValues?.length === 0) {
                        newValues = [
                          { name: 'No Indicies', type: TREE_ITEM_BADGE_NAME, isExpanded: false },
                        ];
                      }
                      return {
                        ...table,
                        values: newValues,
                        isLoading: false,
                        isExpanded: true,
                      };
                    }
                    return table;
                  }),
                };
              }
              return database;
            });
          });
        } else if (data.status === 'FAILED') {
          setIsLoading({
            flag: false,
            status: data.error,
          });
          setToast(`ERROR ${data.error}`, 'danger');
        }
      });
    });
  };

  const handleButtonClick = (e: MouseEvent, tableName: string) => {
    e.stopPropagation();
    tableName = TREE_ITEM_LOAD_MATERIALIZED_BADGE_NAME;
    setSelectedTable(tableName);
    setTreeData((prevTreeData) => {
      return prevTreeData.map((database) => {
        if (database.name === selectedDatabase) {
          return {
            ...database,
            values: database.values?.map((table) => {
              if (table.name === tableName) {
                return {
                  ...table,
                  isLoading: true,
                };
              }
              return table;
            }),
          };
        }
        return database;
      });
    });
    const materializedViewQuery = {
      lang: 'sql',
      query: `SHOW MATERIALIZED VIEW IN ${selectedItems[0]['label']}.${selectedDatabase}`,
      datasource: selectedItems[0]['label'],
    };
    getJobId(materializedViewQuery, http, (id) => {
      if (id === undefined) {
        const errorMessage = 'ERROR fetching Materialized View';
        setIsLoading({
          flag: false,
          status: errorMessage,
        });
        setTreeData((prevTreeData) => {
          return prevTreeData.map((database) => {
            if (database.name === selectedDatabase) {
              return {
                ...database,
                values: database.values?.map((table) => {
                  if (table.name === tableName) {
                    return {
                      ...table,
                      isLoading: false,
                    };
                  }
                  return table;
                }),
              };
            }
            return database;
          });
        });
        setToast(errorMessage, 'danger');
      } else {
        pollQueryStatus(id, http, (data) => {
          if (data.status === 'SUCCESS') {
            const fetchMaterialzedView = data.results;
            let values = loadTreeItem(
              fetchMaterialzedView,
              TREE_ITEM_MATERIALIZED_VIEW_DEFAULT_NAME
            );
            if (values.length === 0) {
              values = [
                {
                  name: 'No Materialized View',
                  type: TREE_ITEM_BADGE_NAME,
                  isExpanded: false,
                  isLoading: false,
                },
              ];
            }
            setTreeData((prevTreeData) => {
              return prevTreeData.map((database) => {
                if (database.name === selectedDatabase) {
                  const updatedValues = database.values?.filter(
                    (item) => item.type !== TREE_ITEM_LOAD_MATERIALIZED_BADGE_NAME
                  );
                  return {
                    ...database,
                    values: updatedValues?.concat(...values),
                    isLoading: false,
                    isExpanded: true,
                  };
                }
                return database;
              });
            });
          } else if (data.status === 'FAILED') {
            setIsLoading({
              flag: false,
              status: data.error,
            });
            setToast(`ERROR ${data.error}`, 'danger');
          }
        });
      }
    });
  };

  const handleTableClick = (tableName: string) => {
    setSelectedTable(tableName);
    setTreeData((prevTreeData) => {
      return prevTreeData.map((database) => {
        if (database.name === selectedDatabase) {
          return {
            ...database,
            values: database.values?.map((table) => {
              if (table.name === tableName) {
                return {
                  ...table,
                  isLoading: true,
                };
              }
              return table;
            }),
          };
        }
        return database;
      });
    });
    const skipQuery = {
      lang: 'sql',
      query: `DESC SKIPPING INDEX ON ${selectedItems[0]['label']}.${selectedDatabase}.${tableName}`,
      datasource: selectedItems[0]['label'],
    };
    getJobId(skipQuery, http, (id) => {
      if (id === undefined) {
        const errorMessage = 'ERROR fetching Skipping index';
        setIsLoading({
          flag: false,
          status: 'error',
        });
        setTreeData((prevTreeData) => {
          return prevTreeData.map((database) => {
            if (database.name === selectedDatabase) {
              return {
                ...database,
                values: database.values?.map((table) => {
                  if (table.name === tableName) {
                    return {
                      ...table,
                      isLoading: false,
                    };
                  }
                  return table;
                }),
              };
            }
            return database;
          });
        });
        setToast(errorMessage, 'danger');
      } else {
        pollQueryStatus(id, http, (data) => {
          if (data.status === 'SUCCESS') {
            if (data.results.length > 0) {
              setTreeData((prevTreeData) => {
                return prevTreeData.map((database) => {
                  if (database.name === selectedDatabase) {
                    return {
                      ...database,
                      values: database.values?.map((table) => {
                        if (table.name === tableName) {
                          return {
                            ...table,
                            values: loadTreeItem(
                              [TREE_ITEM_SKIPPING_INDEX_DEFAULT_NAME],
                              TREE_ITEM_SKIPPING_INDEX_DEFAULT_NAME
                            ),
                          };
                        }
                        return table;
                      }),
                    };
                  }
                  return database;
                });
              });
            }
            loadCoveringIndex(tableName);
          } else if (data.status === 'FAILED') {
            setIsLoading({
              flag: false,
              status: data.error,
            });
            setToast(`ERROR ${data.error}`, 'danger');
          }
        });
      }
    });
  };

  const createLabel = (node: TreeItem, parentName: string, index: number) => {
    switch (node.type) {
      case TREE_ITEM_BADGE_NAME:
        return (
          <div key={`${parentName}.${node.name}.${index}`}>
            <EuiToolTip position="right" content={node.name} delay="long">
              <EuiBadge>{_.truncate(node.name, { length: 50 })}</EuiBadge>
            </EuiToolTip>{' '}
          </div>
        );

      case TREE_ITEM_LOAD_MATERIALIZED_BADGE_NAME:
        return (
          <div key={node.name}>
            <EuiFlexGroup direction="row">
              <EuiFlexItem>
                <EuiBadge color="hollow" onClick={handleButtonClick}>
                  Load Materialized View
                </EuiBadge>
              </EuiFlexItem>
              <EuiFlexItem>
              <EuiText>{node.isLoading && <EuiLoadingSpinner size="m" />}</EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        );

      default:
        return (
          <div key={node.name}>
            <EuiToolTip position="right" content={node.name} delay="long">
              <EuiFlexGroup direction="row">
                <EuiFlexItem>
                  <EuiText>
                    {_.truncate(node.name, { length: 50 })}{' '}
                    {node.isLoading && <EuiLoadingSpinner size="m" />}
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiToolTip>
          </div>
        );
    }
  };

  const OpenSearchIndicesTree = tableNames.map((database, index) => ({
    label: (
      <div key={database}>
        <EuiToolTip position="right" content={database} delay="long">
          <EuiText>{_.truncate(database, { length: 50 })}</EuiText>
        </EuiToolTip>{' '}
      </div>
    ),
    icon: <EuiIcon type="database" size="m" />,
    id: 'element_' + index,
    isSelectable: false,
  }));

  const treeDataDatabases = treeData.map((database, index) => ({
    label: createLabel(database, selectedItems[0].label, index),
    icon: <EuiIcon type="database" size="m" />,
    id: 'element_' + index,
    callback: () => {
      if (database.values?.length === 0 && selectedItems[0].label !== 'OpenSearch') {
        handleDatabaseClick(database.name);
      }
    },
    isSelectable: true,
    isExpanded: database.isExpanded,
    children: database.values?.map((table, index) => ({
      label: createLabel(table, database.name, index),
      id: `${database.name}_${table.name}`,
      icon:
        table.type === TREE_ITEM_MATERIALIZED_VIEW_DEFAULT_NAME ? <EuiBadge>MV</EuiBadge> : table.type ===
          TREE_ITEM_BADGE_NAME || table.type === TREE_ITEM_LOAD_MATERIALIZED_BADGE_NAME? null : (
          <EuiIcon type="tableDensityCompact" size="s" />
        ),
      callback: () => {
        if (table.type !== TREE_ITEM_LOAD_MATERIALIZED_BADGE_NAME && table.values?.length === 0) {
          handleTableClick(table.name);
        }
        if (table.type === TREE_ITEM_LOAD_MATERIALIZED_BADGE_NAME) {
          handleAccelerationIndexClick(
            'materialized',
            selectedItems[0].label,
            database.name,
            table.name
          );
        }
      },
      isSelectable: true,
      isExpanded: table.isExpanded,
      children: table.values?.map((indexChild, index) => ({
        label: createLabel(indexChild, table.name, index),
        id: `${database.name}_${table.name}_${indexChild.name}`,
        icon: indexChild.type === TREE_ITEM_BADGE_NAME ? null : <EuiIcon type="bolt" size="s" />,
        callback: () => {
          if (indexChild.type !== TREE_ITEM_BADGE_NAME) {
            handleAccelerationIndexClick(
              indexChild.type === 'skipping_index' ? 'skipping' : 'covering',
              selectedItems[0].label,
              database.name,
              table.name,
              indexChild.name
            );
          }
        },
      })),
    })),
  }));

  return (
    <>
      {isLoadingBanner.flag ? (
        <EuiFlexGroup alignItems="center" gutterSize="s" direction="column">
          <EuiSpacer />
          <EuiFlexItem>
            <EuiLoadingSpinner size="l" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>Loading data</EuiFlexItem>
          <EuiFlexItem grow={false}>
            <div style={{ padding: '10px' }}>
              <EuiFlexItem>
                <EuiText textAlign="center" color="subdued">
                  Loading may take over 30 seconds
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiText textAlign="center" color="subdued">
                  Status: {isLoadingBanner.status}
                </EuiText>
              </EuiFlexItem>
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : OpenSearchIndicesTree.length > 0 || treeDataDatabases.length > 0 ? (
        <EuiFlexItem grow={false}>
          {selectedItems[0].label === 'OpenSearch' ? (
            <EuiTreeView aria-label="Sample Folder Tree" items={OpenSearchIndicesTree} />
          ) : (
            <EuiTreeView aria-label="Sample Folder Tree" items={treeDataDatabases} />
          )}
        </EuiFlexItem>
      ) : (
        <EuiFlexGroup alignItems="center" direction="column">
          <EuiFlexItem grow={false}>
            <EuiEmptyPrompt
              icon={<EuiIcon type="database" size="m" />}
              iconColor="subdued"
              titleSize="xs"
              title={<p>No Data available</p>}
              body={<p>{isLoadingBanner.status}</p>}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
      {indexFlyout}
    </>
  );
};
