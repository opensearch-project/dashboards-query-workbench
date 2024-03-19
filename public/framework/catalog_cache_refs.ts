/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CatalogCacheManagerType,
  LoadCachehookOutputType,
} from '../../../dashboards-observability/public/types';

class CatalogCacheRefs {
  private static _instance: CatalogCacheRefs;

  public CatalogCacheManager?: CatalogCacheManagerType;
  public useLoadDatabasesToCache?: () => LoadCachehookOutputType;
  public useLoadTablesToCache?: () => LoadCachehookOutputType;
  public useLoadTableColumnsToCache?: () => LoadCachehookOutputType;
  public useLoadAccelerationsToCache?: () => LoadCachehookOutputType;

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
}

export const catalogCacheRefs = CatalogCacheRefs.Instance;
