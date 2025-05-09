import { ApprovalFlowStep, PolicyQuorum, PolicyQuorumOption } from 'modules/policies/types';
import { LOGICAL_OPERATOR_CONDITIONS } from 'modules/widgets/displayConfig/displayConfig.types';

export const POLICY_APPROVAL_STEP_MODIFIERS: PolicyQuorumOption[] = [
  { label: 'Any of', value: PolicyQuorum.ONE },
  { label: 'All of', value: PolicyQuorum.ALL },
];

export const DEFAULT_APPROVAL_STEP: ApprovalFlowStep = {
  logical_operator: LOGICAL_OPERATOR_CONDITIONS.OR,
  conditions: [{ mode: PolicyQuorum.ONE, approver_details: [] }],
};
