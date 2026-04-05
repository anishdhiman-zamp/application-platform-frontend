import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import { formRequestUrlWithParams } from '@/utils/common';

export interface AgentDbQueryRequest {
  query: string;
}

export interface AgentDbQueryResponse {
  rows: Record<string, unknown>[];
  count: number;
}

export enum DatasetRoleValue {
  ADMIN = 'admin',
  VIEWER = 'viewer',
  EDITOR = 'editor',
}

export enum RoleAction {
  GRANT = 'grant',
  REVOKE = 'revoke',
}

export interface DatasetRoleEntry {
  user_id: string;
  table_name: string;
  role: DatasetRoleValue;
}

export interface DatasetRolesResponse {
  roles: DatasetRoleEntry[];
}

export interface ManageDatasetRoleRequest {
  table_name: string;
  user_id: string;
  role?: DatasetRoleValue;
  action: RoleAction;
}

export interface AgentDbExportRequest {
  table_name: string;
  where_clause?: string;
}

export interface AgentDbExportResponse {
  workflow_id: string;
}

export interface AgentDbExportStatusResponse {
  workflow_id: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  signed_url?: string;
  row_count?: number;
  error_message?: string;
}

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
