/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable import/no-unresolved */
const cypressPlugin = require('eslint-plugin-cypress');

const osdConfig = require('@elastic/eslint-config-kibana');
const { eui } = require('@elastic/eslint-config-kibana/extras');

const LICENSE_HEADER = `/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */`;

module.exports = [
  {
    ignores: ['node_modules', 'data', 'build', 'target', 'cypress.config.js', '**/*.d.ts'],
  },
  ...osdConfig,
  ...eui,
  {
    // Register Cypress globals + rules for the .cypress/ integration specs.
    // Replaces the former nested .cypress/.eslintrc.js (ESLint 10 no longer reads it).
    files: ['.cypress/**/*.{js,ts}'],
    plugins: {
      cypress: cypressPlugin,
    },
    languageOptions: {
      globals: {
        ...cypressPlugin.configs.globals.languageOptions.globals,
      },
    },
    rules: {
      'cypress/no-assigning-return-values': 'error',
      'cypress/no-unnecessary-waiting': 'off',
      'cypress/assertion-before-screenshot': 'warn',
      'cypress/no-force': 'warn',
      'cypress/no-async-tests': 'error',
    },
  },
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 0,
      '@osd/eslint/no-restricted-paths': [
        'error',
        {
          basePath: __dirname,
          zones: [
            {
              target: ['(public|server)/**/*'],
              from: ['../../packages/**/*', 'packages/**/*'],
            },
          ],
        },
      ],
      '@osd/eslint/require-license-header': [
        'error',
        {
          licenses: [LICENSE_HEADER],
        },
      ],
    },
  },
];
