export enum POLICY_QUORUM {
  ONE = 'ANY_OF',
  ALL = 'ALL_OF',
}

export type PolicyQuorum = {
  label: string;
  value: POLICY_QUORUM;
};
