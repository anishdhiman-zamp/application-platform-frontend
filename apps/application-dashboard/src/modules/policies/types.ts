export enum POLICY_QUORUM {
  ONE = 'ONE',
  ALL = 'ALL',
}

export type PolicyQuorum = {
  label: string;
  value: POLICY_QUORUM;
};
