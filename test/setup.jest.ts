/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { coreRefs } from '../public/framework/core_refs';
import { coreStartMock } from '../test/mocks/coreMocks';
configure({ testIdAttribute: 'data-test-subj' });

jest.mock('@elastic/eui/lib/components/form/form_row/make_id', () => () => 'some_make_id');

jest.mock('@elastic/eui/lib/services/accessibility/html_id_generator', () => ({
  htmlIdGenerator: () => {
    return () => 'some_html_id';
  },
}));

// @ts-ignore
window.Worker = function () {
  this.postMessage = () => {};
  // @ts-ignore
  this.terminate = () => {};
};

// @ts-ignore
window.URL = {
  createObjectURL: () => {
    return '';
  },
};

jest.mock('@elastic/eui/lib/components/icon', () => ({
  EuiIcon: () => 'EuiIconMock',
  __esModule: true,
  IconPropType: jest.requireActual('@elastic/eui/lib/components/icon/icon').IconPropType,
  ICON_TYPES: jest.requireActual('@elastic/eui/lib/components/icon/icon').TYPES,
  ICON_SIZES: jest.requireActual('@elastic/eui/lib/components/icon/icon').SIZES,
  ICON_COLORS: jest.requireActual('@elastic/eui/lib/components/icon/icon').COLORS,
}));

coreRefs.http = coreStartMock.http;
coreRefs.savedObjectsClient = coreStartMock.savedObjects.client;
coreRefs.toasts = coreStartMock.notifications.toasts;

// jest-location-mock uses process.env.HOST as the base URL for its window.location mock.
// Set it to match testEnvironmentOptions.url so window.location.origin is 'http://localhost:5601'.
process.env.HOST = 'http://localhost:5601';

// Mock window.matchMedia (used by Monaco editor). Make it configurable so tests can override it.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// jsdom 26 marks window.localStorage and window.sessionStorage as non-configurable.
// Re-declare them as configurable once here so individual tests can override them
// with Object.defineProperty without hitting "Cannot redefine property" errors.
['localStorage', 'sessionStorage'].forEach((key) => {
  const descriptor = Object.getOwnPropertyDescriptor(window, key);
  if (descriptor && !descriptor.configurable) {
    Object.defineProperty(window, key, {
      configurable: true,
      writable: true,
      value: descriptor.value,
    });
  }
});
