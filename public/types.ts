/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataSourcePluginStart } from '../../../src/plugins/data_source/public/types';
import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { ObservabilityStart } from './types';

export interface WorkbenchPluginSetup {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WorkbenchPluginStart {
}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  dataSource: DataSourcePluginStart;
  observabilityDashboards?: ObservabilityStart;
}

export type { ObservabilityStart } from '../../dashboards-observability/public';
