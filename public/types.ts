/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataSourcePluginStart } from '../../../src/plugins/data_source/public/types';
import { CatalogCacheManager } from '../../../src/plugins/data_source_management/framework/catalog_cache/cache_manager';
import {
  LoadCachehookOutput,
  RenderAccelerationDetailsFlyoutParams,
  RenderAccelerationFlyoutParams,
  RenderAssociatedObjectsDetailsFlyoutParams,
} from '../../../src/plugins/data_source_management/framework/types';
import { IAuthenticationMethodRegistry } from '../../../src/plugins/data_source_management/public/auth_registry';
import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WorkbenchPluginSetup {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WorkbenchPluginStart {}

export interface DataSourceManagementPluginStart {
  getAuthenticationMethodRegistry: () => IAuthenticationMethodRegistry;
  renderAccelerationDetailsFlyout: ({
    acceleration,
    dataSourceName,
    handleRefresh,
    dataSourceMDSId,
  }: RenderAccelerationDetailsFlyoutParams) => void;
  renderAssociatedObjectsDetailsFlyout: ({
    tableDetail,
    dataSourceName,
    handleRefresh,
  }: RenderAssociatedObjectsDetailsFlyoutParams) => void;
  renderCreateAccelerationFlyout: ({
    dataSourceName,
    dataSourceMDSId,
    databaseName,
    tableName,
    handleRefresh,
  }: RenderAccelerationFlyoutParams) => void;
  CatalogCacheManagerInstance: typeof CatalogCacheManager;
  useLoadDatabasesToCacheHook: () => LoadCachehookOutput;
  useLoadTablesToCacheHook: () => LoadCachehookOutput;
  useLoadTableColumnsToCacheHook: () => LoadCachehookOutput;
  useLoadAccelerationsToCacheHook: () => LoadCachehookOutput;
}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  dataSource: DataSourcePluginStart;
  dataSourceManagement?: DataSourceManagementPluginStart;
}

export type { RenderAccelerationFlyoutParams } from '../../../src/plugins/data_source_management/framework/types';
