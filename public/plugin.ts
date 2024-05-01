/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import { DataSourcePluginSetup, DataSourcePluginStart } from '../../../src/plugins/data_source/public';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { PLUGIN_NAME } from '../common/constants';
import { registerObservabilityDependencies } from './dependencies/register_observability_dependencies';
import { coreRefs } from './framework/core_refs';
import { AppPluginStartDependencies, WorkbenchPluginSetup, WorkbenchPluginStart } from './types';
export interface WorkbenchPluginSetupDependencies {
  dataSource: DataSourcePluginSetup;
  dataSourceManagement: DataSourceManagementPluginSetup
}

export interface WorkbenchPluginStartDependencies {
  dataSource: DataSourcePluginStart;
}
export class WorkbenchPlugin implements Plugin<WorkbenchPluginSetup, WorkbenchPluginStart> {
  public setup(core: CoreSetup, {dataSource, dataSourceManagement} : WorkbenchPluginSetupDependencies): WorkbenchPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: 'opensearch-query-workbench',
      title: PLUGIN_NAME,
      category: {
        id: 'opensearch',
        label: 'OpenSearch Plugins',
        order: 2000,
      },
      order: 1000,
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params, dataSourceManagement);
      },
    });

    // Return methods that should be available to other plugins
    return {};
  }

  public start(core: CoreStart, startDeps: AppPluginStartDependencies): WorkbenchPluginStart {
    coreRefs.http = core.http;
    coreRefs.savedObjectsClient = core.savedObjects.client;
    coreRefs.toasts = core.notifications.toasts;
    coreRefs.chrome = core.chrome;
    coreRefs.application = core.application;
    coreRefs.overlays = core.overlays;
    coreRefs.dataSource = startDeps.dataSource;

    registerObservabilityDependencies(startDeps.observabilityDashboards);
    return {};
  }

  public stop() {}
}
