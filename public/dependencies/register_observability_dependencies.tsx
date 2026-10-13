/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createGetterSetter } from '../../../../src/plugins/opensearch_dashboards_utils/public';
import { RenderAccelerationDetailsFlyoutParams } from '../../../dashboards-observability/common/types/data_connections';
import { catalogCacheRefs } from '../framework/catalog_cache_refs';
import { ObservabilityStart, RenderAccelerationFlyoutParams } from '../types';

export const [
  getRenderAccelerationDetailsFlyout,
  setRenderAccelerationDetailsFlyout,
] = createGetterSetter<
  ({
    acceleration,
    dataSourceName,
    handleRefresh,
    dataSourceMDSId,
  }: RenderAccelerationDetailsFlyoutParams) => void
>('renderAccelerationDetailsFlyout');

export const [
  getRenderAssociatedObjectsDetailsFlyout,
  setRenderAssociatedObjectsDetailsFlyout,
] = createGetterSetter('renderAssociatedObjectsDetailsFlyout');

export const [
  getRenderCreateAccelerationFlyout,
  setRenderCreateAccelerationFlyout,
] = createGetterSetter<({ dataSource, dataSourceMDSId }: RenderAccelerationFlyoutParams) => void>(
  'renderCreateAccelerationFlyout'
);

const noop = () => {};

// Fields we expect the observability plugin to provide. Missing ones are
// legitimate on AOS < 2.13 (obs 2.13 is where these APIs landed), but we log
// once so operators can tell "feature disabled because obs is old" apart from
// "feature broken for another reason."
const REQUIRED_OBS_FIELDS: Array<keyof ObservabilityStart> = [
  'renderAccelerationDetailsFlyout',
  'renderAssociatedObjectsDetailsFlyout',
  'renderCreateAccelerationFlyout',
  'CatalogCacheManagerInstance',
  'useLoadDatabasesToCacheHook',
  'useLoadTablesToCacheHook',
  'useLoadTableColumnsToCacheHook',
  'useLoadAccelerationsToCacheHook',
];

export const registerObservabilityDependencies = (start?: ObservabilityStart) => {
  if (!start) {
    console.warn(
      'queryWorkbench: dashboards-observability plugin is not available; catalog tree and acceleration flyouts will be disabled.'
    );
  } else {
    const missing = REQUIRED_OBS_FIELDS.filter((k) => start[k] === undefined);
    if (missing.length > 0) {
      console.warn(
        `queryWorkbench: dashboards-observability plugin is present but missing fields [${missing.join(
          ', '
        )}]. Expected on AOS < 2.13; catalog tree and/or acceleration flyouts will be hidden.`
      );
    }
  }

  setRenderAccelerationDetailsFlyout(start?.renderAccelerationDetailsFlyout ?? noop);
  setRenderAssociatedObjectsDetailsFlyout(start?.renderAssociatedObjectsDetailsFlyout ?? noop);
  setRenderCreateAccelerationFlyout(start?.renderCreateAccelerationFlyout ?? noop);
  catalogCacheRefs.CatalogCacheManager = start?.CatalogCacheManagerInstance;
  catalogCacheRefs.useLoadDatabasesToCache = start?.useLoadDatabasesToCacheHook;
  catalogCacheRefs.useLoadTablesToCache = start?.useLoadTablesToCacheHook;
  catalogCacheRefs.useLoadTableColumnsToCache = start?.useLoadTableColumnsToCacheHook;
  catalogCacheRefs.useLoadAccelerationsToCache = start?.useLoadAccelerationsToCacheHook;
};
