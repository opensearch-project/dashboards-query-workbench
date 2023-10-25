/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { waitFor } from '@testing-library/dom';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import toJson from 'enzyme-to-json';
import React from 'react';
import { AccelerationIndexType } from '../../../../common/types';
import { AccelerationIndexFlyout } from '../acceleration_index_flyout';

describe('Acceleration index flyout', () => {
  configure({ adapter: new Adapter() });

  it('renders acceleration flyout with skipping index', async () => {
    const accelerationIndexType: AccelerationIndexType = 'skipping';
    const dataSource = 'myds';
    const database = 'mydb';
    const dataTable = 'mytable';
    const indexName = 'skipping_index';
    const resetFlyout = jest.fn();
    const updateSQLQueries = jest.fn();

    const wrapper = mount(
      <AccelerationIndexFlyout
        accelerationIndexType={accelerationIndexType}
        dataSource={dataSource}
        database={database}
        dataTable={dataTable}
        indexName={indexName}
        resetFlyout={resetFlyout}
        updateSQLQueries={updateSQLQueries}
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

  it('renders acceleration flyout with covering index', async () => {
    const accelerationIndexType: AccelerationIndexType = 'covering';
    const dataSource = 'myds';
    const database = 'mydb';
    const dataTable = 'mytable';
    const indexName = 'cv_idx';
    const resetFlyout = jest.fn();
    const updateSQLQueries = jest.fn();

    const wrapper = mount(
      <AccelerationIndexFlyout
        accelerationIndexType={accelerationIndexType}
        dataSource={dataSource}
        database={database}
        dataTable={dataTable}
        indexName={indexName}
        resetFlyout={resetFlyout}
        updateSQLQueries={updateSQLQueries}
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

  it('renders acceleration flyout with skipping index', async () => {
    const accelerationIndexType: AccelerationIndexType = 'materialized';
    const dataSource = 'myds';
    const database = 'mydb';
    const dataTable = 'mytable';
    const indexName = undefined;
    const resetFlyout = jest.fn();
    const updateSQLQueries = jest.fn();

    const wrapper = mount(
      <AccelerationIndexFlyout
        accelerationIndexType={accelerationIndexType}
        dataSource={dataSource}
        database={database}
        dataTable={dataTable}
        indexName={indexName}
        resetFlyout={resetFlyout}
        updateSQLQueries={updateSQLQueries}
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
