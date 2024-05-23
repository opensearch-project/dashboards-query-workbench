/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreSetup, Logger, Plugin, PluginInitializerContext } from '../../../src/core/server';

import { DataSourcePluginSetup } from '../../../src/plugins/data_source/server/types';
import { DataSourceManagementPlugin } from '../../../src/plugins/data_source_management/public/plugin';
import sqlPlugin from './clusters/sql/sqlPlugin';
import { defineRoutes } from './routes';
import { WorkbenchPluginSetup, WorkbenchPluginStart } from './types';

export interface WorkbenchPluginSetupDependencies {
  dataSourceManagement: ReturnType<DataSourceManagementPlugin['setup']>;
  dataSource: DataSourcePluginSetup;
}

export class WorkbenchPlugin implements Plugin<WorkbenchPluginSetup, WorkbenchPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup, { dataSource }: WorkbenchPluginSetupDependencies) {
    this.logger.debug('queryWorkbenchDashboards: Setup');
    const router = core.http.createRouter();

    const dataSourceEnabled = !!dataSource;

    const client = core.opensearch.legacy.createClient('query_workbench', {
      plugins: [sqlPlugin],
    });
    if (dataSourceEnabled) {
      dataSource.registerCustomApiSchema(sqlPlugin);
    }

    // Register server side APIs
    defineRoutes(router, client, core.opensearch, dataSourceEnabled, this.logger);

    return {};
  }

  public start() {
    this.logger.debug('queryWorkbenchDashboards: Started');
    return {};
  }

  public stop() {}
}
