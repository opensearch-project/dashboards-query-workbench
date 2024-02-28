/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom/extend-expect';
import { configure, fireEvent, render } from '@testing-library/react';
import { AsyncQueryStatus } from '../../../common/types/index';

import 'mutationobserver-shim';
import React from 'react';
import 'regenerator-runtime';
import { mockQueries, mockQueryResults } from '../../../test/mocks/mockData';
import { MESSAGE_TAB_LABEL } from '../../utils/constants';
import { ItemIdToExpandedRowMap, QueryResult, ResponseDetail, Tab } from '../Main/main';
import { QueryResults } from './QueryResults';

configure({ testIdAttribute: 'data-test-subj' });

function renderSQLQueryResults(
  mockQueryResultsParameter: Array<ResponseDetail<QueryResult>>,
  mockQueriesParameter: string[] = [],
  mockSearchQuery: string = '',
  onSelectedTabIdChange: (tab: Tab) => void,
  onQueryChange: () => {},
  updateExpandedMap: (map: ItemIdToExpandedRowMap) => {},
  getJson: (queries: string[]) => void,
  getJdbc: (queries: string[]) => void,
  getCsv: (queries: string[]) => void,
  getText: (queries: string[]) => void,
  setIsResultFullScreen: (isFullScreen: boolean) => void
) {
  return {
    ...render(
      <QueryResults
        language="SQL"
        queries={mockQueriesParameter}
        queryResults={mockQueryResultsParameter}
        queryResultsJDBC={''}
        queryResultsJSON={''}
        queryResultsCSV={''}
        queryResultsTEXT={''}
        messages={[]}
        selectedTabId={'0'}
        selectedTabName={MESSAGE_TAB_LABEL}
        onSelectedTabIdChange={onSelectedTabIdChange}
        itemIdToExpandedRowMap={{}}
        onQueryChange={onQueryChange}
        updateExpandedMap={updateExpandedMap}
        searchQuery={mockSearchQuery}
        tabsOverflow={true}
        getJson={getJson}
        getJdbc={getJdbc}
        getCsv={getCsv}
        getText={getText}
        isResultFullScreen={false}
        setIsResultFullScreen={setIsResultFullScreen}
        asyncLoadingStatus={AsyncQueryStatus.Success}
        asyncQueryError=""
        selectedDatasource={[{ label: 'OpenSearch' }]}
        cancelAsyncQuery={() => {}}
      />
    ),
  };
}

describe('<QueryResults /> spec', () => {
  it('renders the component with no data', async () => {
    (window as any).HTMLElement.prototype.scrollBy = function () {};
    expect(document.body.children[0]).toMatchSnapshot();
  });
});

