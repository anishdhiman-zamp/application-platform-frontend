import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';

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
  }),
});

export const {
  useAgentDbReadQuery,
  useLazyAgentDbReadQuery,
  useAgentDbWriteMutation,
  useGetDatasetRolesQuery,
  useManageDatasetRoleMutation,
} = AgentManagedDb;
