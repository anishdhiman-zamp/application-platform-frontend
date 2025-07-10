import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { captureException } from '@sentry/browser';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';
import { Mutex } from 'async-mutex';

import { SESSION_STORAGE_KEYS, setToSessionStorage } from '@/utils/sessionstorage';

import { API_DOMAIN } from './api.utils';
import { ABORT_ERROR, LOGIN_PATH, REQUEST_TIMEOUT } from './constants';

const mutex = new Mutex();

// Custom FetchArgs type to support timeout and domain
interface CustomFetchArgs extends FetchArgs {
  timeout?: number;
  domain?: string;
}

const baseQuery = (timeout = REQUEST_TIMEOUT, domain = API_DOMAIN) =>
  fetchBaseQuery({
    baseUrl: `${domain}/`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      headers.set(
        LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID,
        getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID) || '',
      );

      return headers;
    },
    timeout: timeout,
  });

const baseQueryWithAuth: BaseQueryFn<CustomFetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  await mutex.waitForUnlock();

  const result = await baseQuery(args.timeout, args.domain)(args, api, extraOptions);
  const path = window.location.pathname;

  const isLoginRoute = path === LOGIN_PATH;

  const error = result?.error;

  if (error) {
    const status = error?.status;
    const data = (error as { data?: { error?: { code?: string } } }).data;

    if (status === 401 && !isLoginRoute) {
      let loginUrl = LOGIN_PATH;
      let query = '';

      if (window.location.pathname && window.location.pathname !== '/') {
        const queryParams = new URLSearchParams(window.location.search);
        loginUrl += '?redirect_to=' + window.location.pathname;
        queryParams.forEach((value, key) => {
          query += `&${key}=${value}`;
        });
        setToSessionStorage(SESSION_STORAGE_KEYS.PATHNAME_PRE_LOGOUT, path + query.replace('&', '?'));
      }

      window.location.href = `${loginUrl}${query}`;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore status can be string on abort
    if (status !== 401 && error?.error !== ABORT_ERROR) {
      const errorObj = new Error(JSON.stringify(`${status}=${data?.error?.code ?? 'NA'}`));

      captureException(errorObj, {
        extra: {
          error: JSON.stringify(error),
          args: JSON.stringify(args),
          rtkEndpoint: api?.endpoint,
        },
      });
    }
  }

  return result;
};

const baseApiProvider = (tagTypes: Record<string, string>) =>
  createApi({
    reducerPath: 'api',
    tagTypes: Object.values(tagTypes),
    baseQuery: baseQueryWithAuth,
    endpoints: () => ({}),
    refetchOnMountOrArgChange: true,
  });

export default baseApiProvider;