describe('<QueryResults with data/> spec', () => {
  const onSelectedTabIdChange = jest.fn();
  const onQueryChange = jest.fn();
  const updateExpandedMap = jest.fn();
  const mockSearchQuery = '';
  const getRawResponse = jest.fn();
  const getJdbc = jest.fn();
  const getCsv = jest.fn();
  const getText = jest.fn();
  const setIsResultFullScreen = jest.fn();
  (window as any).HTMLElement.prototype.scrollBy = jest.fn();

  it('renders the component with mock query results', async () => {
    const { getAllByRole, getByText, getAllByText, getAllByLabelText } = renderSQLQueryResults(
      mockQueryResults,
      mockQueries,
      mockSearchQuery,
      onSelectedTabIdChange,
      onQueryChange,
      updateExpandedMap,
      getRawResponse,
      getJdbc,
      getCsv,
      getText,
      setIsResultFullScreen
    );

    expect(document.body.children[0]).toMatchSnapshot();

    // It tests that the selected tab is the first tab with results
    expect(getAllByRole('tab')[0].getAttribute('aria-selected')).toEqual('false');
    expect(getAllByRole('tab')[1].getAttribute('aria-selected')).toEqual('true');

    // It tests that there is one tab for each QueryResult
    expect(getAllByRole('tab')).toHaveLength(11);

    // It tests Tab button
    await fireEvent.click(getAllByRole('tab')[5]);

    // TODO: uncomment this test when sorting is fixed
    // It tests sorting
    // await fireEvent.click(getAllByTestId('tableHeaderSortButton')[1]);

    // It tests pagination
    await fireEvent.click(getAllByLabelText('Page 2 of 2')[0]);
    await fireEvent.click(getAllByText('Rows per page', { exact: false })[0]);
    expect(getByText('10 rows')).toBeInTheDocument();
    expect(getByText('20 rows')).toBeInTheDocument();
    expect(getByText('50 rows')).toBeInTheDocument();
    expect(getByText('100 rows')).toBeInTheDocument();
    await fireEvent.click(getByText('20 rows'));
  });

  it('renders the component with mock query results and tests the dowmload buttons', async () => {
    const { getByText } = renderSQLQueryResults(
      mockQueryResults,
      mockQueries,
      mockSearchQuery,
      onSelectedTabIdChange,
      onQueryChange,
      updateExpandedMap,
      getRawResponse,
      getJdbc,
      getCsv,
      getText,
      setIsResultFullScreen
    );
    expect(getByText('Download')).toBeInTheDocument();
    await fireEvent.click(getByText('Download'));
    expect(getByText('Download JSON')).toBeInTheDocument();
    expect(getByText('Download JDBC')).toBeInTheDocument();
    expect(getByText('Download CSV')).toBeInTheDocument();
    expect(getByText('Download Text')).toBeInTheDocument();

    expect(document.body.children[0]).toMatchSnapshot();
  });
});

function renderPPLQueryResults(
  mockQueryResultsParameter: Array<ResponseDetail<QueryResult>>,
  mockQueriesParameter: string[] = [],
  mockSearchQuery: string = '',
  onSelectedTabIdChange: (tab: Tab) => void,
  onQueryChange: () => {},
  updateExpandedMap: (map: ItemIdToExpandedRowMap) => {},
  getJson: (queries: string[]) => void,
  getJdbc: (queries: string[]) => void,
  getCsv: (queries: string[]) => void,
  getText: (queries: string[]) => void,
  setIsResultFullScreen: (isFullScreen: boolean) => void
) {
  return {
    ...render(
      <QueryResults
        language="PPL"
        queries={mockQueriesParameter}
        queryResults={mockQueryResultsParameter}
        queryResultsJDBC={''}
        queryResultsJSON={''}
        queryResultsCSV={''}
        queryResultsTEXT={''}
        messages={[]}
        selectedTabId={'0'}
        selectedTabName={MESSAGE_TAB_LABEL}
        onSelectedTabIdChange={onSelectedTabIdChange}
        itemIdToExpandedRowMap={{}}
        onQueryChange={onQueryChange}
        updateExpandedMap={updateExpandedMap}
        searchQuery={mockSearchQuery}
        tabsOverflow={true}
        getJson={getJson}
        getJdbc={getJdbc}
        getCsv={getCsv}
        getText={getText}
        isResultFullScreen={false}
        setIsResultFullScreen={setIsResultFullScreen}
        asyncLoadingStatus={AsyncQueryStatus.Success}
        asyncQueryError=""
        selectedDatasource={[{ label: 'OpenSearch' }]}
        cancelAsyncQuery={() => {}}
      />
    ),
  };
}

describe('<QueryResults /> empty spec', () => {
  it('renders the component with no data', async () => {
    (window as any).HTMLElement.prototype.scrollBy = function () {};

    expect(document.body.children[0]).toMatchSnapshot();
  });
});

