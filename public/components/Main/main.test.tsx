/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { HttpResponse } from '../../../../../src/core/public';
import { httpClientMock } from '../../../test/mocks';
import {
  mockDatasourcesQuery,
  mockHttpQuery,
  mockNotOkQueryResultResponse,
  mockOpenSearchIndicies,
  mockOpenSearchTreeQuery,
  mockQueryResultJDBCResponse,
  mockQueryTranslationResponse,
  mockResultWithNull
} from '../../../test/mocks/mockData';
import { Main } from './main';

const setBreadcrumbsMock = jest.fn();

jest.mock('../../dependencies/register_observability_dependencies', () => ({
  getRenderAccelerationDetailsFlyout: jest.fn(() => jest.fn()),
  getRenderCreateAccelerationFlyout: jest.fn(() => jest.fn()),
  setRenderAccelerationDetailsFlyout: jest.fn(() => jest.fn()),
  setRenderCreateAccelerationFlyout: jest.fn(() => jest.fn()),
}));

jest.mock('../../framework/catalog_cache_refs', () => ({
  catalogCacheRefs: {
    CatalogCacheManager: {
      addOrUpdateAccelerationsByDataSource: () => ({
        dbCache: { status: 'empty' },
      }),
      getOrCreateDataSource: () => ({
        dsCache: { status: 'empty' },
      }),
    },
    useLoadDatabasesToCache: () => ({
      loadStatus: 'Scheduled',
      startLoading: jest.fn(),
      stopLoading: jest.fn(),
    }),
    useLoadTablesToCache: () => ({
      loadStatus: 'Scheduled',
      startLoading: jest.fn(),
      stopLoading: jest.fn(),
    }),
    useLoadTableColumnsToCache: () => ({
      loadStatus: 'Scheduled',
      startLoading: jest.fn(),
      stopLoading: jest.fn(),
    }),
    useLoadAccelerationsToCache: () => ({
      loadStatus: 'Scheduled',
      startLoading: jest.fn(),
      stopLoading: jest.fn(),
    }),
  },
}));

