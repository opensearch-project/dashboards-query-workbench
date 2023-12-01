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
  CANCEL_PREVIOUS_QUERY,
  POLL_INTERVAL_MS
} from '../constants';

export const setAsyncSessionId = (value: string | null) => {
  if (value !== null) {
    sessionStorage.setItem(ASYNC_QUERY_SESSION_ID, value);
  }
};

export const getAsyncSessionId = () => {
  return sessionStorage.getItem(ASYNC_QUERY_SESSION_ID);
};

let queriesToCancel: string[] = [];

export const getJobId = (query: {}, http: CoreStart['http'], callback) => {
  http
    .post(ASYNC_QUERY_ENDPOINT, {
      body: JSON.stringify({ ...query, sessionId: getAsyncSessionId() ?? undefined }),
    })
    .then((res) => {
      const id = res.data.resp.queryId;
      setAsyncSessionId(_.get(res.data.resp, 'sessionId', null));
      if (id === undefined) {
        console.error(JSON.parse(res.data.body));
      }
      callback(id);
      queriesToCancel.push(id);
    })
    .catch((err) => {
      console.error(err);
    });
};

export const pollQueryStatus = (id: string, http: CoreStart['http'], callback) => {
  if(id === CANCEL_PREVIOUS_QUERY){
    queriesToCancel.forEach((id) => {
      cancelAsyncQuery(id, http);
    });
    queriesToCancel = [];        
  }
  else{
    http
    .get(ASYNC_QUERY_JOB_ENDPOINT + id)
    .then((res) => {
      const status = res.data.resp.status.toLowerCase();
      const responseStatus = res.data.ok;
      if(!responseStatus){
        console.log(res.data.resp.body)
        callback({ status: 'FAILED', error: res.data.resp.body })
      }
      if (
        status === 'pending' ||
        status === 'running' ||
        status === 'scheduled' ||
        status === 'waiting'
      ) {
        callback({ status: status });
        setTimeout(() => pollQueryStatus(id, http, callback), POLL_INTERVAL_MS);
      } else if (status === 'failed') {
        const results = res.data.resp;
        callback({ status: 'FAILED', error: results.error });
      } else if (status === 'success') {
        const results = _.get(res.data.resp, 'datarows');
        queriesToCancel = queriesToCancel.filter((queryId) => queryId !== id);
        callback({ status: 'SUCCESS', results: results });
      }
    })
    .catch((err) => {
      console.error(err);
      callback({ status: 'FAILED', error: 'Failed to fetch data' });
    });
  }
};

export const cancelAsyncQuery = (id: string, http: CoreStart['http']) =>{
  http
    .delete(ASYNC_QUERY_JOB_ENDPOINT + id)
    .then((res)=>{
      console.log(res)
    })
    .catch((err) => {
      console.error(err);
    });
}
