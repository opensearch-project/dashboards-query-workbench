/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import React from 'react';
import { HttpResponse } from '../../../../../../src/core/public';
import { httpClientMock } from '../../../../test/mocks';
import {
  mockCoveringIndexQuery,
  mockDatabaseQuery,
  mockEmptyCoveringIndexQuery,
  mockEmptySkippingIndexQuery,
  mockJobId,
  mockMVEmptyQuery,
  mockMVquery,
  mockOpenSearchIndicies,
  mockSkippingIndexQuery,
  mockTableQuery,
} from '../../../../test/mocks/mockData';
import { TableView } from '../table_view';

describe('Render databases in tree', () => {
  it('fetches the tree when datasource is S3', async () => {
    const client = httpClientMock;
    client.post = jest.fn(() => {
      return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
    });
    client.get = jest.fn(() => {
      return (Promise.resolve(mockDatabaseQuery) as unknown) as HttpResponse;
    });
    const asyncTest = () => {
      render(
        <TableView
          http={client}
          selectedItems={[{ label: 'my_glue' }]}
          updateSQLQueries={() => {}}
          refreshTree={false}
        />
      );
    };
    asyncTest();
    await waitFor(() => {
      expect(screen.getByTestId('s3-datasource-tree')).toBeInTheDocument();
    });
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('fetches and displays indicies when datasource is OpenSearch', async () => {
    const client = httpClientMock;
    client.post = jest.fn(() => {
      return (Promise.resolve(mockOpenSearchIndicies) as unknown) as HttpResponse;
    });

    const asyncTest = () => {
      render(
        <TableView
          http={client}
          selectedItems={[{ label: 'OpenSearch' }]}
          updateSQLQueries={() => {}}
          refreshTree={false}
        />
      );
    };
    await asyncTest();
    expect(screen.getByTestId('openesearch-tree')).toBeInTheDocument();
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('fetches default database in the side tree', async () => {
    const client = httpClientMock;
    client.post = jest.fn(() => {
      return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
    });
    client.get = jest.fn(() => {
      return (Promise.resolve(mockDatabaseQuery) as unknown) as HttpResponse;
    });

    const { getByText } = render(
      <TableView
        http={client}
        selectedItems={[{ label: 'my_glue' }]}
        updateSQLQueries={() => {}}
        refreshTree={false}
      />
    );
    await waitForElementToBeRemoved(await getByText('Loading may take over 30 seconds'));
    await waitFor(() => {
      expect(getByText('default')).toBeInTheDocument();
    });
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('fetches Materialized view in the Side tree', async () => {
    const client = httpClientMock;
    client.post = jest.fn(() => {
      return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
    });
    client.get = jest.fn(() => {
      return (Promise.resolve(mockDatabaseQuery) as unknown) as HttpResponse;
    });

    const { getByText } = render(
      <TableView
        http={client}
        selectedItems={[{ label: 'my_glue' }]}
        updateSQLQueries={() => {}}
        refreshTree={false}
      />
    );
    await waitForElementToBeRemoved(await getByText('Loading may take over 30 seconds'));
    await waitFor(() => {
      fireEvent.click(getByText('default'));
    });
    act(() => {
      fireEvent.click(getByText('Load Materialized View'));
    });

    await waitFor(() => {
      client.post = jest.fn(() => {
        return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
      });
      client.get = jest.fn(() => {
        return (Promise.resolve(mockMVquery) as unknown) as HttpResponse;
      });

      expect(getByText('http_count_view')).toBeInTheDocument();
    });
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('fetches No materilaized views badge in side tree', async () => {
    const client = httpClientMock;
    client.post = jest.fn(() => {
      return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
    });
    client.get = jest.fn(() => {
      return (Promise.resolve(mockDatabaseQuery) as unknown) as HttpResponse;
    });

    const { getByText } = render(
      <TableView
        http={client}
        selectedItems={[{ label: 'my_glue' }]}
        updateSQLQueries={() => {}}
        refreshTree={false}
      />
    );
    await waitForElementToBeRemoved(await getByText('Loading may take over 30 seconds'));
    await waitFor(() => {
      fireEvent.click(getByText('default'));
    });
    act(() => {
      fireEvent.click(getByText('Load Materialized View'));
    });

    await waitFor(() => {
      client.post = jest.fn(() => {
        return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
      });
      client.get = jest.fn(() => {
        return (Promise.resolve(mockMVEmptyQuery) as unknown) as HttpResponse;
      });

      expect(getByText('No Materialized View')).toBeInTheDocument();
    });
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('fetches and displays tables in the side tree', async () => {
    const client = httpClientMock;
    client.post = jest.fn(() => {
      return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
    });
    client.get = jest.fn(() => {
      return (Promise.resolve(mockDatabaseQuery) as unknown) as HttpResponse;
    });
    const { getByText } = render(
      <TableView
        http={client}
        selectedItems={[{ label: 'my_glue' }]}
        updateSQLQueries={() => {}}
        refreshTree={false}
      />
    );
    await waitForElementToBeRemoved(await getByText('Loading may take over 30 seconds'));
    fireEvent.click(getByText('default'));

    await act(() => {
      client.post = jest.fn(() => {
        return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
      });
      client.get = jest.fn(() => {
        return (Promise.resolve(mockTableQuery) as unknown) as HttpResponse;
      });
    });
    await waitFor(() => {
      expect(screen.getByText('http_logs2')).toBeInTheDocument();
    });
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('fetches and displays skipping index in the side tree', async () => {
    const client = httpClientMock;
    client.post = jest.fn(() => {
      return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
    });
    client.get = jest.fn(() => {
      return (Promise.resolve(mockDatabaseQuery) as unknown) as HttpResponse;
    });
    const { getByText } = render(
      <TableView
        http={client}
        selectedItems={[{ label: 'my_glue' }]}
        updateSQLQueries={() => {}}
        refreshTree={false}
      />
    );
    await waitForElementToBeRemoved(await getByText('Loading may take over 30 seconds'));
    fireEvent.click(getByText('default'));

    await act(() => {
      client.post = jest.fn(() => {
        return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
      });
      client.get = jest.fn(() => {
        return (Promise.resolve(mockTableQuery) as unknown) as HttpResponse;
      });
    });
    await waitFor(() => {
      expect(screen.getByText('http_logs2')).toBeInTheDocument();
    });
    fireEvent.click(getByText('http_logs2'));
    act(() => {
      client.post = jest.fn(() => {
        return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
      });
      client.get = jest.fn(() => {
        return (Promise.resolve(mockSkippingIndexQuery) as unknown) as HttpResponse;
      });
      client.post = jest.fn(() => {
        return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
      });
      client.get = jest.fn(() => {
        return (Promise.resolve(mockCoveringIndexQuery) as unknown) as HttpResponse;
      });
    });
    await waitFor(() => {
      expect(screen.getByText('skipping_index')).toBeInTheDocument();
      expect(screen.getByText('status_clientip_and_day')).toBeInTheDocument();
    });
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('fetches and displays No indicies in the side tree', async () => {
    const client = httpClientMock;
    client.post = jest.fn(() => {
      return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
    });
    client.get = jest.fn(() => {
      return (Promise.resolve(mockDatabaseQuery) as unknown) as HttpResponse;
    });
    const { getByText } = render(
      <TableView
        http={client}
        selectedItems={[{ label: 'my_glue' }]}
        updateSQLQueries={() => {}}
        refreshTree={false}
      />
    );
    await waitForElementToBeRemoved(await getByText('Loading may take over 30 seconds'));
    fireEvent.click(getByText('default'));

    await act(() => {
      client.post = jest.fn(() => {
        return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
      });
      client.get = jest.fn(() => {
        return (Promise.resolve(mockTableQuery) as unknown) as HttpResponse;
      });
    });
    await waitFor(() => {
      expect(screen.getByText('http_logs2')).toBeInTheDocument();
    });
    fireEvent.click(getByText('http_logs2'));
    act(() => {
      client.post = jest.fn(() => {
        return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
      });
      client.get = jest.fn(() => {
        return (Promise.resolve(mockEmptySkippingIndexQuery) as unknown) as HttpResponse;
      });
      client.post = jest.fn(() => {
        return (Promise.resolve(mockJobId) as unknown) as HttpResponse;
      });
      client.get = jest.fn(() => {
        return (Promise.resolve(mockEmptyCoveringIndexQuery) as unknown) as HttpResponse;
      });
    });
    await waitFor(() => {
      expect(screen.getByText('No Indicies')).toBeInTheDocument();
    });
    expect(document.body.children[0]).toMatchSnapshot();
  });
});
