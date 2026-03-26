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
    // Read-only query (SELECT, COUNT, information_schema lookups). Uses RTK Query
    // caching and deduplication so identical reads aren't re-fetched.
    agentDbRead: builder.query<AgentDbQueryResponse, AgentDbQueryRequest>({
      query: ({ query }) => ({
        url: API_ENDPOINTS.AGENT_MANAGED_DB_QUERY_POST,
        method: REQUEST_TYPES.POST,
        body: { query },
      }),
    }),

    // Write operations (INSERT, UPDATE, DELETE). Mutation avoids caching so each
    // call always hits the server and side-effects are never skipped.
    agentDbWrite: builder.mutation<AgentDbQueryResponse, AgentDbQueryRequest>({
      query: ({ query }) => ({
        url: API_ENDPOINTS.AGENT_MANAGED_DB_QUERY_POST,
        method: REQUEST_TYPES.POST,
        body: { query },
      }),
    }),
  }),
});

export const { useAgentDbReadQuery, useLazyAgentDbReadQuery, useAgentDbWriteMutation } = AgentManagedDb;
