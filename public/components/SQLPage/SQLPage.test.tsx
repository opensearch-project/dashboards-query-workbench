/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { SQLPage } from './SQLPage';

describe('<SQLPage /> spec', () => {
  it('renders the component', () => {
    render(
      <SQLPage
        onRun={() => {}}
        onTranslate={() => {}}
        onClear={() => {}}
        updateSQLQueries={() => {}}
        sqlTranslations={[]}
        sqlQuery={''}
        selectedDatasource={[{ label: 'OpenSearch' }]}
      />
    );
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('tests the action buttons', async () => {
    const onRun = jest.fn();
    const onTranslate = jest.fn();
    const onClean = jest.fn();
    const updateSQLQueries = jest.fn();

    const { getByText } = render(
      <SQLPage
        onRun={onRun}
        onTranslate={onTranslate}
        onClear={onClean}
        updateSQLQueries={updateSQLQueries}
        sqlTranslations={[]}
        sqlQuery={''}
        selectedDatasource={[{ label: 'OpenSearch' }]}
      />
    );

    expect(document.body.children[0]).toMatchSnapshot();

    fireEvent.click(getByText('Run'));
    expect(onRun).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText('Clear'));
    expect(onClean).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText('Explain'));
    expect(onTranslate).toHaveBeenCalledTimes(1);
  });
});
