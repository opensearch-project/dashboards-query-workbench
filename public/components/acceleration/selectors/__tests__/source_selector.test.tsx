/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from '@elastic/eui';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { CreateAccelerationForm } from '../../../../../common/types';
import { httpClientMock } from '../../../../../test/mocks';
import { createAccelerationEmptyDataMock } from '../../../../../test/mocks/accelerationMock';
import { mockDatasourcesQuery } from '../../../../../test/mocks/mockData';
import { AccelerationDataSourceSelector } from '../source_selector';

describe('Source selector components', () => {
  it('renders source selector with default options', async () => {
    const accelerationFormData = createAccelerationEmptyDataMock;
    const selectedDatasource: EuiComboBoxOptionOption[] = [];
    const setAccelerationFormData = jest.fn();
    const client = httpClientMock;
    client.get = jest.fn().mockResolvedValue(mockDatasourcesQuery);

    render(
      <AccelerationDataSourceSelector
        http={client}
        selectedDatasource={selectedDatasource}
        accelerationFormData={accelerationFormData}
        setAccelerationFormData={setAccelerationFormData}
      />
    );
    await waitFor(() => {
      expect(document.body).toMatchSnapshot();
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
    render(
      <AccelerationDataSourceSelector
        selectedDatasource={selectedDatasource}
        http={client}
        accelerationFormData={accelerationFormData}
        setAccelerationFormData={setAccelerationFormData}
      />
    );
    await waitFor(() => {
      expect(document.body).toMatchSnapshot();
    });
  });
});
