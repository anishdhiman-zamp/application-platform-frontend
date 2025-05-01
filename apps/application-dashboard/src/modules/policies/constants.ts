import { ApprovalFlowStep, ApproverDetail, PolicyQuorum, PolicyQuorumOption } from 'modules/policies/types';
import { LOGICAL_OPERATOR_CONDITIONS } from 'modules/widgets/displayConfig/displayConfig.types';
import { ResourceAudienceType } from '@/types/api/auth.types';

export const POLICY_APPROVAL_STEP_MODIFIERS: PolicyQuorumOption[] = [
  { label: 'Any of', value: PolicyQuorum.ONE },
  { label: 'All of', value: PolicyQuorum.ALL },
];

export const DEFAULT_APPROVAL_STEP: ApprovalFlowStep = {
  logical_operator: LOGICAL_OPERATOR_CONDITIONS.OR,
  conditions: [{ mode: PolicyQuorum.ONE, approver_details: [] }],
};

export const DUMMY_APPROVERS: ApproverDetail[] = [
  { label: 'Design', id: 'design', type: ResourceAudienceType.TEAM },
  { label: 'Engineering', id: 'engineering', type: ResourceAudienceType.TEAM },
  { label: 'Finance', id: 'finance', type: ResourceAudienceType.TEAM },
  { label: 'John', id: 'John', type: ResourceAudienceType.USER },
  { label: 'Jane', id: 'Jane', type: ResourceAudienceType.USER },
  { label: 'Jim', id: 'Jim', type: ResourceAudienceType.USER },
  { label: 'Jill', id: 'Jill', type: ResourceAudienceType.USER },
];
