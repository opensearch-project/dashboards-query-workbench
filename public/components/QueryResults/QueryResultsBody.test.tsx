/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom/extend-expect';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import QueryResultsBody from './QueryResultsBody';
// @ts-ignore
import { Pager } from '@elastic/eui/lib';
// @ts-ignore
import { SortableProperties } from '@elastic/eui/lib/services';
import userEvent from '@testing-library/user-event';
import {
  mockErrorMessage,
  mockQueryResultJDBCResponse,
  mockQueryResults,
  mockSortableColumns,
  mockSuccessfulMessage,
} from '../../../test/mocks/mockData';
import { QueryMessage, QueryResult } from '../Main/main';

function renderSQLQueryResultsBody(
  mockQueries: string[],
  mockQueryResultsSelected: QueryResult,
  mockQueryResultsRaw: string,
  mockSortableProperties: SortableProperties,
  messages: QueryMessage[],
  onQueryChange: (query: object) => void,
  updateExpandedMap: (map: object) => void,
  onChangeItemsPerPage: (itemsPerPage: number) => void,
  getJdbc: (queries: string[]) => void,
  getCsv: (queries: string[]) => void,
  getText: (queries: string[]) => void
) {
  return {
    ...render(
      <QueryResultsBody
        language="SQL"
        queries={[]}
        selectedTabId={'0'}
        selectedTabName={'Messages'}
        tabNames={['Messages', 'Index_1']}
        queryResultSelected={mockQueryResultsSelected}
        queryResultsJDBC={mockQueryResultsRaw}
        queryResultsCSV={mockQueryResultsRaw}
        queryResultsTEXT={mockQueryResultsRaw}
        messages={[]}
        searchQuery={''}
        onQueryChange={onQueryChange}
        pager={new Pager(0, 10)}
        itemsPerPage={10}
        firstItemIndex={0}
        lastItemIndex={10}
        onChangeItemsPerPage={onChangeItemsPerPage}
        onChangePage={() => {}}
        sortedColumn={'col1'}
        sortableProperties={mockSortableProperties}
        itemIdToExpandedRowMap={{}}
        updateExpandedMap={updateExpandedMap}
        getJdbc={getJdbc}
        getCsv={getCsv}
        getText={getText}
        selectedDatasource={[{ label: 'OpenSearch' }]}
      />
    ),
  };
}

