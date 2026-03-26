import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { baseApi } from '@/services/baseApi';

export interface AgentDbQueryRequest {
  query: string;
}

export interface AgentDbQueryResponse {
  rows: Record<string, unknown>[];
  count: number;
}

const AgentManagedDb = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    executeAgentDbQuery: builder.mutation<AgentDbQueryResponse, AgentDbQueryRequest>({
      query: ({ query }) => ({
        url: API_ENDPOINTS.AGENT_MANAGED_DB_QUERY_POST,
        method: REQUEST_TYPES.POST,
        body: { query },
      }),
    }),
  }),
});

export const { useExecuteAgentDbQueryMutation } = AgentManagedDb;
