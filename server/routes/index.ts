/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ILegacyClusterClient,
  IRouter,
  Logger,
  OpenSearchServiceSetup,
} from '../../../../src/core/server';
import QueryService from '../services/QueryService';
import TranslateService from '../services/TranslateService';
import registerQueryRoute from './query';
import registerTranslateRoute from './translate';

export function defineRoutes (
  router: IRouter,
  client: ILegacyClusterClient | undefined,
  openSearchServiceSetup: OpenSearchServiceSetup,
  dataSourceEnabled: boolean,
  logger: Logger
) {
  const translateService = new TranslateService(client, dataSourceEnabled, logger);
  registerTranslateRoute(router, translateService, openSearchServiceSetup);

  const queryService = new QueryService(client, dataSourceEnabled, logger);
  registerQueryRoute(router, queryService);
}
