/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * query-string v9 is a pure ESM module whose index.js has only a default export.
 * Under Jest's CJS transform the default-import shape (`import qs from 'query-string'`)
 * breaks. This shim (set as the moduleNameMapper target for 'query-string') loads the
 * real package from the parent repo's node_modules via an absolute file path so Jest's
 * moduleNameMapper does not intercept the require and recurse into this file.
 *
 * Mirrors src/dev/jest/mocks/query_string_mock.js in the parent repo.
 */

// eslint-disable-next-line import/no-dynamic-require
const mod = require(require('path').resolve(
  __dirname,
  '../../../../node_modules/query-string/index.js'
));

const api = mod && mod.__esModule && typeof mod.stringify !== 'function' ? mod.default : mod;

module.exports = {
  __esModule: true,
  default: api,
};