describe('<QueryResults with PPL data/> spec', () => {
  const onSelectedTabIdChange = jest.fn();
  const onQueryChange = jest.fn();
  const updateExpandedMap = jest.fn();
  const mockSearchQuery = '';
  const getRawResponse = jest.fn();
  const getJdbc = jest.fn();
  const getCsv = jest.fn();
  const getText = jest.fn();
  const setIsResultFullScreen = jest.fn();
  (window as any).HTMLElement.prototype.scrollBy = jest.fn();

  it('renders the component with mock query results', async () => {
    const { getAllByRole, getByText, getAllByText, getAllByLabelText } = renderPPLQueryResults(
      mockQueryResults,
      mockQueries,
      mockSearchQuery,
      onSelectedTabIdChange,
      onQueryChange,
      updateExpandedMap,
      getRawResponse,
      getJdbc,
      getCsv,
      getText,
      setIsResultFullScreen
    );

    expect(document.body.children[0]).toMatchSnapshot();

    // It tests that the selected tab is the first tab with results
    expect(getAllByRole('tab')[0].getAttribute('aria-selected')).toEqual('false');
    expect(getAllByRole('tab')[1].getAttribute('aria-selected')).toEqual('true');

    // It tests that there is one tab for each QueryResult
    expect(getAllByRole('tab')).toHaveLength(11);

    // It tests Tab button
    await fireEvent.click(getAllByRole('tab')[5]);

    // TODO: uncomment this test when sorting is fixed
    // It tests sorting
    // await fireEvent.click(getAllByTestId('tableHeaderSortButton')[1]);

    // It tests pagination
    await fireEvent.click(getAllByLabelText('Page 2 of 2')[0]);
    await fireEvent.click(getAllByText('Rows per page', { exact: false })[0]);
    expect(getByText('10 rows')).toBeInTheDocument();
    expect(getByText('20 rows')).toBeInTheDocument();
    expect(getByText('50 rows')).toBeInTheDocument();
    expect(getByText('100 rows')).toBeInTheDocument();
    await fireEvent.click(getByText('20 rows'));
  });
});

describe('<AsyncQueryResults /> spec', () => {
  it('renders async query loading component', async () => {
    const asyncTest = () => {
      render(
        <QueryResults
          language="SQL"
          queries={mockQueries}
          queryResults={mockQueryResults}
          queryResultsJDBC={''}
          queryResultsJSON={''}
          queryResultsCSV={''}
          queryResultsTEXT={''}
          messages={[]}
          selectedTabId={'0'}
          selectedTabName={MESSAGE_TAB_LABEL}
          onSelectedTabIdChange={() => {}}
          itemIdToExpandedRowMap={{}}
          onQueryChange={() => {}}
          updateExpandedMap={() => {}}
          searchQuery={''}
          tabsOverflow={true}
          getJson={() => {}}
          getJdbc={() => {}}
          getCsv={() => {}}
          getText={() => {}}
          isResultFullScreen={false}
          setIsResultFullScreen={() => {}}
          asyncLoadingStatus={AsyncQueryStatus.Running}
          asyncQueryError=""
          selectedDatasource={[{ label: 'mys3' }]}
          cancelAsyncQuery={() => {}}
        />
      );
    };
    await asyncTest();
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('renders async query failure component', async () => {
    const asyncTest = () => {
      render(
        <QueryResults
          language="SQL"
          queries={mockQueries}
          queryResults={mockQueryResults}
          queryResultsJDBC={''}
          queryResultsJSON={''}
          queryResultsCSV={''}
          queryResultsTEXT={''}
          messages={[]}
          selectedTabId={'0'}
          selectedTabName={MESSAGE_TAB_LABEL}
          onSelectedTabIdChange={() => {}}
          itemIdToExpandedRowMap={{}}
          onQueryChange={() => {}}
          updateExpandedMap={() => {}}
          searchQuery={''}
          tabsOverflow={true}
          getJson={() => {}}
          getJdbc={() => {}}
          getCsv={() => {}}
          getText={() => {}}
          isResultFullScreen={false}
          setIsResultFullScreen={() => {}}
          asyncLoadingStatus={AsyncQueryStatus.Failed}
          asyncQueryError="custom error"
          selectedDatasource={[{ label: 'mys3' }]}
          cancelAsyncQuery={() => {}}
        />
      );
    };
    await asyncTest();
    expect(document.body.children[0]).toMatchSnapshot();
  });
});
