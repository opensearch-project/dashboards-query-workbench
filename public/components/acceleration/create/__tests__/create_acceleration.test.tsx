/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from '@elastic/eui';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { httpClientMock } from '../../../../../test/mocks';
import { mockDatasourcesQuery } from '../../../../../test/mocks/mockData';
import { CreateAcceleration } from '../create_acceleration';

describe('Create acceleration flyout components', () => {
  it('renders acceleration flyout component with default options', async () => {
    const selectedDatasource: EuiComboBoxOptionOption[] = [];
    const resetFlyout = jest.fn();
    const updateQueries = jest.fn();
    const client = httpClientMock;
    client.get = jest.fn().mockResolvedValue(mockDatasourcesQuery);

    render(
      <CreateAcceleration
        http={client}
        selectedDatasource={selectedDatasource}
        resetFlyout={resetFlyout}
        updateQueries={updateQueries}
      />
    );
    await waitFor(() => {
      expect(document.body).toMatchSnapshot();
    });
  });
});
