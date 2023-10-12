/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBoxOptionOption,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingSpinner,
  EuiText,
  EuiToolTip,
  EuiTreeView,
} from '@elastic/eui';
import { Tree, TreeItem } from 'common/types';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { CoreStart } from '../../../../../src/core/public';
import {
  COVERING_INDEX,
  DATABASE,
  ON_LOAD_QUERY,
  SKIPPING_INDEX,
  TABLE,
} from '../../../common/constants';
import { AccelerationIndexFlyout } from './acceleration_index_flyout';
import { getJobId, pollQueryStatus } from './utils';

interface CustomView {
  http: CoreStart['http'];
  selectedItems: EuiComboBoxOptionOption[];
  updateSQLQueries: (query: string) => void;
}

export const TableView = ({ http, selectedItems, updateSQLQueries }: CustomView) => {
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [indexFlyout, setIndexFlyout] = useState(<></>);
  const [childLoadingStates, setChildLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [tableLoadingStates, setTableLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [treeData, setTreeData] = useState<TreeItem[]>([]);

  let indicesData: string[] = [];

  const resetFlyout = () => {
    setIndexFlyout(<></>);
  };

  const handleAccelerationIndexClick = (
    dataSource: string,
    database: string,
    dataTable: string,
    indexName: string
  ) => {
    setIndexFlyout(
      <AccelerationIndexFlyout
        dataSource={dataSource}
        database={database}
        dataTable={dataTable}
        indexName={indexName}
        resetFlyout={resetFlyout}
        updateSQLQueries={updateSQLQueries}
      />
    );
  };

  function mapToTreeItem(elements: string[], type: Tree): TreeItem[] {
    return elements.map((element) => {
      const treeItem: TreeItem = {
        name: element,
        type: type,
        isExpanded: true,
      };

      if (type === DATABASE) {
        treeItem.values = [];
        treeItem.isExpanded = true;
      } else if (type === TABLE) {
        treeItem.values = [];
        treeItem.isExpanded = true;
      } else if (type === SKIPPING_INDEX) {
        treeItem.values = [];
        treeItem.type = SKIPPING_INDEX;
      } else {
        treeItem.type = COVERING_INDEX;
      }

      return treeItem;
    });
  }

  const get_async_query_results = (id, http, callback) => {
    pollQueryStatus(id, http, callback);
  };

  const getSidebarContent = () => {
    if (selectedItems[0].label === 'OpenSearch') {
      setTableNames([]);
      const query = { query: ON_LOAD_QUERY };
      http
        .post(`/api/sql_console/sqlquery`, {
          body: JSON.stringify(query),
        })
        .then((res) => {
          const responseObj = res.data.resp ? JSON.parse(res.data.resp) : '';
          const dataRows: any[][] = _.get(responseObj, 'datarows');
          const fields = dataRows.map((data) => {
            return data[2];
          });
          setTableNames(fields);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      setIsLoading(true);
      setTableNames([]);
      const query = {
        lang: 'sql',
        query: `SHOW SCHEMAS IN ${selectedItems[0]['label']}`,
        datasource: selectedItems[0]['label'],
      };
      getJobId(query, http, (id) => {
        get_async_query_results(id, http, (data) => {
          data = [].concat(...data);
          setTreeData(mapToTreeItem(data, DATABASE));
          setIsLoading(false);
        });
      });
    }
  };

  useEffect(() => {
    setIsLoading(false);
    getSidebarContent();
  }, [selectedItems]);

  const handleDatabaseClick = (databaseName: string) => {
    setSelectedDatabase(databaseName);
    const query = {
      lang: 'sql',
      query: `SHOW TABLES IN ${selectedItems[0]['label']}.${databaseName}`,
      datasource: selectedItems[0]['label'],
    };
    getJobId(query, http, (id) => {
      get_async_query_results(id, http, (data) => {
        data = data.map((subArray) => subArray[1]);
        const values = mapToTreeItem(data, TABLE);
        treeData.map((database) => {
          if (database.name === databaseName) {
            database.values = values;
          }
        });
        setIsLoading(false);
      });
    });
  };

  const callCoverQuery = (tableName: string) => {
    const coverQuery = {
      lang: 'sql',
      query: `SHOW INDEX ON ${selectedItems[0]['label']}.${selectedDatabase}.${tableName}`,
      datasource: selectedItems[0]['label'],
    };
    getJobId(coverQuery, http, (id) => {
      get_async_query_results(id, http, (data) => {
        const res = [].concat(data);
        let coverIndexObj = mapToTreeItem(res, COVERING_INDEX);
        const final = indicesData.concat(...res);
        treeData.map((database) => {
          if (database.name === selectedDatabase) {
            database.values.map((table) => {
              if (table.name === tableName) {
                table.values = table.values.concat(...coverIndexObj);
              }
            });
          }
        });
        setIsLoading(false);
      });
    });
  };

  const handleTableClick = (tableName: string) => {
    setSelectedTable(tableName);
    const skipQuery = {
      lang: 'sql',
      query: `DESC SKIPPING INDEX ON ${selectedItems[0]['label']}.${selectedDatabase}.${tableName}`,
      datasource: selectedItems[0]['label'],
    };
    getJobId(skipQuery, http, (id) => {
      get_async_query_results(id, http, (data) => {
        if (data.length > 0) {
          treeData.map((database) => {
            if (database.name === selectedDatabase) {
              database.values.map((table) => {
                if (table.name === tableName) {
                  table.values = mapToTreeItem([SKIPPING_INDEX], SKIPPING_INDEX);
                }
              });
            }
          });
        }
        callCoverQuery(tableName);
      });
    });
  };

  const treeDataOpenSearch = tableNames.map((database, index) => ({
    label: (
      <div>
        <EuiToolTip position="right" content={database} delay="long">
          <EuiText>{_.truncate(database, { length: 50 })}</EuiText>
        </EuiToolTip>{' '}
        {tableLoadingStates[database] && <EuiLoadingSpinner size="m" />}
      </div>
    ),
    icon: <EuiIcon type="database" size="m" />,
    id: 'element_' + index,
  }));

  const treeDataDatabases = treeData.map((database, index) => ({
    label: (
      <div key={database.name}>
        <EuiToolTip position="right" content={database.name} delay="long">
          <EuiText>{_.truncate(database.name, { length: 50 })}</EuiText>
        </EuiToolTip>{' '}
      </div>
    ),
    icon: <EuiIcon type="database" size="m" />,
    id: 'element_' + index,
    callback: () => {
      if (database.values.length === 0 && selectedItems[0].label !== 'OpenSearch') {
        handleDatabaseClick(database.name);
        setIsLoading(true);
      }
    },
    isSelectable: true,
    isExpanded: false,
    children: database.values.map((table) => ({
      label: (
        <div key={table.name}>
          <EuiToolTip position="right" content={table.name} delay="long">
            <EuiText>{_.truncate(table.name, { length: 50 })}</EuiText>
          </EuiToolTip>{' '}
        </div>
      ),
      id: `${database.name}_${table.name}`,
      icon: <EuiIcon type="tableDensityCompact" size="s" />,
      callback: () => {
        if (table.values.length === 0) {
          handleTableClick(table.name);
          setIsLoading(true);
        }
      },
      isSelectable: true,
      isExpanded: false,
      children: table.values.map((indexChild) => ({
        label: (
          <div key={indexChild.name}>
            <EuiToolTip position="right" content={indexChild.name} delay="long">
              <EuiText>{_.truncate(indexChild.name, { length: 50 })}</EuiText>
            </EuiToolTip>
          </div>
        ),
        id: `${table.name}_${indexChild.name}`,
        icon: <EuiIcon type="bolt" size="s" />,
        callback: () =>
          handleAccelerationIndexClick(
            selectedItems[0].label,
            database.name,
            table.name,
            indexChild.name
          ),
      })),
    })),
  }));

  return (
    <>
      <EuiFlexGroup>
        {isLoading ? (
          <EuiFlexGroup alignItems="center" gutterSize="s" direction="column">
            <EuiFlexItem>
              <EuiLoadingSpinner size="l" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>Loading databases</EuiFlexItem>
            <EuiFlexItem grow={false}>
              Loading can take more than 30s. Queries can be made after the data has loaded. Any
              queries run before the data is loaded will be queued
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : treeDataOpenSearch.length > 0 || treeDataDatabases.length > 0 ? (
          <EuiFlexItem grow={false}>
            {selectedItems[0].label === 'OpenSearch' ? (
              <EuiTreeView aria-label="Sample Folder Tree" items={treeDataOpenSearch} />
            ) : (
              <EuiTreeView aria-label="Sample Folder Tree" items={treeDataDatabases} />
            )}
          </EuiFlexItem>
        ) : (
          <EuiFlexItem grow={false}>
            <EuiEmptyPrompt
              iconType="alert"
              iconColor="danger"
              title={<h2>Error loading Datasources</h2>}
            />
          </EuiFlexItem>
        )}
        {indexFlyout}
      </EuiFlexGroup>
    </>
  );
};
