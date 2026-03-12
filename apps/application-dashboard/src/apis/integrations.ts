import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import {
  AuthenticateIntegrationRequestType,
  AuthenticateIntegrationRequestTypeV2,
  AuthenticateIntegrationResponseType,
  AuthenticateIntegrationResponseTypeV2,
  CreateProcessConnectionMappingRequestType,
  CreateProcessConnectionMappingResponseType,
  GetConnectionsByIntegrationNameResponseType,
  GetProcessConnectionMappingsResponseType,
  IntegrationCatalogRequestType,
  IntegrationCatalogResponseType,
} from '@/types/api/integrations';
import { formRequestUrlWithParams } from '@/utils/common';

export const Integrations = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConnectionsByIntegrationName: builder.query<
      GetConnectionsByIntegrationNameResponseType,
      { integration_name: string; params?: { page: number; limit: number } }
    >({
      query: ({ integration_name, params }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.GET_CONNECTION_BY_INTEGRATION_NAME, { integration_name }),
        params,
      }),
      providesTags: [APITags.GET_CONNECTION_BY_INTEGRATION_NAME],
    }),
    authenticateIntegration: builder.mutation<AuthenticateIntegrationResponseType, AuthenticateIntegrationRequestType>({
      query: (body) => ({
        url: API_ENDPOINTS.INTEGRATIONS_AUTHENTICATE,
        method: REQUEST_TYPES.POST,
        body,
      }),
      invalidatesTags: [APITags.GET_CONNECTION_BY_INTEGRATION_NAME],
    }),
    createProcessConnectionMapping: builder.mutation<
      CreateProcessConnectionMappingResponseType,
      CreateProcessConnectionMappingRequestType
    >({
      query: ({ process_id, connection_id }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.PROCESS_CONNECTION_MAPPINGS_POST, { process_id }),
        method: REQUEST_TYPES.POST,
        body: { connection_id },
      }),
      invalidatesTags: [APITags.GET_PROCESS_CONNECTION_MAPPINGS],
    }),
    getProcessConnectionMappings: builder.query<GetProcessConnectionMappingsResponseType, string>({
      query: (process_id) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.PROCESS_CONNECTION_MAPPINGS_GET, { process_id }),
      }),
      providesTags: [APITags.GET_PROCESS_CONNECTION_MAPPINGS],
    }),
    deleteProcessConnectionMapping: builder.mutation<void, { process_id: string; connection_id: string }>({
      query: ({ process_id, connection_id }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DELETE_PROCESS_CONNECTION_MAPPING, { process_id }),
        method: REQUEST_TYPES.DELETE,
        body: { connection_id },
      }),
      async onQueryStarted({ process_id, connection_id }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update: remove the connection mapping from the query
        const patchResults: Array<{ undo: () => void }> = [];

        // Get the API state to find all matching queries
        const state = getState() as unknown as { api: { queries: Record<string, any> } };
        const queries = state.api?.queries || {};

        // Find all queries for getProcessConnectionMappings and update them optimistically
        Object.keys(queries).forEach((queryKey) => {
          // RTK Query stores queries with keys like: 'getProcessConnectionMappings("process-id")'
          if (queryKey.startsWith('getProcessConnectionMappings')) {
            const queryEntry = queries[queryKey];

            if (queryEntry?.data && queryEntry.originalArgs === process_id) {
              try {
                const patchResult = dispatch(
                  Integrations.util.updateQueryData('getProcessConnectionMappings', process_id, (draft) => {
                    if (draft.mappings && Array.isArray(draft.mappings)) {
                      const index = draft.mappings.findIndex(
                        (mapping: { connection?: { id: string } }) => mapping.connection?.id === connection_id,
                      );

                      if (index !== -1) {
                        draft.mappings.splice(index, 1);
                      }
                    }
                  }),
                );

                patchResults.push(patchResult);
              } catch {
                // If updateQueryData fails, skip this query - invalidation will handle it
              }
            }
          }
        });

        try {
          await queryFulfilled;
        } catch {
          // Rollback on error - restore the deleted connection mapping in all queries
          patchResults.forEach((result) => result.undo());
        }
      },
      invalidatesTags: [APITags.GET_PROCESS_CONNECTION_MAPPINGS],
    }),
    getIntegrationsCatalog: builder.query<IntegrationCatalogResponseType, IntegrationCatalogRequestType>({
      query: (params) => ({ url: API_ENDPOINTS.INTEGRATIONS_CATALOG_GET, params }),
      providesTags: [APITags.INTEGRATIONS_CATALOG_GET],
    }),
    getIntegrationsCatalogEnabled: builder.query<IntegrationCatalogResponseType, IntegrationCatalogRequestType>({
      query: (params) => ({ url: API_ENDPOINTS.INTEGRATIONS_CATALOG_ENABLED_GET, params }),
      providesTags: [APITags.INTEGRATIONS_CATALOG_ENABLED_GET],
    }),
    authenticateIntegrationV2: builder.mutation<
      AuthenticateIntegrationResponseTypeV2,
      AuthenticateIntegrationRequestTypeV2
    >({
      query: (body) => ({
        url: API_ENDPOINTS.INTEGRATIONS_AUTHENTICATE_V2_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
      invalidatesTags: [APITags.INTEGRATIONS_CATALOG_GET, APITags.INTEGRATIONS_CATALOG_ENABLED_GET],
    }),
    deleteIntegrationConnection: builder.mutation<void, { connectionId: string }>({
      query: ({ connectionId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.INTEGRATIONS_CONNECTIONS_DELETE, { connectionId }),
        method: REQUEST_TYPES.DELETE,
      }),
      invalidatesTags: [APITags.INTEGRATIONS_CATALOG_GET, APITags.INTEGRATIONS_CATALOG_ENABLED_GET],
    }),
  }),
});

export const {
  useAuthenticateIntegrationMutation,
  useCreateProcessConnectionMappingMutation,
  useGetProcessConnectionMappingsQuery,
  useGetConnectionsByIntegrationNameQuery,
  useLazyGetConnectionsByIntegrationNameQuery,
  useDeleteProcessConnectionMappingMutation,
  useGetIntegrationsCatalogQuery,
  useLazyGetIntegrationsCatalogQuery,
  useAuthenticateIntegrationV2Mutation,
  useDeleteIntegrationConnectionMutation,
  useGetIntegrationsCatalogEnabledQuery,
} = Integrations;
