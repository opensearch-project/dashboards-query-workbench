/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { coreRefs } from '../../public/framework/core_refs';
import {
  ASYNC_QUERY_ENDPOINT,
  ASYNC_QUERY_JOB_ENDPOINT,
  ASYNC_QUERY_SESSION_ID,
  POLL_INTERVAL_MS,
} from '../constants';
import { AsyncApiResponse, AsyncQueryStatus, PollingCallback } from '../types';
import { RaiseErrorToast } from './toast_helper';

export const setAsyncSessionId = (dataSource: string, value: string | null) => {
  if (value !== null) {
    sessionStorage.setItem(`${ASYNC_QUERY_SESSION_ID}_${dataSource}`, value);
  }
};

export const getAsyncSessionId = (dataSource: string) => {
  return sessionStorage.getItem(`${ASYNC_QUERY_SESSION_ID}_${dataSource}`);
};

export const executeAsyncQuery = (
  currentDataSource: string,
  query: {},
  dataSourceId: string,
  pollingCallback: PollingCallback,
  onErrorCallback?: (errorMessage: string) => void,
) => {
  let jobId: string | undefined;
  let isQueryFulfilled = false;
  let isQueryCancelled = false;
  const http = coreRefs.http!;

  const getJobId = () => {
    http
      .post(ASYNC_QUERY_ENDPOINT, {
        body: JSON.stringify({
          ...query,
          sessionId: getAsyncSessionId(currentDataSource) ?? undefined,
        }),
      })
      .then((res) => {
        const responseData = res.data.resp;
        jobId = responseData?.queryId;
        if (jobId === undefined || !res.data.ok) {
          console.error('Recieved an invalid query id:', res.data);
          RaiseErrorToast({
            errorToastMessage: 'Recieved an invalid query id: ' + res.data.resp,
            errorDetailsMessage: res.data.body,
          });

          if (onErrorCallback) {
            onErrorCallback(res.data.body);
          }
          return;
        }
        setAsyncSessionId(currentDataSource, responseData?.sessionId ?? null);
        pollQueryStatus(jobId, pollingCallback);
      })
      .catch((err) => {
        console.error('Error occurred while getting query id:', err);
        RaiseErrorToast({
          errorToastMessage: 'Error occurred while getting query id',
          errorDetailsMessage: err,
        });
        isQueryFulfilled = true;
        if (onErrorCallback) {
          onErrorCallback(err);
        }
      });
  };

  const pollQueryStatus = (id: string, callback: PollingCallback) => {
    !isQueryCancelled &&
      http
        .get(ASYNC_QUERY_JOB_ENDPOINT + id)
        .then((res: AsyncApiResponse) => {
          const status = res.data.resp.status.toLowerCase();
          const errorDetailsMessage = res.data.resp.error ?? '';
          switch (status) {
            case AsyncQueryStatus.Pending:
            case AsyncQueryStatus.Running:
            case AsyncQueryStatus.Scheduled:
            case AsyncQueryStatus.Waiting:
              callback({ ...res });
              setTimeout(() => pollQueryStatus(id, callback), POLL_INTERVAL_MS);
              break;

            case AsyncQueryStatus.Failed:
            case AsyncQueryStatus.Cancelled:
              isQueryFulfilled = true;

              if (status === AsyncQueryStatus.Failed) {
                RaiseErrorToast({
                  errorToastMessage: 'Query failed',
                  errorDetailsMessage,
                });
              }
              if (onErrorCallback) {
                onErrorCallback(errorDetailsMessage);
              }
              callback({ ...res });
              break;

            case AsyncQueryStatus.Success:
              isQueryFulfilled = true;
              callback({ ...res });
              break;

            default:
              console.error('Unrecognized status:', status);
              RaiseErrorToast({
                errorToastMessage: 'Unrecognized status recieved',
                errorDetailsMessage: 'Unrecognized status recieved - ' + errorDetailsMessage,
              });
              if (onErrorCallback) {
                onErrorCallback(errorDetailsMessage);
              }
              callback({ ...res });
          }
        })
        .catch((err) => {
          console.error('Error occurred while polling query status:', err);
          isQueryFulfilled = true;
          callback({
            data: {
              ok: true,
              resp: { status: AsyncQueryStatus.Failed, error: 'Failed to query status' },
            },
          });
        });
  };

  const cancelQuery = () => {
    if (jobId && !isQueryFulfilled) {
      isQueryCancelled = true;
      http.delete(ASYNC_QUERY_JOB_ENDPOINT + jobId).catch((err) => {
        console.error('Error occurred while cancelling query:', err);
        RaiseErrorToast({
          errorToastMessage: 'Query cancellation failed',
          errorDetailsMessage: 'Query cancellation failed for queryId: ' + err,
        });
      });
    }
  };

  // Start executing the query
  getJobId();

  // Return a function to cancel the query
  return cancelQuery;
};
