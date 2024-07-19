/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { I18nProvider } from '@osd/i18n/react';
import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';

import { EuiPage, EuiPageBody } from '@elastic/eui';

import { CoreStart, MountPoint } from '../../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../../src/plugins/data_source_management/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { coreRefs } from '../framework/core_refs';
import { Main } from './Main';

interface WorkbenchAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  chrome: CoreStart['chrome'];
  savedObjects: CoreStart['savedObjects'];
  dataSourceEnabled: boolean;
  dataSourceManagement: DataSourceManagementPluginSetup;
  dataSourceMDSId: string;
  setActionMenu: (menuMount: MountPoint | undefined) => void;
}

export const WorkbenchApp = ({
  basename,
  notifications,
  http,
  navigation,
  chrome,
  savedObjects,
  dataSourceEnabled,
  dataSourceManagement,
  dataSourceMDSId: dataSourceId,
  setActionMenu,
}: WorkbenchAppDeps) => {
  const isNavGroupEnabled = coreRefs?.chrome?.navGroup.getNavGroupEnabled();
  const basePath = isNavGroupEnabled ? 'opensearch-query-workbench' : '';

  return (
    <HashRouter>
      <I18nProvider>
        <div>
          <EuiPage>
            <EuiPageBody>
              <Switch>
                <Route
                  exact
                  path={`/${basePath}`}
                  render={(props) => (
                    <Main
                      httpClient={http}
                      {...props}
                      setBreadcrumbs={chrome.setBreadcrumbs}
                      isAccelerationFlyoutOpen={false}
                      urlDataSource=""
                      notifications={notifications}
                      savedObjects={savedObjects}
                      dataSourceEnabled={dataSourceEnabled}
                      dataSourceManagement={dataSourceManagement}
                      dataSourceMDSId={dataSourceId}
                      setActionMenu={setActionMenu}
                    />
                  )}
                />
                <Route
                  exact
                  path={`/${basePath}/:dataSource`}
                  render={(props) => (
                    <Main
                      httpClient={http}
                      {...props}
                      setBreadcrumbs={chrome.setBreadcrumbs}
                      isAccelerationFlyoutOpen={false}
                      urlDataSource={props.match.params.dataSource}
                      notifications={notifications}
                      savedObjects={savedObjects}
                      dataSourceEnabled={dataSourceEnabled}
                      dataSourceManagement={dataSourceManagement}
                      dataSourceMDSId={dataSourceId}
                      setActionMenu={setActionMenu}
                    />
                  )}
                />
                <Route
                  exact
                  path={`/${basePath}/accelerate/:dataSource`}
                  render={(props) => (
                    <Main
                      httpClient={http}
                      {...props}
                      setBreadcrumbs={chrome.setBreadcrumbs}
                      isAccelerationFlyoutOpen={true}
                      urlDataSource={props.match.params.dataSource}
                      notifications={notifications}
                      savedObjects={savedObjects}
                      dataSourceEnabled={dataSourceEnabled}
                      dataSourceManagement={dataSourceManagement}
                      dataSourceMDSId={dataSourceId}
                      setActionMenu={setActionMenu}
                    />
                  )}
                />
              </Switch>
            </EuiPageBody>
          </EuiPage>
        </div>
      </I18nProvider>
    </HashRouter>
  );
};
