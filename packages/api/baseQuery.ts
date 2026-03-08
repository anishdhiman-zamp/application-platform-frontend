import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { captureException } from '@sentry/browser';
import { getFromLocalStorage, isBrowser, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';
import { Mutex } from 'async-mutex';

import { ROUTES_PATH } from '@/constants/routeConfig';
import { getCookie, USER_SESSION_COOKIE } from '@/utils/cookie';

import { API_DOMAIN } from './api.utils';
import { ABORT_ERROR, CUSTOM_ERROR, LOGIN_PATH, ORG_SWITCH_IN_PROGRESS_ERROR, REQUEST_TIMEOUT } from './constants';

const mutex = new Mutex();

// Custom FetchArgs type to support timeout and domain
interface CustomFetchArgs extends FetchArgs {
  timeout?: number;
  domain?: string;
}

interface UserState {
  user?: {
    isOrgSwitchIsInProgress?: boolean;
    user?: { orgs?: Array<{ organization_id: string }> };
  };
}

const baseQuery = (timeout = REQUEST_TIMEOUT, domain = API_DOMAIN, orgId: string) =>
  fetchBaseQuery({
    baseUrl: `${domain}/`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');


      if (orgId) {
        headers.set(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID, orgId);
      }

      return headers;
    },
    timeout: timeout,
  });

const baseQueryWithAuth: BaseQueryFn<CustomFetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const state = api.getState() as UserState;
  const userSessionCookie = getCookie(USER_SESSION_COOKIE);
  const defaultOrgId = userSessionCookie ? JSON.parse(decodeURIComponent(userSessionCookie)).default_org_id : '';
  const currentOrgId =
    state?.user?.user?.orgs?.[0]?.organization_id ||
    getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID) ||
    defaultOrgId ||
    '';

  await mutex.waitForUnlock();

  if (state?.user?.isOrgSwitchIsInProgress) {
    return {
      error: {
        status: CUSTOM_ERROR,
        error: ORG_SWITCH_IN_PROGRESS_ERROR,
      } as FetchBaseQueryError,
    };
  }

  const result = await baseQuery(args.timeout, args.domain, currentOrgId)(args, api, extraOptions);

  // Check if we're in a browser environment
  const path = isBrowser() ? window.location.pathname : '';

  const normalizedPath = path.replace(/\/$/, '');

  const shouldSkip401Redirect =
    normalizedPath === ROUTES_PATH.LOGIN ||
    normalizedPath === ROUTES_PATH.MEMBERSHIP_PENDING ||
    normalizedPath === ROUTES_PATH.SETUP_WORKSPACE;

  const error = result?.error;

  if (error) {
    const status = error?.status;
    const data = (error as { data?: { error?: { code?: string } | string } }).data;

    if (status === 401 && !shouldSkip401Redirect && isBrowser()) {
      const loginUrl = LOGIN_PATH;

      window.location.href = loginUrl;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore status can be string on abort
    if (status !== 401 && error?.error !== ABORT_ERROR) {
      const errorObj = new Error(
        JSON.stringify(`${status}=${typeof data?.error === 'string' ? data.error : (data?.error?.code ?? 'NA')}`),
      );

      captureException(errorObj, {
        extra: {
          error: JSON.stringify(error),
          url: args?.url,
          rtkEndpoint: api?.endpoint,
        },
      });
    }
  }

  return result;
};

const baseApiProvider = (tagTypes?: Record<string, string>, reducerPath = 'api') =>
  createApi({
    reducerPath: reducerPath,
    tagTypes: Object.values(tagTypes ?? {}),
    baseQuery: baseQueryWithAuth,
    endpoints: () => ({}),
    refetchOnMountOrArgChange: true,
  });

export default baseApiProvider;
