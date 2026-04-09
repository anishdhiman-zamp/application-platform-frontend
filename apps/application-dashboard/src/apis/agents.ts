import { REQUEST_TYPES } from '@zamp-platform/api';
import type { TaskStatus } from '@zamp-platform/chat';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { TRIGGER_STATUS_ACTIVE } from '@/modules/pace/components/agents/constants/agents.constants';
import type {
  AgentApiResponseItem,
  AgentConnectionApiResponseItem,
  AgentConnectionsResponseType,
  AgentListResponseType,
  AgentMemberApiResponseItem,
  AgentMembersResponseType,
  AgentTriggerApiResponseItem,
  AgentTriggersResponseType,
  AgentType,
  IntegrationToolsResponse,
  ToolPoliciesApiResponse,
} from '@/modules/pace/components/agents/types/agents.types';
import type {
  TaskListByStatusResponse,
  TaskListingCountsResponse,
  TaskListItem,
} from '@/modules/pace/components/tasks/types/tasks.types';
import { baseApi } from '@/services/baseApi';
import type {
  AddAgentMemberParams,
  AddConnectionToAgentParams,
  AgentConnectionsParams,
  AgentListQueryParams,
  AgentMembersParams,
  AgentTaskCountsParams,
  AgentTasksByStatusParams,
  AgentTriggersParams,
  ConnectionToolPoliciesParams,
  IntegrationToolsParams,
  RemoveAgentMemberParams,
  RemoveConnectionFromAgentParams,
  UpdateConnectionToolPoliciesParams,
} from '@/types/api/agents.types';
import { transformAgentResponse } from '@/types/api/agents.types';
import { formRequestUrlWithParams } from '@/utils/common';

interface AgentTaskApiItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  subtasks: { id: string; title: string; status: string; subtasks?: unknown[] }[];
  created_at: string;
}

const mapAgentTask = (t: AgentTaskApiItem): TaskListItem => ({
  id: t.id,
  title: t.title,
  description: t.description,
  status: t.status as TaskStatus,
  subtasks: (t.subtasks ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status as TaskStatus,
  })),
  skills_invoked_count: 0,
  created_by: { id: 'agent', name: 'Agent' },
  created_at: t.created_at,
});

const agentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAgentsList: builder.query<AgentListResponseType, AgentListQueryParams>({
      query: ({ filter } = {}) => ({
        url: API_ENDPOINTS.AGENTS_LIST_GET,
        params: { filter },
      }),
      transformResponse: (response: AgentApiResponseItem[]): AgentListResponseType => ({
        agents: response
          .map(transformAgentResponse)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
      }),
      providesTags: [APITags.GET_AGENTS_LIST],
    }),

    getAgent: builder.query<AgentType, { agentId: string }>({
      query: ({ agentId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_GET, { agentId }),
      }),
      transformResponse: (response: AgentApiResponseItem): AgentType => transformAgentResponse(response),
      providesTags: (_result, _error, { agentId }) => [{ type: APITags.GET_AGENT, id: agentId }],
    }),

    updateAgent: builder.mutation<void, { agentId: string; name?: string; description?: string }>({
      query: ({ agentId, ...body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_PATCH, { agentId }),
        method: REQUEST_TYPES.PATCH,
        body,
      }),
      invalidatesTags: (_result, _error, { agentId }) => [
        APITags.GET_AGENTS_LIST,
        { type: APITags.GET_AGENT, id: agentId },
      ],
    }),

    getAgentTaskCounts: builder.query<TaskListingCountsResponse, AgentTaskCountsParams>({
      query: ({ agentId, search }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_TASKS_GET, { agentId }),
        params: { search: search || undefined },
      }),
      transformResponse: (response: { tasks: AgentTaskApiItem[] }): TaskListingCountsResponse => {
        const countMap = new Map<string, number>();

        for (const task of response.tasks ?? []) {
          countMap.set(task.status, (countMap.get(task.status) ?? 0) + 1);
        }

        return {
          counts: Array.from(countMap.entries()).map(([status, count]) => ({
            status: status as TaskStatus,
            count,
          })),
          total: response.tasks?.length ?? 0,
        };
      },
      providesTags: [APITags.GET_AGENT_TASKS],
    }),

    getAgentTasksByStatus: builder.query<TaskListByStatusResponse, AgentTasksByStatusParams>({
      query: ({ agentId, status, search, page = 1, limit = 20 }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_TASKS_GET, { agentId }),
        params: { status, search: search || undefined, page, limit },
      }),
      transformResponse: (
        response: { tasks: AgentTaskApiItem[] },
        _meta,
        { status, page = 1, limit = 20 },
      ): TaskListByStatusResponse => {
        const filtered = (response.tasks ?? []).filter((t) => t.status === status);
        const start = (page - 1) * limit;
        const paged = filtered.slice(start, start + limit);

        return {
          tasks: paged.map(mapAgentTask),
          count: filtered.length,
          page,
          limit,
        };
      },
      providesTags: [APITags.GET_AGENT_TASKS],
    }),
    getAgentTriggers: builder.query<AgentTriggersResponseType, AgentTriggersParams>({
      query: ({ agentId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_TRIGGERS_GET, { agentId }),
      }),
      transformResponse: (response: AgentTriggerApiResponseItem[]): AgentTriggersResponseType => ({
        triggers: response.map((t) => ({
          id: t.id,
          title: t.title,
          enabled: t.status === TRIGGER_STATUS_ACTIVE,
          icon: t.icon,
        })),
      }),
      providesTags: [APITags.GET_AGENT_TRIGGERS],
    }),
    toggleAgentTrigger: builder.mutation<void, { agentId: string; triggerId: string; active: boolean }>({
      query: ({ agentId, triggerId, active }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_TRIGGER_TOGGLE, { agentId, triggerId }),
        method: REQUEST_TYPES.POST,
        params: { active },
      }),
    }),
    getAgentFileAccess: builder.query<
      { user_id: string; username: string; folders: { path: string; has_access: boolean }[] },
      { agentId: string; userId: string }
    >({
      query: ({ agentId, userId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_FILE_ACCESS_GET, { agentId }),
        params: { user_id: userId },
      }),
      providesTags: (_result, _error, { agentId }) => [{ type: APITags.GET_AGENT_FILE_ACCESS, id: agentId }],
    }),
    toggleAgentFileAccess: builder.mutation<
      void,
      { agentId: string; userId: string; folderPath: string; grantAccess: boolean }
    >({
      query: ({ agentId, userId, folderPath, grantAccess }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_FILE_ACCESS_POST, { agentId }),
        method: REQUEST_TYPES.POST,
        body: { user_id: userId, folder_path: folderPath, grant_access: grantAccess },
      }),
      invalidatesTags: (_result, _error, { agentId }) => [{ type: APITags.GET_AGENT_FILE_ACCESS, id: agentId }],
    }),
    deleteAgentIntegration: builder.mutation<void, { agentId: string; integrationName: string }>({
      query: ({ agentId, integrationName }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_INTEGRATION_DELETE, { agentId, integrationName }),
        method: REQUEST_TYPES.DELETE,
      }),
      invalidatesTags: (_result, _error, { agentId }) => [{ type: APITags.GET_AGENT_CONNECTIONS, id: agentId }],
    }),
    getAgentConnections: builder.query<AgentConnectionsResponseType, AgentConnectionsParams>({
      query: ({ agentId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_CONNECTIONS_GET, { agentId }),
      }),
      transformResponse: (response: AgentConnectionApiResponseItem[]): AgentConnectionsResponseType => ({
        connections: response,
      }),
      providesTags: (_result, _error, { agentId }) => [{ type: APITags.GET_AGENT_CONNECTIONS, id: agentId }],
    }),
    getAgentMembers: builder.query<AgentMembersResponseType, AgentMembersParams>({
      query: ({ agentId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_MEMBERS_GET, { agentId }),
      }),
      transformResponse: (response: AgentMemberApiResponseItem[]): AgentMembersResponseType => ({
        members: response,
      }),
      providesTags: (_result, _error, { agentId }) => [{ type: APITags.GET_AGENTS_LIST, id: `members-${agentId}` }],
    }),
    addAgentMember: builder.mutation<void, AddAgentMemberParams>({
      query: ({ agentId, userId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_MEMBERS_POST, { agentId }),
        method: REQUEST_TYPES.POST,
        body: { user_id: userId },
      }),
      invalidatesTags: (_result, _error, { agentId }) => [{ type: APITags.GET_AGENTS_LIST, id: `members-${agentId}` }],
    }),
    removeAgentMember: builder.mutation<void, RemoveAgentMemberParams>({
      query: ({ agentId, userId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_MEMBERS_DELETE, { agentId, userId }),
        method: REQUEST_TYPES.DELETE,
      }),
      invalidatesTags: (_result, _error, { agentId }) => [{ type: APITags.GET_AGENTS_LIST, id: `members-${agentId}` }],
    }),
    getConnectionToolPolicies: builder.query<ToolPoliciesApiResponse, ConnectionToolPoliciesParams>({
      query: ({ connectionId, resourceAudiencePolicyId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.CONNECTION_TOOL_POLICIES_GET, { connectionId }),
        params: resourceAudiencePolicyId ? { resource_audience_policy_id: resourceAudiencePolicyId } : undefined,
      }),
      providesTags: (_result, _error, { connectionId }) => [
        { type: APITags.GET_CONNECTION_TOOL_POLICIES, id: connectionId },
      ],
    }),
    updateConnectionToolPolicies: builder.mutation<void, UpdateConnectionToolPoliciesParams>({
      query: ({ connectionId, resourceAudiencePolicyId, policies }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.CONNECTION_TOOL_POLICIES_PUT, { connectionId }),
        method: REQUEST_TYPES.PUT,
        params: resourceAudiencePolicyId ? { resource_audience_policy_id: resourceAudiencePolicyId } : undefined,
        body: { policies },
      }),
      invalidatesTags: (_result, _error, { connectionId }) => [
        { type: APITags.GET_CONNECTION_TOOL_POLICIES, id: connectionId },
      ],
    }),
    addConnectionToAgent: builder.mutation<void, AddConnectionToAgentParams>({
      query: ({ connectionId, agentId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.CONNECTION_AUDIENCES_POST, { connectionId }),
        method: REQUEST_TYPES.POST,
        body: {
          audiences: [{ audience_type: 'user', audience_id: agentId, role: 'admin', fgac_filters: null }],
        },
      }),
      invalidatesTags: (_result, _error, { agentId }) => [{ type: APITags.GET_AGENT_CONNECTIONS, id: agentId }],
    }),
    removeConnectionFromAgent: builder.mutation<void, RemoveConnectionFromAgentParams>({
      query: ({ connectionId, agentId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.CONNECTION_AUDIENCES_DELETE, { connectionId }),
        method: REQUEST_TYPES.DELETE,
        body: { audience_type: 'user', audience_id: agentId },
      }),
      invalidatesTags: (_result, _error, { agentId }) => [{ type: APITags.GET_AGENT_CONNECTIONS, id: agentId }],
    }),
    getIntegrationTools: builder.query<IntegrationToolsResponse, IntegrationToolsParams>({
      query: ({ integrationName, page = 1, pageSize = 100 }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.INTEGRATION_TOOLS_GET, { integrationName }),
        params: { page, page_size: pageSize },
      }),
    }),
    getAgentInstructions: builder.query<{ content: string }, { agentId: string }>({
      query: ({ agentId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_INSTRUCTIONS_GET, { agentId }),
      }),
      providesTags: (_result, _error, { agentId }) => [{ type: APITags.GET_AGENT_INSTRUCTIONS, id: agentId }],
    }),
    updateAgentInstructions: builder.mutation<void, { agentId: string; instructions: string }>({
      query: ({ agentId, instructions }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AGENT_INSTRUCTIONS_PUT, { agentId }),
        method: REQUEST_TYPES.PUT,
        body: { instructions },
      }),
      invalidatesTags: (_result, _error, { agentId }) => [{ type: APITags.GET_AGENT_INSTRUCTIONS, id: agentId }],
    }),
  }),
});

export const {
  useGetAgentQuery,
  useGetAgentsListQuery,
  useUpdateAgentMutation,
  useGetAgentTaskCountsQuery,
  useGetAgentTasksByStatusQuery,
  useGetAgentTriggersQuery,
  useLazyGetAgentTriggersQuery,
  useToggleAgentTriggerMutation,
  useDeleteAgentIntegrationMutation,
  useGetAgentFileAccessQuery,
  useToggleAgentFileAccessMutation,
  useGetAgentConnectionsQuery,
  useGetAgentMembersQuery,
  useAddAgentMemberMutation,
  useRemoveAgentMemberMutation,
  useGetConnectionToolPoliciesQuery,
  useLazyGetConnectionToolPoliciesQuery,
  useUpdateConnectionToolPoliciesMutation,
  useAddConnectionToAgentMutation,
  useRemoveConnectionFromAgentMutation,
  useGetIntegrationToolsQuery,
  useLazyGetIntegrationToolsQuery,
  useGetAgentInstructionsQuery,
  useUpdateAgentInstructionsMutation,
} = agentsApi;
