/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataSourcePluginStart } from '../../../src/plugins/data_source/public/types';
import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { CacheStart } from './types';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WorkbenchPluginSetup {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WorkbenchPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  dataSource: DataSourcePluginStart;
  observabilityDashboards?: CacheStart;
}

export type { CacheStart } from '../../../src/plugins/data_source_management/public/types';

export type { RenderAccelerationFlyoutParams } from '../../../src/plugins/data_source_management/framework/types';
