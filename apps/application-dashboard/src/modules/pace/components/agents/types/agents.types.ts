import { FileType } from 'modules/pace/components/files/file-tree.types';

export interface AgentTaskCountsType {
  in_progress: number;
  needs_input: number;
  completed: number;
}

export interface AgentApiResponseItem {
  agent_id: string;
  name: string;
  description: string;
  key_prefix: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  task_counts: AgentTaskCountsType;
  trigger_count: number;
  avatar: string | null;
  my_privilege: string;
}

export interface AgentType {
  id: string;
  name: string;
  description: string;
  needs_review_count: number;
  conversations_count: number;
  completed_count: number;
  skills_invoked_count: number;
  created_by: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  trigger_count: number;
  avatar: string | null;
  my_privilege: string;
}

export interface AgentListResponseType {
  agents: AgentType[];
}

export const AGENT_LISTING_TAB = {
  ALL: 'all',
  MY_AGENTS: 'my_agents',
  SHARED_WITH_ME: 'shared_with_me',
} as const;

export type AgentListingTabType = (typeof AGENT_LISTING_TAB)[keyof typeof AGENT_LISTING_TAB];

export const AGENT_FILTER_VALUE = {
  [AGENT_LISTING_TAB.ALL]: 'all',
  [AGENT_LISTING_TAB.MY_AGENTS]: 'owner',
  [AGENT_LISTING_TAB.SHARED_WITH_ME]: 'shared',
} as const;

export type AgentFilterType = (typeof AGENT_FILTER_VALUE)[keyof typeof AGENT_FILTER_VALUE];

export const AGENT_DETAIL_TAB = {
  TASKS: 'tasks',
  TRIGGERS: 'triggers',
  INSTRUCTIONS: 'instructions',
  FILES: 'files',
  TOOLS_AND_ACCESS: 'tools_and_access',
} as const;

export type AgentDetailTabType = (typeof AGENT_DETAIL_TAB)[keyof typeof AGENT_DETAIL_TAB];

export interface AgentTriggerType {
  id: string;
  title: string;
  enabled: boolean;
  icon?: string;
}

export interface AgentTriggerApiResponseItem {
  id: string;
  title: string;
  trigger_name: string;
  trigger_type: string;
  status: string;
  description: string;
  created_at: string;
  icon?: string;
}

export interface AgentTriggersResponseType {
  triggers: AgentTriggerType[];
}

export interface AgentFileType {
  id: string;
  name: string;
  type: FileType;
  enabled: boolean;
}

export const TOOL_PERMISSION = {
  ALLOWED: 'allowed',
  ASK: 'ask',
  BLOCKED: 'blocked',
} as const;

export type ToolPermissionType = (typeof TOOL_PERMISSION)[keyof typeof TOOL_PERMISSION];

export interface AgentToolType {
  id: string;
  name: string;
  permission: ToolPermissionType;
}

export const ACCESS_LEVEL = {
  ALWAYS_ALLOW: 'always_allow',
  NEED_APPROVAL: 'need_approval',
  NEVER_ALLOW: 'never_allow',
  CUSTOM: 'custom',
} as const;

export type AccessLevelType = (typeof ACCESS_LEVEL)[keyof typeof ACCESS_LEVEL];

export interface AccessLevelOptionType {
  value: AccessLevelType;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  permission?: ToolPermissionType;
}

export interface AgentMemberApiResponseItem {
  user_id: string;
  user_name: string;
  user_email: string;
  privilege: string;
}

export interface AgentMembersResponseType {
  members: AgentMemberApiResponseItem[];
}

export interface AgentConnectionApiResponseItem {
  id: string;
  name: string;
  integration_name: string;
  status: string;
  privilege: string;
  connection_type: string;
  resource_audience_policy_id: string;
  tool_policies: ToolPolicyItem[];
}

export interface ToolPolicyItem {
  tool_policy_id: string;
  tool_name: string;
  display_name: string;
  policy: string;
  connection_id: string;
  resource_audience_policy_id: string;
}

export interface ToolPoliciesApiResponse {
  connection_id: string;
  resource_audience_policy_id: string;
  policies: ToolPolicyItem[];
  default_policy: string;
}

export interface IntegrationToolItem {
  name: string;
  display_name: string;
  description: string;
}

// The response shape may vary — accept both `items` and `tools` keys
export interface IntegrationToolsResponse {
  items?: IntegrationToolItem[];
  tools?: IntegrationToolItem[];
  total_count?: number;
  page?: number;
  page_size?: number;
}

export interface AgentConnectionsResponseType {
  connections: AgentConnectionApiResponseItem[];
}

export interface AgentConnectionType {
  id: string;
  email: string;
  accessLevel: AccessLevelType;
  tools: AgentToolType[];
  resourceAudiencePolicyId?: string;
  integrationName?: string;
  enabled?: boolean;
}

export interface AgentIntegrationType {
  id: string;
  name: string;
  icon: string;
  logo?: string;
  connections: AgentConnectionType[];
}

export interface PermissionOptionType {
  value: ToolPermissionType;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

export interface ToolPermissionControlPropsType {
  permission: ToolPermissionType;
  onPermissionChange: (permission: ToolPermissionType) => void;
}

export interface ConnectionSectionPropsType {
  connection: AgentConnectionType;
  isExpanded: boolean;
  integrationLogo?: string;
  integrationName?: string;
  onToggle: () => void;
  onPermissionChange?: (toolId: string, permission: ToolPermissionType) => void;
  onAccessLevelChange?: (accessLevel: AccessLevelType) => void;
  onRemoveConnection?: () => Promise<void>;
}

export interface IntegrationListPropsType {
  integrations: AgentIntegrationType[];
  allIntegrations?: AgentIntegrationType[];
  selectedIntegrationId: string;
  onSelectIntegration: (id: string) => void;
  onRemoveIntegration?: (integrationId: string) => void;
  removingIntegrationId?: string | null;
  onToggleConnection?: (integrationId: string, connectionId: string, checked: boolean) => void;
  onAddConnection?: () => void;
}

export interface IntegrationDetailPropsType {
  integration: AgentIntegrationType;
  allConnections?: AgentConnectionType[];
  expandedConnections: Set<string>;
  onToggleConnection: (connectionId: string) => void;
  onToolPermissionChange: (connectionId: string, toolId: string, permission: ToolPermissionType) => void;
  onAccessLevelChange: (connectionId: string, accessLevel: AccessLevelType) => void;
  onRemoveConnection?: (connectionId: string) => Promise<void>;
  onRemoveIntegration?: (integrationId: string) => void;
  onToggleConnectionEnabled?: (connectionId: string, checked: boolean) => void;
}

export interface AgentTaskApiItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  subtasks: { id: string; title: string; status: string; subtasks?: unknown[] }[];
  created_at: string;
}
