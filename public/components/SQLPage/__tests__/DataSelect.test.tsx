/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { HttpResponse } from '../../../../../../src/core/public';
import { httpClientMock } from '../../../../test/mocks';
import { mockDataSelectQuery } from '../../../../test/mocks/mockData';
import { DataSelect } from '../DataSelect';

describe('Renders the Datasource picker component', () => {
  it('fetches the datasources and selects S3glue as source', async () => {
    const client = httpClientMock;
    client.get = jest.fn(() => {
      return (Promise.resolve(mockDataSelectQuery) as unknown) as HttpResponse;
    });

    const mockOnSelect = jest.fn();
    render(
      <DataSelect
        http={client}
        onSelect={mockOnSelect}
        urlDataSource={'glue_1'}
        asyncLoading={false}
      />
    );

    await waitFor(() => {
      expect(document.body).toMatchSnapshot();
    });
  });
  it('fetches the datasources and selects Opensearch as source', async () => {
    const client = httpClientMock;
    client.get = jest.fn(() => {
      return (Promise.resolve(mockDataSelectQuery) as unknown) as HttpResponse;
    });

    const mockOnSelect = jest.fn();
    render(
      <DataSelect
        http={client}
        onSelect={mockOnSelect}
        urlDataSource={'OpenSearch'}
        asyncLoading={false}
      />
    );

    await waitFor(() => {
      expect(document.body).toMatchSnapshot();
    });
  });
});
