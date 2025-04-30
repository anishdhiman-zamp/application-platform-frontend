import { LOGICAL_OPERATOR_CONDITIONS } from 'modules/widgets/displayConfig/displayConfig.types';
import { ResourceAudienceType } from '@/types/api/auth.types';

export enum PolicyQuorum {
  ONE = 'ANY_OF',
  ALL = 'ALL_OF',
}

export type PolicyQuorumOption = {
  label: string;
  value: PolicyQuorum;
};

export type ApproverDetail = {
  type: ResourceAudienceType;
  id: string;
};

export type ApprovalFlowCondition = {
  mode: PolicyQuorum;
  approver_details: ApproverDetail[];
};

export type ApprovalFlowStep = {
  logical_operator: LOGICAL_OPERATOR_CONDITIONS;
  conditions: ApprovalFlowCondition[];
};

export type ApprovalFlow = {
  steps: ApprovalFlowStep[];
};
