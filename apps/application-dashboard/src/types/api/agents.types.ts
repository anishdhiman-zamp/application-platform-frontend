import type { TaskStatus } from '@zamp-platform/chat';
import type {
  AgentApiResponseItem,
  AgentFilterType,
  AgentType,
} from '@/modules/pace/components/agents/types/agents.types';

export interface AgentListQueryParams {
  filter?: AgentFilterType;
}

export interface AgentTaskCountsParams {
  agentId: string;
  search?: string;
}

export interface AgentTasksByStatusParams {
  agentId: string;
  status: TaskStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AgentTriggersParams {
  agentId: string;
}

export interface AgentConnectionsParams {
  agentId: string;
}

export interface AgentMembersParams {
  agentId: string;
}

export interface AddAgentMemberParams {
  agentId: string;
  userId: string;
}

export interface RemoveAgentMemberParams {
  agentId: string;
  userId: string;
}

export interface ConnectionToolPoliciesParams {
  connectionId: string;
  resourceAudiencePolicyId?: string;
}

export interface AddConnectionToAgentParams {
  connectionId: string;
  agentId: string;
}

export interface RemoveConnectionFromAgentParams {
  connectionId: string;
  agentId: string;
}

export interface IntegrationToolsParams {
  integrationName: string;
  page?: number;
  pageSize?: number;
}

export const transformAgentResponse = (apiAgent: AgentApiResponseItem): AgentType => ({
  id: apiAgent.agent_id,
  name: apiAgent.name,
  description: apiAgent.description,
  needs_review_count: apiAgent.task_counts.needs_input,
  conversations_count: apiAgent.task_counts.in_progress,
  completed_count: apiAgent.task_counts.completed,
  skills_invoked_count: apiAgent.trigger_count,
  created_by: apiAgent.created_by,
  is_shared: apiAgent.my_privilege !== 'admin',
  created_at: apiAgent.created_at,
  updated_at: apiAgent.updated_at,
  trigger_count: apiAgent.trigger_count,
  avatar: apiAgent.avatar ?? null,
  my_privilege: apiAgent.my_privilege,
});
