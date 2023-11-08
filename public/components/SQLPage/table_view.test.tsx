import '@testing-library/jest-dom';
import React from 'react';
import { httpClientMock } from '../../../test/mocks';

import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { HttpResponse } from '../../../../../src/core/public';
import { mockDatabaseQuery, mockJobId, mockOpenSearchIndicies } from '../../../test/mocks/mockData';
import { TableView } from './table_view';

describe('Render databases in tree', () => {
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
    expect(document.body.children[0]).toMatchSnapshot();
  });
  it('fetches and displays database nodes when datasource is s3', async () => {
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
    await asyncTest();
    expect(document.body.children[0]).toMatchSnapshot();
  });
});
