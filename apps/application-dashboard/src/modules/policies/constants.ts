import { POLICY_QUORUM, PolicyQuorum } from 'modules/policies/types';

export const POLICY_APPROVAL_STEP_MODIFIERS: PolicyQuorum[] = [
  { label: 'Any of', value: POLICY_QUORUM.ONE },
  { label: 'All of', value: POLICY_QUORUM.ALL },
];
