/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render } from "@testing-library/react";
import React from "react";
import { PPLPage } from "./PPLPage";


describe("<PPLPage /> spec", () => {

  it("renders the component", () => {
    render(
      <PPLPage
        onRun={() => { }}
        onTranslate={() => { }}
        onClear={() => { }}
        updatePPLQueries={() => { }}
        pplTranslations={[]}
        pplQuery={''}
      />
    );
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('tests the action buttons', async () => {
    const onRun = jest.fn();
    const onTranslate = jest.fn();
    const onClean = jest.fn();
    const updateSQLQueries = jest.fn();
    const onExplain = jest.fn()

    const { getByText } = render(
      <PPLPage
        onRun={onRun}
        onTranslate={onTranslate}
        onClear={onClean}
        updatePPLQueries={updateSQLQueries}
        pplTranslations={[]}
        pplQuery={''}
      />
    );

    expect(document.body.children[0]).toMatchSnapshot();

    fireEvent.click(getByText('Run'));
    expect(onRun).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText('Clear'));
    expect(onClean).toHaveBeenCalledTimes(1);

  });

  it('tests the action buttons', async () => {
    const onRun = jest.fn();
    const onTranslate = jest.fn();
    const onClean = jest.fn();
    const updateSQLQueries = jest.fn();
    const onExplain = jest.fn()

    const { getByText } = render(
      <PPLPage
        onRun={onRun}
        onTranslate={onTranslate}
        onClear={onClean}
        updatePPLQueries={updateSQLQueries}
        pplTranslations={[]}
        selectedDatasource={[{ label: 'OpenSearch' }]}
      />
    );
    expect(getByText('Explain')).toBeInTheDocument();
    fireEvent.click(getByText('Explain'));
    expect(document.body.children[0]).toMatchSnapshot();

  });

});



