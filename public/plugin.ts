/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  DataSourcePluginSetup,
  DataSourcePluginStart,
} from '../../../src/plugins/data_source/public';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { DevToolsSetup } from '../../../src/plugins/dev_tools/public';
import { PLUGIN_NAME } from '../common/constants';
import { convertLegacyWorkbenchUrl } from '../common/utils/legacy_route_helper';
import { registerObservabilityDependencies } from './dependencies/register_observability_dependencies';
import { coreRefs } from './framework/core_refs';
import { AppPluginStartDependencies, WorkbenchPluginSetup, WorkbenchPluginStart } from './types';
export interface WorkbenchPluginSetupDependencies {
  dataSource: DataSourcePluginSetup;
  dataSourceManagement: DataSourceManagementPluginSetup;
  devTools: DevToolsSetup;
}

export interface WorkbenchPluginStartDependencies {
  dataSource: DataSourcePluginStart;
}
export class WorkbenchPlugin implements Plugin<WorkbenchPluginSetup, WorkbenchPluginStart> {
  public setup(
    core: CoreSetup,
    { dataSource, dataSourceManagement, devTools }: WorkbenchPluginSetupDependencies
  ): WorkbenchPluginSetup {
    devTools.register({
      id: 'opensearch-query-workbench',
      title: PLUGIN_NAME,
      enableRouting: true,
      order: 2,
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(
          coreStart,
          depsStart as AppPluginStartDependencies,
          params,
          dataSourceManagement
        );
      },
    });

    // redirect legacy workbench URL to current URL under dev-tools
    if (window.location.pathname.includes('app/opensearch-query-workbench')) {
      window.location.assign(convertLegacyWorkbenchUrl(window.location));
    }

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
