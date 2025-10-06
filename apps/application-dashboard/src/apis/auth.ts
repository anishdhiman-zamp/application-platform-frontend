import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { ErrorDetails, LoginFlow, loginPayloadType, LogoutFlow, Session } from 'types/api/auth.types';
import { baseApi } from '@/services/baseApi';

const Teams = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    initiateLoginFlow: builder.query<LoginFlow, void>({
      query: () => ({ url: API_ENDPOINTS.AUTH_INITIATE_LOGIN_FLOW_GET }),
    }),
    login: builder.mutation<string, loginPayloadType>({
      query: ({ url, body }) => ({ url, method: REQUEST_TYPES.POST, body: body, headers: {}, credentials: 'include' }),
    }),
    initiateLogoutFlow: builder.query<LogoutFlow, void>({
      query: () => ({ url: API_ENDPOINTS.AUTH_INITIATE_LOGOUT_FLOW_GET }),
    }),
    logout: builder.query<string, string>({
      query: (url) => ({ url }),
    }),
    getErrorDetails: builder.query<ErrorDetails[], string>({
      query: (errorId) => ({ url: API_ENDPOINTS.AUTH_ERROR_DETAILS_GET, params: { id: errorId } }),
    }),
    whoAmI: builder.query<Session, void>({
      query: () => ({ url: API_ENDPOINTS.USER_WHOAMI_GET }),
    }),
    getBaseUrl: builder.query<{ api_base_urls: { region: string; url: string }[] }, { email: string }>({
      query: (body) => ({
        method: REQUEST_TYPES.POST,
        body,
        url: API_ENDPOINTS.AUTH_BASE_URL_GET,
      }),
    }),
  }),
});

export const {
  useInitiateLoginFlowQuery,
  useLazyLogoutQuery,
  useLoginMutation,
  useInitiateLogoutFlowQuery,
  useGetErrorDetailsQuery,
  useWhoAmIQuery,
  useLazyWhoAmIQuery,
  useGetBaseUrlQuery,
} = Teams;
