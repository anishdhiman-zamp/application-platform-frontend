export const MEDIA_TYPE = {
  SEED: 'seed',
  URL: 'url',
} as const;

export const PROVISIONING_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const PROVISIONING_POLL_INTERVAL_MS = 5000;
