/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ApplicationStart,
  ChromeStart,
  HttpStart,
  IToasts,
  OverlayStart,
  SavedObjectsClientContract,
} from '../../../../src/core/public';

class CoreRefs {
  private static _instance: CoreRefs;

  public http?: HttpStart;
  public savedObjectsClient?: SavedObjectsClientContract;
  public toasts?: IToasts;
  public chrome?: ChromeStart;
  public application?: ApplicationStart;
  public overlays?: OverlayStart;
  private constructor() {
    // ...
  }

  public static get Instance() {
    // Do you need arguments? Make it a regular static method instead.
    return this._instance || (this._instance = new this());
  }
}

export const coreRefs = CoreRefs.Instance;
