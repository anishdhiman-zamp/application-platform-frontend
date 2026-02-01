import { type EmitHITLActionPayload } from '@/modules/process/process.types';
import { EmailArtifactsResponseType, EmailAttachmentType } from '@/types/api/processApi.types';
import type { defaultFnType } from '@/types/commonTypes';

export type ToolbarConfig = {
  id: string;
  icon?: string;
  onClick?: defaultFnType;
  showDivider?: boolean;
  component?: React.ReactNode;
  tooltipBody?: string;
  iconSize?: number;
};

export enum SENDER_HEADING_VALUES {
  TO = 'to_mail_ids',
  CC = 'cc_mail_ids',
  BCC = 'bcc_mail_ids',
  HEADING = 'heading',
}

export type HeaderValueType = {
  [SENDER_HEADING_VALUES.TO]: string[];
  [SENDER_HEADING_VALUES.CC]: string[];
  [SENDER_HEADING_VALUES.BCC]: string[];
  [SENDER_HEADING_VALUES.HEADING]: string;
};

export type HeaderProps = {
  onHeaderChange: (key: SENDER_HEADING_VALUES, value: string | string[]) => void;
  value: HeaderValueType;
};

export type BodyAndFooterProps = {
  initialContent: string;
  onSend: () => void;
  onDelete: defaultFnType;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  attachments: EmailAttachmentType[];
  processId: string;
  artifactId: string;
  isEmailSending: boolean;
  onContentChange: (content: string) => void;
  onAttachmentsChange: (attachments: EmailAttachmentType[]) => void;
};

export type EmailEditorArtifactProps = {
  emailArtifact: EmailArtifactsResponseType;
  artifactId: string;
  processId: string;
  activityId: string;
  emitHITLActionPayload: EmitHITLActionPayload;
  onCloseArtifacts: defaultFnType;
};
