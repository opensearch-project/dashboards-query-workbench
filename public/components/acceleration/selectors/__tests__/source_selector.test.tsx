/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from '@elastic/eui';
import { waitFor } from '@testing-library/dom';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import toJson from 'enzyme-to-json';
import React from 'react';
import { CreateAccelerationForm } from '../../../../../common/types';
import { httpClientMock } from '../../../../../test/mocks';
import { createAccelerationEmptyDataMock } from '../../../../../test/mocks/accelerationMock';
import { mockDatasourcesQuery } from '../../../../../test/mocks/mockData';
import { AccelerationDataSourceSelector } from '../source_selector';

describe('Source selector components', () => {
  configure({ adapter: new Adapter() });

  it('renders source selector with default options', async () => {
    const accelerationFormData = createAccelerationEmptyDataMock;
    const selectedDatasource: EuiComboBoxOptionOption[] = [];
    const setAccelerationFormData = jest.fn();
    const client = httpClientMock;
    client.get = jest.fn().mockResolvedValue(mockDatasourcesQuery);

    const wrapper = mount(
      <AccelerationDataSourceSelector
        http={client}
        selectedDatasource={selectedDatasource}
        accelerationFormData={accelerationFormData}
        setAccelerationFormData={setAccelerationFormData}
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

  it('renders source selector with different options', async () => {
    const selectedDatasource: EuiComboBoxOptionOption[] = [{ label: 'ds' }];
    const accelerationFormData: CreateAccelerationForm = {
      ...createAccelerationEmptyDataMock,
      dataSource: 'ds',
      database: 'db',
      dataTable: 'tb',
    };
    const setAccelerationFormData = jest.fn();
    const client = httpClientMock;
    client.get = jest.fn().mockResolvedValue(mockDatasourcesQuery);
    client.post = jest.fn().mockResolvedValue([]);
    const wrapper = mount(
      <AccelerationDataSourceSelector
        selectedDatasource={selectedDatasource}
        http={client}
        accelerationFormData={accelerationFormData}
        setAccelerationFormData={setAccelerationFormData}
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
