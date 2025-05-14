export enum ACTIVITY_RUN_STATUS {
  NEEDS_ATTENTION = 'NEEDS_ATTENTION',
  VOID = 'VOID',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

export type ArtifactType = {
  id: string;
  title: string;
  type: string;
}[];

export enum ARTIFACT_TYPE {
  DOCUMENT = 'document',
  VIDEO = 'video',
  PDF_DATASET = 'PDF_DATASET',
  EMAIL = 'email',
}

export enum LOG_STATUS {
  LOADING = 'LOADING',
  MESSAGE_FROM_ADAM = 'MESSAGE_FROM_ADAM',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  NEEDS_ATTENTION = 'NEEDS_ATTENTION',
  VOID = 'VOID',
  DONE = 'DONE',
  MESSAGE_FROM_USER = 'MESSAGE_FROM_HUMAN',
}
