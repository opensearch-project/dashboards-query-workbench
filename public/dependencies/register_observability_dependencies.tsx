/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createGetterSetter } from '../../../../src/plugins/opensearch_dashboards_utils/public';
import { catalogCacheRefs } from '../framework/catalog_cache_refs';
import { ObservabilityStart } from '../types';

export const [
  getRenderAccelerationDetailsFlyout,
  setRenderAccelerationDetailsFlyout,
] = createGetterSetter('renderAccelerationDetailsFlyout');

export const [
  getRenderAssociatedObjectsDetailsFlyout,
  setRenderAssociatedObjectsDetailsFlyout,
] = createGetterSetter('renderAssociatedObjectsDetailsFlyout');

export const [
  getRenderCreateAccelerationFlyout,
  setRenderCreateAccelerationFlyout,
] = createGetterSetter<(dataSource: string, dataSourceMDSId?: string) => void>('renderCreateAccelerationFlyout');

export const registerObservabilityDependencies = (start?: ObservabilityStart) => {
  if (!start) return;

  setRenderAccelerationDetailsFlyout(start.renderAccelerationDetailsFlyout);
  setRenderAssociatedObjectsDetailsFlyout(start.renderAssociatedObjectsDetailsFlyout);
  setRenderCreateAccelerationFlyout(start.renderCreateAccelerationFlyout);
  catalogCacheRefs.CatalogCacheManager = start.CatalogCacheManagerInstance;
  catalogCacheRefs.useLoadDatabasesToCache = start.useLoadDatabasesToCacheHook;
  catalogCacheRefs.useLoadTablesToCache = start.useLoadTablesToCacheHook;
  catalogCacheRefs.useLoadTableColumnsToCache = start.useLoadTableColumnsToCacheHook;
  catalogCacheRefs.useLoadAccelerationsToCache = start.useLoadAccelerationsToCacheHook;
};
