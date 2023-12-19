import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { HttpResponse } from '../../../../../../src/core/public';
import { httpClientMock } from '../../../../test/mocks';
import {
    mockDataSelectQuery
} from '../../../../test/mocks/mockData';
import { DataSelect } from '../DataSelect';

describe('Renders the Datasource picker component', () => {

  it('fetches the datasources and selects S3glue as source', async () => {
    const client = httpClientMock;
    client.get = jest.fn(() => {
      return (Promise.resolve(mockDataSelectQuery) as unknown) as HttpResponse;
    });
    
    const mockOnSelect = jest.fn();
    const mockDataSource = jest.fn()
    const asyncTest = () => {
      render(
        <DataSelect
            http={client}
            onSelect={mockOnSelect}
            urlDataSource={'glue_1'}
            asyncLoading={false}
      />
      );
    };

    await waitFor(() => {
        asyncTest()
        expect(screen.getByText('glue_1')).toBeInTheDocument();
    });
    expect(document.body.children[0]).toMatchSnapshot();
  });
  it('fetches the datasources and selects Opensearch as source', async () => {
    const client = httpClientMock;
    client.get = jest.fn(() => {
      return (Promise.resolve(mockDataSelectQuery) as unknown) as HttpResponse;
    });
    
    const mockOnSelect = jest.fn();
    const mockDataSource = jest.fn()
    const asyncTest = () => {
      render(
        <DataSelect
            http={client}
            onSelect={mockOnSelect}
            urlDataSource={'OpenSearch'}
            asyncLoading={false}
      />
      );
    };

    await waitFor(() => {
        asyncTest()
        expect(screen.getByText('OpenSearch')).toBeInTheDocument();
    });
    expect(document.body.children[0]).toMatchSnapshot();
  });
  
});