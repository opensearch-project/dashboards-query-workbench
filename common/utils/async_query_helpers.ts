/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import { CoreStart } from '../../../../src/core/public';
import {
  ASYNC_QUERY_ENDPOINT,
  ASYNC_QUERY_JOB_ENDPOINT,
  ASYNC_QUERY_SESSION_ID,
  POLL_INTERVAL_MS,
} from '../constants';

export const setAsyncSessionId = (dataSource: string, value: string | null) => {
  if (value !== null) {
    sessionStorage.setItem(`${ASYNC_QUERY_SESSION_ID}_${dataSource}`, value);
  }
};

export const getAsyncSessionId = (dataSource: string) => {
  return sessionStorage.getItem(`${ASYNC_QUERY_SESSION_ID}_${dataSource}`);
};

export const getJobId = (
  currentDataSource: string,
  query: {},
  http: CoreStart['http'],
  callback
) => {
  http
    .post(ASYNC_QUERY_ENDPOINT, {
      body: JSON.stringify({
        ...query,
        sessionId: getAsyncSessionId(currentDataSource) ?? undefined,
      }),
    })
    .then((res) => {
      const id = res.data.resp.queryId;
      setAsyncSessionId(currentDataSource, _.get(res.data.resp, 'sessionId', null));
      if (id === undefined) {
        console.error(JSON.parse(res.data.body));
      }
      callback(id);
    })
    .catch((err) => {
      console.error(err);
    });
};

export const pollQueryStatus = (id: string, http: CoreStart['http'], callback) => {
  http
    .get(ASYNC_QUERY_JOB_ENDPOINT + id)
    .then((res) => {
      const status = res.data.resp.status.toLowerCase();
      if (
        status === 'pending' ||
        status === 'running' ||
        status === 'scheduled' ||
        status === 'waiting'
      ) {
        callback({ status });
        setTimeout(() => pollQueryStatus(id, http, callback), POLL_INTERVAL_MS);
      } else if (status === 'failed') {
        const results = res.data.resp;
        callback({ status: 'FAILED', error: results.error });
      } else if (status === 'success') {
        const results = _.get(res.data.resp, 'datarows');
        callback({ status: 'SUCCESS', results: results });
      }
    })
    .catch((err) => {
      console.error(err);
      callback({ status: 'FAILED', error: 'Failed to fetch data' });
    });
};
