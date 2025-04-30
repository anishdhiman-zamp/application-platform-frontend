import { PolicyQuorum, PolicyQuorumOption } from 'modules/policies/types';

export const POLICY_APPROVAL_STEP_MODIFIERS: PolicyQuorumOption[] = [
  { label: 'Any of', value: PolicyQuorum.ONE },
  { label: 'All of', value: PolicyQuorum.ALL },
];
