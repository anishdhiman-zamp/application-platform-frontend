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

export type ProcessApprovalResponse = {
  data: string;
};

export enum PolicyResultStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type Policy = {
  id: string;
  name: string;
  description: string;
  resource_action_type_id: string;
  organisation_id: string;
  policy_configurations: {
    action: string;
    approval_flow: {
      steps: {
        conditions: {
          mode: string;
          approver_details: {
            id: string;
            type: string;
          }[];
        }[];
        logical_operator: string;
      }[];
    };
  };
  created_at: string;
  created_by: string;
  updated_at: string;
  deleted_at: string | null;
};

export type GetPoliciesResponse = {
  data: Policy[];
};
