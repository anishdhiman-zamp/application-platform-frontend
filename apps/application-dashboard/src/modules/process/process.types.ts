import {
  EmailArtifactsResponseType,
  type EmailAttachmentType,
  type MissingFieldItemType,
} from '@/types/api/processApi.types';
import type { defaultFnType, MapAny } from '@/types/commonTypes';

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
  PDF_DATASET = 'PDF_DATASET',
  EMAIL = 'EMAIL',
  BROWSER = 'BROWSER',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
  PDF = 'PDF',
  DATASET = 'DATASET',
}

export enum LOG_STATUS {
  LOADING = 'INITIATED',
  MESSAGE_FROM_ADAM = 'MESSAGE_FROM_ADAM',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  NEEDS_ATTENTION = 'NEEDS_ATTENTION',
  VOID = 'VOID',
  DONE = 'DONE',
  MESSAGE_FROM_USER = 'MESSAGE_FROM_HUMAN',
}

export enum SENDER_TYPE {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
}

export enum CONTENT_TYPE {
  MESSAGE_SECTION = 'MESSAGE_SECTION',
  REPLIED_TO_SECTION = 'REPLIED_TO_SECTION',
}

export enum DATE_SEPARATOR {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  OTHER = 'OTHER',
}

export enum CTA_COMPONENT_TYPE {
  ARTIFACT = 'ARTIFACT',
  BUTTON = 'BUTTON',
  OVERRIDE_MISSING_FIELDS_BUTTON = 'OVERRIDE_MISSING_FIELDS_BUTTON',
  REQUIRED_MISSING_FIELDS_BUTTON = 'REQUIRED_MISSING_FIELDS_BUTTON',
  EMAIL_DRAFT_SEND_BUTTON = 'EMAIL_DRAFT_SEND_BUTTON',
}

export enum PDF_DATASET_TAB {
  DATASET = 'DATASET',
  PDF = 'PDF',
}

export enum DATASET_VIEW_TYPE {
  ROWS = 'ROWS',
  GRID = 'GRID',
}

export enum CTA_ACTION {
  NONE = 'NONE',
  VIEW_EMAIL = 'VIEW_EMAIL',
  VIEW_DATASET_PDF_PDF_FIRST = 'VIEW_DATASET_PDF_PDF_FIRST',
  VIEW_DATASET_PDF_DATASET_FIRST = 'VIEW_DATASET_PDF_DATASET_FIRST',
  VIEW_EXTERNAL_REDIRECTION = 'VIEW_EXTERNAL_REDIRECTION',
  VIEW_INLINE_MEDIA = 'VIEW_INLINE_MEDIA',
}

export enum EMAIL_STATUS {
  DRAFT = 'DRAFT',
  RECEIVED = 'RECEIVED',
}

export type EmailArtifactWrapperProps = {
  artifactData: EmailArtifactsResponseType;
  artifactId: string;
  processId: string;
  activityId: string;
  emitHITLActionPayload: EmitHITLActionPayload;
  onClose: defaultFnType;
};

export interface HandleShowArtifactsProps extends EmitHITLActionPayload {
  artifactType: ARTIFACT_TYPE;
  artifactId: string;
  action?: CTA_ACTION;
  filters?: MapAny;
  ctaConfig?: {
    icon_identifier: string;
    variant: string;
    dataset_to_missing_fields_map: MissingFieldsConfigType;
    dataset_artifacts: {
      cells: MissingFieldItemType[];
      dataset_id: string;
    }[];
  };
}

export type EmitHITLActionPayload = {
  logGroupId?: string;
  hitlRequestId?: string;
  ctaActionId?: string;
  ctaValue?: string;
};

export type MissingFieldsConfigType = Record<
  string,
  {
    cells: MissingFieldItemType[];
    filters: MapAny;
  }
>;

export const enum EMAIL_DATA_SECTION {
  HEADER = 'header',
  CONTENT = 'content',
  ATTACHMENTS = 'attachments',
}

export type EmailHeaderType = {
  heading: string;
  to_mail_ids: string[];
  cc_mail_ids: string[];
  bcc_mail_ids: string[];
};

export type EmailDataTypes = {
  header: EmailHeaderType;
  content: string;
  attachments: EmailAttachmentType[];
};