describe('<QueryResultsBody with SQL language/> spec', () => {
  afterEach(cleanup);
  const onQueryChange = jest.fn();
  const updateExpandedMap = jest.fn();
  const onChangeItemsPerPage = jest.fn();
  const getJdbc = jest.fn();
  const getCsv = jest.fn();
  const getText = jest.fn();

  it('renders the component', () => {
    const mockSortableProperties = new SortableProperties(
      [
        {
          name: '',
          getValue: () => '',
          isAscending: true,
        },
      ],
      ''
    );

    const { queryByTestId } = renderSQLQueryResultsBody(
      undefined,
      undefined,
      undefined,
      mockSortableProperties,
      mockErrorMessage,
      onQueryChange,
      updateExpandedMap,
      onChangeItemsPerPage,
      getJdbc,
      getCsv,
      getText
    );

    // Download buttons, pagination, search area, table should not be visible when there is no data
    expect(queryByTestId('Download')).toBeNull();
    expect(queryByTestId('Rows per page')).toBeNull();
    expect(queryByTestId('tableRow')).toBeNull();
    expect(queryByTestId('Search')).toBeNull();

    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('renders component with mock QueryResults data', async () => {
    const mockSortableProperties = new SortableProperties(
      mockSortableColumns,
      mockSortableColumns[0].name
    );

    (window as any).HTMLElement.prototype.scrollIntoView = function () {};

    const {
      getAllByText,
      getAllByLabelText,
      getByText,
      getByPlaceholderText,
    } = renderSQLQueryResultsBody(
      undefined,
      mockQueryResults[0].data,
      mockQueryResultJDBCResponse.data.resp,
      mockSortableProperties,
      mockSuccessfulMessage,
      onQueryChange,
      updateExpandedMap,
      onChangeItemsPerPage,
      getJdbc,
      getCsv,
      getText
    );
    expect(document.body.children[0]).toMatchSnapshot();

    // Test sorting
    // await fireEvent.click(getAllByTestId('tableHeaderSortButton')[0]);
    // expect(onSort).toHaveBeenCalled();

    // Test pagination
    await fireEvent.click(getAllByText('Rows per page', { exact: false })[0]);
    expect(getByText('10 rows')).toBeInTheDocument();
    expect(getByText('20 rows')).toBeInTheDocument();
    expect(getByText('50 rows')).toBeInTheDocument();
    expect(getByText('100 rows')).toBeInTheDocument();
    await fireEvent.click(getByText('20 rows'));
    expect(onChangeItemsPerPage).toHaveBeenCalled();

    // Test nested tables - click on row icon
    expect(getAllByLabelText('Expand').length).toBeGreaterThan(0);
    await fireEvent.click(getAllByLabelText('Expand')[0]);
    expect(updateExpandedMap).toHaveBeenCalledTimes(1);

    // Test nested tables - click on cell link
    await fireEvent.click(getAllByText('manufacturer: [2]', { exact: false })[0]);
    expect(updateExpandedMap).toHaveBeenCalled();

    // Tests download button
    const downloadButton = getAllByText('Download')[0];
    expect(downloadButton).not.toBe(null);
    await fireEvent.click(downloadButton);
    expect(getByText('Download JDBC')).toBeInTheDocument();
    expect(getByText('Download CSV')).toBeInTheDocument();
    expect(getByText('Download Text')).toBeInTheDocument();
    await fireEvent.click(getByText('Download JDBC'));
    await fireEvent.click(getByText('Download CSV'));
    await fireEvent.click(getByText('Download Text'));

    // Test search field
    const searchField = getByPlaceholderText('Search keyword');
    expect(searchField).toBeInTheDocument();
    act(() => {
      userEvent.type(searchField, 'Test');
    });
    waitFor(() => {
      expect(onQueryChange).toHaveBeenCalled();
    });

    // Test collapse button
    expect(document.body.children[0]).toMatchSnapshot();
    expect(getAllByLabelText('Collapse').length).toBeGreaterThan(0);
    await fireEvent.click(getAllByLabelText('Collapse')[0]);
    expect(updateExpandedMap).toHaveBeenCalled();
  });
});

function renderPPLQueryResultsBody(
  mockQueries: string[],
  mockQueryResultsSelected: QueryResult,
  mockQueryResultsRaw: string,
  mockSortableProperties: SortableProperties,
  messages: QueryMessage[],
  onQueryChange: (query: object) => void,
  updateExpandedMap: (map: object) => void,
  onChangeItemsPerPage: (itemsPerPage: number) => void,
  getJdbc: (queries: string[]) => void,
  getCsv: (queries: string[]) => void,
  getText: (queries: string[]) => void
) {
  return {
    ...render(
      <QueryResultsBody
        language="PPL"
        queries={[]}
        selectedTabId={'0'}
        selectedTabName={'Messages'}
        tabNames={['Messages', 'Index_1']}
        queryResultSelected={mockQueryResultsSelected}
        queryResultsJDBC={mockQueryResultsRaw}
        queryResultsCSV={mockQueryResultsRaw}
        queryResultsTEXT={mockQueryResultsRaw}
        messages={[]}
        searchQuery={''}
        onQueryChange={onQueryChange}
        pager={new Pager(0, 10)}
        itemsPerPage={10}
        firstItemIndex={0}
        lastItemIndex={10}
        onChangeItemsPerPage={onChangeItemsPerPage}
        onChangePage={() => {}}
        sortedColumn={'col1'}
        sortableProperties={mockSortableProperties}
        itemIdToExpandedRowMap={{}}
        updateExpandedMap={updateExpandedMap}
        getJdbc={getJdbc}
        getCsv={getCsv}
        getText={getText}
      />
    ),
  };
}

describe('<QueryResultsBody with PPL language/> spec', () => {
  afterEach(cleanup);
  const onQueryChange = jest.fn();
  const updateExpandedMap = jest.fn();
  const onChangeItemsPerPage = jest.fn();
  const getJdbc = jest.fn();
  const getCsv = jest.fn();
  const getText = jest.fn();

  it('renders the component', () => {
    const mockSortableProperties = new SortableProperties(
      [
        {
          name: '',
          getValue: () => '',
          isAscending: true,
        },
      ],
      ''
    );

    const { queryByTestId } = renderPPLQueryResultsBody(
      undefined,
      undefined,
      undefined,
      mockSortableProperties,
      mockErrorMessage,
      onQueryChange,
      updateExpandedMap,
      onChangeItemsPerPage,
      getJdbc,
      getCsv,
      getText
    );

    // Download buttons, pagination, search area, table should not be visible when there is no data
    expect(queryByTestId('Download')).toBeNull();
    expect(queryByTestId('Rows per page')).toBeNull();
    expect(queryByTestId('tableRow')).toBeNull();
    expect(queryByTestId('Search')).toBeNull();

    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('renders component with mock QueryResults data', async () => {
    const mockSortableProperties = new SortableProperties(
      mockSortableColumns,
      mockSortableColumns[0].name
    );

    (window as any).HTMLElement.prototype.scrollIntoView = function () {};

    const { getAllByText, getAllByLabelText, getByText } = renderPPLQueryResultsBody(
      undefined,
      mockQueryResults[0].data,
      mockQueryResultJDBCResponse.data.resp,
      mockSortableProperties,
      mockSuccessfulMessage,
      onQueryChange,
      updateExpandedMap,
      onChangeItemsPerPage,
      getJdbc,
      getCsv,
      getText
    );
    expect(document.body.children[0]).toMatchSnapshot();

    // Test sorting
    // await fireEvent.click(getAllByTestId('tableHeaderSortButton')[0]);
    // expect(onSort).toHaveBeenCalled();

    // Test pagination
    await fireEvent.click(getAllByText('Rows per page', { exact: false })[0]);
    expect(getByText('10 rows')).toBeInTheDocument();
    expect(getByText('20 rows')).toBeInTheDocument();
    expect(getByText('50 rows')).toBeInTheDocument();
    expect(getByText('100 rows')).toBeInTheDocument();
    await fireEvent.click(getByText('20 rows'));
    expect(onChangeItemsPerPage).toHaveBeenCalled();

    // Test nested tables - click on row icon
    expect(getAllByLabelText('Expand').length).toBeGreaterThan(0);
    await fireEvent.click(getAllByLabelText('Expand')[0]);
    expect(updateExpandedMap).toHaveBeenCalledTimes(1);

    // Test nested tables - click on cell link
    await fireEvent.click(getAllByText('manufacturer: [2]', { exact: false })[0]);
    expect(updateExpandedMap).toHaveBeenCalled();
  });
});
