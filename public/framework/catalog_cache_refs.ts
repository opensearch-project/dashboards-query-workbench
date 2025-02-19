/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStart, NotificationsStart } from '../../../../src/core/public';
import {
  CatalogCacheManagerType,
  LoadCachehookOutputType,
} from '../../../../src/plugins/data_source_management/public/types';

class CatalogCacheRefs {
  private static _instance: CatalogCacheRefs;

  public CatalogCacheManager?: CatalogCacheManagerType;
  public useLoadDatabasesToCache?: (
    http: HttpStart,
    notifications: NotificationsStart
  ) => LoadCachehookOutputType;
  public useLoadTablesToCache?: (
    http: HttpStart,
    notifications: NotificationsStart
  ) => LoadCachehookOutputType;
  public useLoadTableColumnsToCache?: (
    http: HttpStart,
    notifications: NotificationsStart
  ) => LoadCachehookOutputType;
  public useLoadAccelerationsToCache?: (
    http: HttpStart,
    notifications: NotificationsStart
  ) => LoadCachehookOutputType;

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
}

export const catalogCacheRefs = CatalogCacheRefs.Instance;
