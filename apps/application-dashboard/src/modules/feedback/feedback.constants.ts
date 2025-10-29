export enum FEEDBACK_STATUS {
  OPEN = 'open',
  QUEUED = 'queued',
  APPLIED = 'applied',
  PROCESSING = 'processing',
  ARCHIVED = 'archived',
}

export enum SCOPE_TYPE {
  PROCESS = 'process',
  ACTIVITY_RUN = 'activity_run',
}

export enum LOCATION_TYPE {
  DATASET_FIELD = 'dataset_field',
  LOG = 'log',
  ACTIVITY_RUN = 'activity_run',
}
