/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import { CoreStart } from '../../../../../src/core/public';
import { SIDEBAR_POLL_INTERVAL_MS } from '../../../common/constants';

let previousJobTimer: NodeJS.Timeout | null = null;

export const pollQueryStatus = (id: string, http: CoreStart['http'], callback) => {
  if (previousJobTimer) {
    clearTimeout(previousJobTimer);
  }
  http
    .get(`/api/spark_sql_console/job/` + id)
    .then((res) => {
      const status = res.data.resp.status;
      if (status === 'PENDING' || status === 'RUNNING' || status === 'SCHEDULED') {
        previousJobTimer = setTimeout(
          () => pollQueryStatus(id, http, callback),
          SIDEBAR_POLL_INTERVAL_MS
        );
      } else if (status === 'FAILED') {
        callback([]);
      } else if (status === 'SUCCESS') {
        const results = _.get(res.data.resp, 'datarows');
        callback(results);
      }
    })
    .catch((err) => {
      console.error(err);
      callback([]);
    });
};

export const getJobId = (query: {}, http: CoreStart['http'], callback) => {
  let id;
  http
    .post(`/api/spark_sql_console`, {
      body: JSON.stringify(query),
    })
    .then((res) => {
      id = res.data.resp.queryId;
      callback(id);
    })
    .catch((err) => {
      console.error(err);
    });
};
