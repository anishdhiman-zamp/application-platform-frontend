import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import type {
  AgentDbExportRequest,
  AgentDbExportResponse,
  AgentDbExportStatusResponse,
  AgentDbQueryRequest,
  AgentDbQueryResponse,
  DatasetRolesResponse,
  ManageDatasetRoleRequest,
} from '@/types/api/agentManagedDb.types';
import { formRequestUrlWithParams } from '@/utils/common';

export type {
  AgentDbExportRequest,
  AgentDbExportResponse,
  AgentDbExportStatusResponse,
  AgentDbQueryRequest,
  AgentDbQueryResponse,
  DatasetRolesResponse,
  ManageDatasetRoleRequest,
};
export { DatasetRoleValue, RoleAction } from '@/types/api/agentManagedDb.types';

const AgentManagedDb = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    agentDbRead: builder.query<AgentDbQueryResponse, AgentDbQueryRequest>({
      query: ({ query }) => ({
        url: API_ENDPOINTS.AGENT_MANAGED_DB_QUERY_POST,
        method: REQUEST_TYPES.POST,
        body: { query },
      }),
    }),

    agentDbWrite: builder.mutation<AgentDbQueryResponse, AgentDbQueryRequest>({
      query: ({ query }) => ({
        url: API_ENDPOINTS.AGENT_MANAGED_DB_QUERY_POST,
        method: REQUEST_TYPES.POST,
        body: { query },
      }),
    }),

    getDatasetRoles: builder.query<DatasetRolesResponse, { tableName?: string }>({
      query: ({ tableName }) => ({
        url: API_ENDPOINTS.DATASET_ROLES_GET,
        params: tableName ? { table_name: tableName } : undefined,
      }),
      providesTags: [APITags.GET_DATASET_ROLES],
    }),

    manageDatasetRole: builder.mutation<DatasetRolesResponse, ManageDatasetRoleRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.DATASET_ROLES_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
      invalidatesTags: [APITags.GET_DATASET_ROLES],
    }),

    exportAgentDbTable: builder.mutation<AgentDbExportResponse, AgentDbExportRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.AGENT_DB_EXPORT_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),

    getAgentDbExportStatus: builder.query<AgentDbExportStatusResponse, { workflowId: string }>({
      query: ({ workflowId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_DB_EXPORT_STATUS_GET, { workflowId }),
      }),
    }),
  }),
});

export const {
  useAgentDbReadQuery,
  useLazyAgentDbReadQuery,
  useAgentDbWriteMutation,
  useGetDatasetRolesQuery,
  useManageDatasetRoleMutation,
  useExportAgentDbTableMutation,
  useLazyGetAgentDbExportStatusQuery,
} = AgentManagedDb;
