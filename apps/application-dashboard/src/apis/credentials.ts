import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import {
  CreateCredentialRequestType,
  CredentialResponseType,
  GetCredentialRequestType,
  ListCredentialsRequestType,
  PaginatedCredentialResponseType,
  UpdateCredentialRequestType,
} from '@/types/api/credentials.types';
import { formRequestUrlWithParams } from '@/utils/common';

export const Credentials = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCredentials: builder.query<PaginatedCredentialResponseType, ListCredentialsRequestType>({
      query: (params) => ({
        url: API_ENDPOINTS.CREDENTIALS_GET,
        params,
      }),
      providesTags: [APITags.GET_CREDENTIALS],
    }),
    getCredential: builder.query<CredentialResponseType, GetCredentialRequestType>({
      query: ({ credential_id, decrypt }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.CREDENTIAL_GET, { credential_id }),
        params: decrypt ? { decrypt: true } : undefined,
      }),
      providesTags: (_result, _error, { credential_id }) => [{ type: APITags.GET_CREDENTIAL, id: credential_id }],
    }),
    createCredential: builder.mutation<CredentialResponseType, CreateCredentialRequestType>({
      query: (body) => ({
        url: API_ENDPOINTS.CREDENTIALS_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
      invalidatesTags: [APITags.GET_CREDENTIALS],
    }),
    updateCredential: builder.mutation<CredentialResponseType, UpdateCredentialRequestType>({
      query: ({ credential_id, ...body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.CREDENTIAL_PUT, { credential_id }),
        method: REQUEST_TYPES.PUT,
        body,
      }),
      invalidatesTags: (_result, _error, { credential_id }) => [
        APITags.GET_CREDENTIALS,
        { type: APITags.GET_CREDENTIAL, id: credential_id },
      ],
    }),
    deleteCredential: builder.mutation<void, string>({
      query: (credential_id) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.CREDENTIAL_DELETE, { credential_id }),
        method: REQUEST_TYPES.DELETE,
      }),
      invalidatesTags: (_result, _error, credential_id) => [
        APITags.GET_CREDENTIALS,
        { type: APITags.GET_CREDENTIAL, id: credential_id },
      ],
    }),
  }),
});

export const {
  useGetCredentialsQuery,
  useGetCredentialQuery,
  useLazyGetCredentialQuery,
  useCreateCredentialMutation,
  useUpdateCredentialMutation,
  useDeleteCredentialMutation,
} = Credentials;
