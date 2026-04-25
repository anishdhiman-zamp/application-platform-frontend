import type { PolicyActionValue } from '@/modules/integrations/constants/policies.constants';

/** Audience kinds accepted by the policies backend (no AGENT — agents resolve to USER ids). */
export type ActionAudienceKind = 'user' | 'team' | 'organization';

export interface ActionAudienceRefBackend {
  type: ActionAudienceKind;
  id: string;
}

export interface ConditionLeafBackend {
  logical_operator?: string | null;
  field?: string | null;
  operator?: string | null;
  value?: unknown;
  conditions?: ConditionLeafBackend[];
}

export interface ConditionNodeBackend {
  logical_operator: string;
  conditions: ConditionLeafBackend[];
}

export interface PolicyConfigBackend {
  applies_to?: ActionAudienceRefBackend[] | null;
  conditions?: ConditionNodeBackend | null;
  action: PolicyActionValue;
}

export interface PolicyResponseBackend {
  id: string;
  resource_action_id: string;
  resource_type: string;
  resource_id: string;
  action_type: string;
  name: string;
  description: string;
  policy_configurations: PolicyConfigBackend;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ListPoliciesBackendResponse {
  policies: PolicyResponseBackend[];
}

export interface ResourceActionBackend {
  id: string;
  resource_type: string;
  resource_id: string;
  action_type: string;
}

export interface BulkPolicyCreateItem {
  name: string;
  description: string;
  policy_configurations: PolicyConfigBackend;
}

export interface BulkPolicyUpdateItem {
  id: string;
  name?: string;
  description?: string;
  policy_configurations?: PolicyConfigBackend;
}

export interface GetResourceActionParams {
  connectionId: string;
}

export interface CreateResourceActionParams {
  connectionId: string;
}

export interface BulkCreatePoliciesParams {
  connectionId: string;
  resourceActionId: string;
  policies: BulkPolicyCreateItem[];
}

export interface BulkUpdatePoliciesParams {
  connectionId: string;
  resourceActionId: string;
  updates: BulkPolicyUpdateItem[];
}
