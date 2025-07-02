import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { captureException } from '@sentry/browser';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';
import { Mutex } from 'async-mutex';

import { API_DOMAIN } from './api.utils';
import { ABORT_ERROR, LOGIN_PATH } from './constants';

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_DOMAIN}/`,
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    headers.set(
      LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID,
      getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID) || '',
    );

    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  await mutex.waitForUnlock();

  const result = await baseQuery(args, api, extraOptions);
  const path = window.location.pathname;

  const isLoginRoute = path === LOGIN_PATH;

  const error = result?.error;

  if (error) {
    const status = error?.status;
    const data = (error as { data?: { error?: { code?: string } } }).data;

    if (status === 401 && !isLoginRoute) {
      let loginUrl = LOGIN_PATH;

      if (window.location.pathname && window.location.pathname !== '/') {
        loginUrl += '?redirect_to=' + window.location.pathname;
      }

      window.location.href = loginUrl;
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
