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

export type DatasetRoleValue = 'admin' | 'viewer' | 'editor';

export interface DatasetRoleEntry {
  user_id: string;
  table_name: string;
  role: DatasetRoleValue;
  granted_by: string;
  granted_at: string | null;
}

export interface DatasetRolesResponse {
  roles: DatasetRoleEntry[];
}

export interface ManageDatasetRoleRequest {
  table_name: string;
  user_id: string;
  role?: DatasetRoleValue;
  action: 'grant' | 'revoke';
}

export interface UpdateDatasetMetaRequest {
  oldTableName: string;
  newTableName: string;
  newDescription: string;
  oldDescription: string;
  listingQueryArg: AgentDbQueryRequest;
  queries: string[];
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

    updateDatasetMeta: builder.mutation<void, UpdateDatasetMetaRequest>({
      queryFn: async ({ queries }, api) => {
        try {
          await Promise.all(
            queries.map((sql) => api.dispatch(AgentManagedDb.endpoints.agentDbWrite.initiate({ query: sql })).unwrap()),
          );

          return { data: undefined };
        } catch {
          return { error: { status: 'CUSTOM_ERROR' as const, error: 'Failed to update dataset' } };
        }
      },
      async onQueryStarted(
        { oldTableName, newTableName, newDescription, listingQueryArg },
        { dispatch, queryFulfilled },
      ) {
        const patchResult = dispatch(
          AgentManagedDb.util.updateQueryData('agentDbRead', listingQueryArg, (draft) => {
            const row = draft.rows.find((r) => r.table_name === oldTableName);

            if (row) {
              row.table_name = newTableName;
              row.description = newDescription;
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          dispatch(AgentManagedDb.util.invalidateTags([{ type: 'AgentDbRead' as never }]));
        }
      },
      invalidatesTags: (_result, _error, { oldTableName, newTableName }) => {
        if (oldTableName !== newTableName) return [APITags.GET_DATASET_ROLES];

        return [];
      },
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
  useUpdateDatasetMetaMutation,
  useGetDatasetRolesQuery,
  useManageDatasetRoleMutation,
} = AgentManagedDb;