describe('<Main /> spec', () => {
  it('renders the component', async () => {
    const client = httpClientMock;
    client.post = jest.fn().mockResolvedValue(mockHttpQuery);
    client.get = jest.fn().mockResolvedValue(mockDatasourcesQuery);
    const asyncTest = () => {
      render(<Main httpClient={client} setBreadcrumbs={setBreadcrumbsMock} />);
    };
    await asyncTest();
    expect(document.body.children[0]).toMatchSnapshot();
  });
  it('renders the component and toggles ppl', async () => {
    const client = httpClientMock;
    client.post = jest.fn().mockResolvedValue(mockHttpQuery);
    client.get = jest.fn().mockResolvedValue(mockDatasourcesQuery);
    const { getByText } = await render(
      <Main httpClient={client} setBreadcrumbs={setBreadcrumbsMock} />
    );
    const pplButton = getByText('PPL');
    const asyncTest = () => {
      fireEvent.click(pplButton);
    };
    waitFor(() => {
      asyncTest();
    });
    expect(document.body.children[0]).toMatchSnapshot();
  });
  
  
  it('renders the component and checks if side tree is loaded', async () => {
    const client = httpClientMock;
    client.post = jest.fn().mockResolvedValue(mockHttpQuery);
    client.get = jest.fn().mockResolvedValue(mockDatasourcesQuery);

    client.post = jest.fn(() => {
      return (Promise.resolve(mockOpenSearchIndicies) as unknown) as HttpResponse;
    });
    const { getByText } = await render(
      <Main httpClient={client} setBreadcrumbs={setBreadcrumbsMock} />
    );

    await waitFor(() => {
      expect(getByText('.kibana_1')).toBeInTheDocument();
    });

    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('click run button, and response is ok', async () => {
    const client = httpClientMock;
    client.get = jest.fn().mockResolvedValue(mockDatasourcesQuery);
    client.post = jest.fn().mockResolvedValue(mockQueryResultJDBCResponse);

    const { getByText, getByTestId } = await render(
      <Main httpClient={client} setBreadcrumbs={setBreadcrumbsMock} />
    );
    const onRunButton = getByText('Run');
    const pplbutton =getByTestId('PPL');
    waitFor(() => {
     expect(pplbutton).toBeInTheDocument();
    });
    const asyncTest = () => {
      fireEvent.click(onRunButton);
    };
    await asyncTest();
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('click run button, response fills null and missing values', async () => {
    const client = httpClientMock;
    client.post = jest.fn().mockResolvedValue(mockResultWithNull);
    client.get = jest.fn().mockResolvedValue(mockDatasourcesQuery);

    const { getByText ,getByTestId } = await render(
      <Main httpClient={client} setBreadcrumbs={setBreadcrumbsMock} />
    );
    const pplbutton = getByTestId('PPL');
    waitFor(() => {
     expect(pplbutton).toBeInTheDocument();
    });
    const onRunButton = getByText('Run');
    const asyncTest = () => {
      fireEvent.click(onRunButton);
    };
    await asyncTest();
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('click run button, and response causes an error', async () => {
    const client = httpClientMock;
    client.post = jest.fn().mockRejectedValue('err');
    client.get = jest.fn().mockResolvedValue(mockDatasourcesQuery);

    const { getByText } = await render(
      <Main httpClient={client} setBreadcrumbs={setBreadcrumbsMock} />
    );
    const onRunButton = getByText('Run');
    const asyncTest = () => {
      fireEvent.click(onRunButton);
    };
    await asyncTest();
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('click run button, and response is not ok', async () => {
    let postRequestFlag = 0;
    const client = httpClientMock;
    client.post = jest.fn(() => {
      if (postRequestFlag > 0)
        return Promise.resolve((mockNotOkQueryResultResponse as unknown) as HttpResponse);
      else {
        postRequestFlag = 1;
        return Promise.resolve((mockOpenSearchTreeQuery as unknown) as HttpResponse);
      }
    });
    client.get = jest.fn().mockResolvedValue(mockDatasourcesQuery);

    const { getByText, getByTestId } = await render(
      <Main httpClient={client} setBreadcrumbs={setBreadcrumbsMock} />
    );
    const pplbutton = getByTestId("PPL");
    waitFor(() => {
     expect(pplbutton).toBeInTheDocument();
    });
    const onRunButton = getByText('Run');
    const asyncTest = () => {
      fireEvent.click(onRunButton);
    };
    await asyncTest();
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('click translation button, and response is ok', async () => {
    let postRequestFlag = 0;
    const client = httpClientMock;
    client.post = jest.fn(() => {
      if (postRequestFlag > 0)
        return Promise.resolve((mockQueryTranslationResponse as unknown) as HttpResponse);
      else {
        postRequestFlag = 1;
        return Promise.resolve((mockOpenSearchTreeQuery as unknown) as HttpResponse);
      }
    });

    const { getByText,getByTestId } = await render(
      <Main httpClient={client} setBreadcrumbs={setBreadcrumbsMock} />
    );
    const pplbutton = getByTestId("PPL");
    waitFor(() => {
     expect(pplbutton).toBeInTheDocument();
    });
    const onTranslateButton = getByText('Explain');
    const asyncTest = () => {
      fireEvent.click(onTranslateButton);
    };
    await asyncTest();
    expect(document.body.children[0]).toMatchSnapshot();
  });

  it('click clear button', async () => {
    const client = httpClientMock;
    client.get = jest.fn().mockResolvedValue(mockDatasourcesQuery);
    client.post = jest.fn(() => {
      return Promise.resolve((mockOpenSearchTreeQuery as unknown) as HttpResponse);
    });

    const { getByText } = await render(
      <Main httpClient={client} setBreadcrumbs={setBreadcrumbsMock} />
    );
    const onClearButton = getByText('Clear');
    const asyncTest = () => {
      fireEvent.click(onClearButton);
    };
    await asyncTest();
    expect(document.body.children[0]).toMatchSnapshot();
  });
});