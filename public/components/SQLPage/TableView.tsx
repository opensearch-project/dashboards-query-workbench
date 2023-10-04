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
  EuiTreeView,
} from '@elastic/eui';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { CoreStart } from '../../../../../src/core/public';
import { ON_LOAD_QUERY, SKIPPING_INDEX } from '../../../common/constants';
import { AccelerationIndexFlyout } from './acceleration_index_flyout';
import { getJobId, pollQueryStatus } from './utils';

interface CustomView {
  http: CoreStart['http'];
  selectedItems: EuiComboBoxOptionOption[];
  updateSQLQueries: (query: string) => void;
}

export const TableView = ({ http, selectedItems, updateSQLQueries }: CustomView) => {
  const [tablenames, setTablenames] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [childData, setChildData] = useState<string[]>([]);
  const [selectedChildNode, setSelectedChildNode] = useState<string | null>(null);
  const [indexData, setIndexedData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [indiciesData, setIndiciesData] = useState<string[]>([]);
  const [indexFlyout, setIndexFlyout] = useState(<></>);

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
  const [childLoadingStates, setChildLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [tableLoadingStates, setTableLoadingStates] = useState<{ [key: string]: boolean }>({});

  const get_async_query_results = (id, http, callback) => {
    pollQueryStatus(id, http, callback);
  };

  const getSidebarContent = () => {
    if (selectedItems[0].label == 'OpenSearch') {
      setTablenames([]);
      const query = { query: ON_LOAD_QUERY };
      http
        .post(`/api/sql_console/sqlquery`, {
          body: JSON.stringify(query),
        })
        .then((res) => {
          const responseObj = res.data.resp ? JSON.parse(res.data.resp) : '';
          const datarows: any[][] = _.get(responseObj, 'datarows');
          const fields = datarows.map((data) => {
            return data[2];
          });
          setTablenames(fields);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      setIsLoading(true);
      setTablenames([]);
      const query = {
        lang: 'sql',
        query: `SHOW SCHEMAS IN ${selectedItems[0]['label']}`,
        datasource: selectedItems[0]['label'],
      };
      getJobId(query, http, (id) => {
        get_async_query_results(id, http, (data) => {
          setTablenames(data);
          setIsLoading(false);
        });
      });
    }
  };

  useEffect(() => {
    getSidebarContent();
  }, [selectedItems]);

  const handleNodeClick = (nodeLabel: string) => {
    setSelectedNode(nodeLabel);
    const query = {
      lang: 'sql',
      query: `SHOW TABLES IN ${selectedItems[0]['label']}.${nodeLabel}`,
      datasource: selectedItems[0]['label'],
    };
    setTableLoadingStates((prevState) => ({
      ...prevState,
      [nodeLabel]: true,
    }));
    getJobId(query, http, (id) => {
      get_async_query_results(id, http, (data) => {
        data = data.map((subArray) => subArray[1]);
        setChildData(data);

        setTableLoadingStates((prevState) => ({
          ...prevState,
          [nodeLabel]: false,
        }));
      });
    });
  };

  const callCoverQuery = (nodeLabel1: string) => {
    const coverQuery = {
      lang: 'sql',
      query: `SHOW INDEX ON ${selectedItems[0]['label']}.${selectedNode}.${nodeLabel1}`,
      datasource: selectedItems[0]['label'],
    };
    getJobId(coverQuery, http, (id) => {
      get_async_query_results(id, http, (data) => {
        data = [].concat(...data);
        indiciesData.concat(data);
        setIndexedData(indiciesData);
      });
    });
  };
  const handleChildClick = (nodeLabel1: string) => {
    setSelectedChildNode(nodeLabel1);
    const skipQuery = {
      lang: 'sql',
      query: `DESC SKIPPING INDEX ON ${selectedItems[0]['label']}.${selectedNode}.${nodeLabel1}`,
      datasource: selectedItems[0]['label'],
    };
    setChildLoadingStates((prevState) => ({
      ...prevState,
      [nodeLabel1]: true,
    }));

    getJobId(skipQuery, http, (id) => {
      get_async_query_results(id, http, (data) => {
        if (data.length > 0) {
          indiciesData.push(SKIPPING_INDEX);
          callCoverQuery(nodeLabel1);

          setChildLoadingStates((prevState) => ({
            ...prevState,
            [nodeLabel1]: false,
          }));
        }
      });
    });
  };

  const treeData = tablenames.map((database, index) => ({
    label: (
      <div>
        {database} {tableLoadingStates[database] && <EuiLoadingSpinner size="m" />}
      </div>
    ),
    icon: <EuiIcon type="database" size="m" />,
    id: 'element_' + index,
    callback: () => {
      handleNodeClick(database);
    },
    isSelectable: true,
    isExpanded: true,
    children:
      selectedNode === database
        ? childData.map((table) => ({
            label: (
              <div>
                {table} {childLoadingStates[table] && <EuiLoadingSpinner size="m" />}
              </div>
            ),
            id: `${database}_${table}`,
            icon: <EuiIcon type="tableDensityCompact" size="s" />,
            callback: () => {
              setIndexedData([]);
              handleChildClick(table);
            },
            sSelectable: true,
            isExpanded: true,
            children:
              selectedChildNode === table
                ? indexData.map((indexChild) => ({
                    label: indexChild,
                    id: `${table}_${indexChild}`,
                    icon: <EuiIcon type="bolt" size="s" />,
                    callback: () =>
                      handleAccelerationIndexClick(
                        selectedItems[0].label,
                        database,
                        table,
                        indexChild
                      ),
                  }))
                : undefined,
          }))
        : undefined,
  }));

  return (
    <>
      <EuiFlexGroup>
        {isLoading ? (
          <EuiFlexGroup alignItems="center" gutterSize='s'>
            <EuiFlexItem grow={false}>Loading your databases</EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiLoadingSpinner size="m" />
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : treeData.length > 0 ? (
          <EuiFlexItem grow={false}>
            <EuiTreeView aria-label="Sample Folder Tree" items={treeData} />
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
