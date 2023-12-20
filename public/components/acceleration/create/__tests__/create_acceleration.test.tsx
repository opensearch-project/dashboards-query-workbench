/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from '@elastic/eui';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import toJson from 'enzyme-to-json';
import React from 'react';
import { httpClientMock } from '../../../../../test/mocks';
import { mockDatasourcesQuery } from '../../../../../test/mocks/mockData';
import { CreateAcceleration } from '../create_acceleration';

describe('Create acceleration flyout components', () => {
  configure({ adapter: new Adapter() });

  it('renders acceleration flyout component with default options', async () => {
    const selectedDatasource: EuiComboBoxOptionOption[] = [];
    const resetFlyout = jest.fn();
    const updateQueries = jest.fn();
    const client = httpClientMock;
    client.get = jest.fn().mockResolvedValue(mockDatasourcesQuery);

    const wrapper = mount(
      <CreateAcceleration
        http={client}
        selectedDatasource={selectedDatasource}
        resetFlyout={resetFlyout}
        updateQueries={updateQueries}
      />
    );

    fireEvent.click(screen.getByText('Copy Query to Editor'));

    wrapper.update();
    await waitFor(() => {
      expect(
        toJson(wrapper, {
          noKey: false,
          mode: 'deep',
        })
      ).toMatchSnapshot();
    });

    expect(document.body.children[0]).toMatchSnapshot();
  });
});
