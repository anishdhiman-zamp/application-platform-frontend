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
