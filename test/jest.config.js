/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  rootDir: '../',
  setupFiles: ['<rootDir>/test/polyfills.ts', '<rootDir>/test/setupTests.ts'],
  setupFilesAfterEnv: ['jest-location-mock', '<rootDir>/test/setup.jest.ts'],
  roots: ['<rootDir>'],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/test/mocks/styleMock.ts',
    '^ui/(.*)': '<rootDir>/../../src/ui/public/$1/',
    // query-string v9 is pure ESM; this shim restores the default-import shape
    // (`import qs from 'query-string'`) under Jest's CJS transform.
    '^query-string$': '<rootDir>/test/mocks/queryStringMock.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/test/babelTransform.js',
  },
  // query-string v9 (and its ESM-only deps) must be transformed by Babel rather than
  // ignored, so the query-string moduleNameMapper shim can load the real package.
  transformIgnorePatterns: [
    '[/\\\\]node_modules(?![/\\\\](query-string|decode-uri-component|filter-obj|split-on-first))[/\\\\].+\\.js$',
  ],
  coverageReporters: ['lcov', 'text', 'cobertura'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: [
    '!**/*.ts',
    '**/*.tsx',
    '!**/*.js',
    '!**/*.jsx',
    '!**/models/**',
    '!**/node_modules/**',
    '!**/index.ts',
    '!<rootDir>/index.js',
    '!<rootDir>/public/app.js',
    '!<rootDir>/public/temporary/**',
    '!<rootDir>/babel.config.js',
    '!<rootDir>/test/**',
    '!<rootDir>/server/**',
    '!<rootDir>/coverage/**',
    '!<rootDir>/scripts/**',
    '!<rootDir>/build/**',
    '!**/vendor/**',
  ],
  clearMocks: true,
  testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost:5601',
  },
  // Retain Jest 28 snapshot defaults; Jest 29 flipped escapeString and printBasicPrototype to false,
  // which would invalidate existing snapshots. See https://jestjs.io/docs/upgrading-to-jest29
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
  testTimeout: 20000,
};
