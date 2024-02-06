/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { waitFor } from '@testing-library/react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import toJson from 'enzyme-to-json';
import React from 'react';
import { HttpResponse } from '../../../../../../src/core/public';
import { httpClientMock } from '../../../../test/mocks';
import { mockDataSelectQuery } from '../../../../test/mocks/mockData';
import { DataSelect } from '../DataSelect';

describe('Renders the Datasource picker component', () => {
  configure({ adapter: new Adapter() });

  it('fetches the datasources and selects S3glue as source', async () => {
    const client = httpClientMock;
    client.get = jest.fn(() => {
      return (Promise.resolve(mockDataSelectQuery) as unknown) as HttpResponse;
    });

    const mockOnSelect = jest.fn();
    const wrapper = mount(
      <DataSelect
        http={client}
        onSelect={mockOnSelect}
        urlDataSource={'glue_1'}
        asyncLoading={false}
      />
    );

    wrapper.update();
    await waitFor(() => {
      expect(
        toJson(wrapper, {
          noKey: false,
          mode: 'deep',
        })
      ).toMatchSnapshot();
      //   expect(screen.getByText('glue_1')).toBeInTheDocument();
    });
  });
  it('fetches the datasources and selects Opensearch as source', async () => {
    const client = httpClientMock;
    client.get = jest.fn(() => {
      return (Promise.resolve(mockDataSelectQuery) as unknown) as HttpResponse;
    });

    const mockOnSelect = jest.fn();
    const wrapper = mount(
      <DataSelect
        http={client}
        onSelect={mockOnSelect}
        urlDataSource={'OpenSearch'}
        asyncLoading={false}
      />
    );

    wrapper.update();
    await waitFor(() => {
      expect(
        toJson(wrapper, {
          noKey: false,
          mode: 'deep',
        })
      ).toMatchSnapshot();
    });
  });
});