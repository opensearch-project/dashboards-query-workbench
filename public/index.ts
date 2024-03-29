/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkbenchPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.
export function plugin() {
  return new WorkbenchPlugin();
}
export { WorkbenchPluginSetup, WorkbenchPluginStart } from './types';
