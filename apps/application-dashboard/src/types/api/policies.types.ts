import type { PolicyDetailsType } from 'types/api/paymentApi.types';

/**
 * Types for policy-related API responses and requests
 */

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

export type GetDualAdminPolicyResponse = {
  name: string;
  description: string;
  resource_id: string;
  resource_type: string;
  action_type: string;
  icon_id: string;
  policy: PolicyDetailsType;
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
