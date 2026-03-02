/**
 * Types for policy-related API responses and requests
 */

import { LOGICAL_OPERATOR_CONDITIONS } from '@/modules/widgets/displayConfig/displayConfig.types';
import { ResourceAudienceType } from '@/types/api/auth.types';
import type { MapAny } from '@/types/commonTypes';

export enum ResourceType {
  ORGANIZATION = 'organization',
  DATASET = 'dataset',
  PAGE = 'page',
  PAYMENTS = 'payments',
}

export enum ActionType {
  INVITE_USER = 'INVITE_USER',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type Approval = {
  id: string;
  policy_result_id: string;
  approver_id: string;
  status: ApprovalStatus;
  comments?: string;
  step_index: number;
  created_at: string;
  deleted_at?: string;
  updated_at: string;
};

export type GetPendingApprovalsResponse = {
  data: Approval[];
};

export type GetPolicyResultApprovalsResponse = {
  data: Approval[];
};

export type ProcessApprovalRequest = {
  ids: string[];
  comments?: string;
};

export type PolicyApprovalRequest = {
  action: string;
  approval_ids: string[];
};

export type ProcessApprovalResponse = {
  data: string;
  message: string;
};

export enum PolicyResultStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type ApprovalStatusType = {
  status: string;
  user_approvals: {
    id: string;
    status: string;
  }[];
};

export type ApproverDetailsType = {
  id: string;
  type: string;
  approval_status_details: ApprovalStatusType;
};

export type PolicyStepType = {
  conditions: {
    mode: string;
    approver_details: ApproverDetailsType[];
    logical_operator: string;
  }[];
  logical_operator: string;
};

export type PolicyConfigType = {
  action: string;
  approval_flow: {
    steps: PolicyStepType[];
  };
  current_approval_step: number;
};

export type PolicyType = {
  id: string;
  name: string;
  description: string;
  resource_action_type_id: string;
  organisation_id: string;
  policy_configurations: PolicyConfigType[];
  created_at: string;
  created_by: string;
  updated_at: string;
  deleted_at: string | null;
};

export type GetPoliciesResponse = {
  data: PolicyType[];
};

export enum RESOURCE_ACTION_TYPE {
  DELETE_RESOURCE_AUDIENCE_POLICY = 'DELETE_RESOURCE_AUDIENCE_POLICY',
  ADD_RESOURCE_AUDIENCE_POLICY = 'ADD_RESOURCE_AUDIENCE_POLICY',
  UPDATE_RESOURCE_AUDIENCE_POLICY = 'UPDATE_RESOURCE_AUDIENCE_POLICY',
  MUTATE_USER = 'MUTATE_USER',
}

export enum PolicyQuorum {
  ONE = 'ANY_OF',
  ALL = 'ALL_OF',
}

export type PolicyApprovalStep = {
  logical_operator: LOGICAL_OPERATOR_CONDITIONS;
  conditions: Array<{
    mode: PolicyQuorum;
    approver_details: Array<{
      type: ResourceAudienceType;
      id: string;
    }>;
  }>;
};

export interface CreatePolicyCondition {
  field: string;
  value: any;
  operator: string;
  display_name: string;
}

export interface CreatePolicyConfigPayload {
  creator?: Array<{
    type: string;
    id: string;
  }>;
  conditions?: {
    logical_operator: string;
    conditions: Array<CreatePolicyCondition>;
  };
  action: string;
  approval_flow?: {
    steps: PolicyApprovalStep[];
  };
}

export enum PolicyMutateActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export type PolicyStatusType = {
  status: PolicyResultStatus;
  policy_result_id: string;
  policy_result_created_by: string;
  resource_action_metadata: {
    mutate_action: PolicyMutateActionType;
    data: MapAny;
  };
  can_approve: true;
  approval: {
    id: string;
    status: PolicyResultStatus;
  };
};

export enum PolicyActionType {
  CREATE_PAYMENT = 'CREATE_PAYMENT',
  CREATE_TEMPLATE = 'CREATE_TEMPLATE',
  MUTATE_POLICY = 'MUTATE_POLICY',
}

export type PolicyDetailsType = {
  id: string;
  name: string;
  description: string;
  resource_action_type_id: string;
  organisation_id: string;
  policy_configurations: CreatePolicyConfigPayload;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  status: string;
  status_details: PolicyStatusType;
  action_type: PolicyActionType;
};
