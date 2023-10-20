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

export const setAsyncSessionId = (value: string | null) => {
  if (value === null) sessionStorage.removeItem(ASYNC_QUERY_SESSION_ID);
  else sessionStorage.setItem(ASYNC_QUERY_SESSION_ID, value);
};

export const getAsyncSessionId = () => {
  return sessionStorage.getItem(ASYNC_QUERY_SESSION_ID);
};

export const getJobId = (query: {}, http: CoreStart['http'], callback) => {
  http
    .post(ASYNC_QUERY_ENDPOINT, {
      body: JSON.stringify({ ...query, sessionId: getAsyncSessionId() ?? undefined }),
    })
    .then((res) => {
      const id = res.data.resp.queryId;
      setAsyncSessionId(_.get(res.data.resp, 'sessionId', null));
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
        setTimeout(() => pollQueryStatus(id, http, callback), POLL_INTERVAL_MS);
      } else if (status === 'failed') {
        callback([]);
      } else if (status === 'success') {
        const results = _.get(res.data.resp, 'datarows');
        callback(results);
      }
    })
    .catch((err) => {
      console.error(err);
      callback([]);
    });
};
