/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { AccelerationIndexType } from '../../../../common/types';
import { AccelerationIndexFlyout } from '../acceleration_index_flyout';

describe('Acceleration index flyout', () => {
  it('renders acceleration flyout with skipping index', async () => {
    const accelerationIndexType: AccelerationIndexType = 'skipping';
    const dataSource = 'myds';
    const database = 'mydb';
    const dataTable = 'mytable';
    const indexName = 'skipping_index';
    const resetFlyout = jest.fn();
    const updateSQLQueries = jest.fn();

    render(
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
    await waitFor(() => {
      expect(document.body).toMatchSnapshot();
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

    render(
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
    await waitFor(() => {
      expect(document.body).toMatchSnapshot();
    });
  });

  it('renders acceleration flyout with materialized view', async () => {
    const accelerationIndexType: AccelerationIndexType = 'materialized';
    const dataSource = 'myds';
    const database = 'mydb';
    const dataTable = 'mytable';
    const indexName = undefined;
    const resetFlyout = jest.fn();
    const updateSQLQueries = jest.fn();

    render(
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
    await waitFor(() => {
      expect(document.body).toMatchSnapshot();
    });
  });
});
