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
import { ClusterInfoService } from '../services/ClusterInfoService';
import { QueryService } from '../services/QueryService';
import { TranslateService } from '../services/TranslateService';
import { registerQueryRoute } from './query';
import { translate as registerTranslateRoute } from './translate';

export function defineRoutes(
  router: IRouter,
  client: ILegacyClusterClient | undefined,
  openSearchServiceSetup: OpenSearchServiceSetup,
  dataSourceEnabled: boolean,
  logger: Logger,
  clusterInfoService: ClusterInfoService
) {
  const translateService = new TranslateService(
    client,
    dataSourceEnabled,
    logger,
    clusterInfoService
  );
  registerTranslateRoute(router, translateService, openSearchServiceSetup);

  const queryService = new QueryService(client, dataSourceEnabled, logger, clusterInfoService);
  registerQueryRoute(router, queryService, clusterInfoService);
}
