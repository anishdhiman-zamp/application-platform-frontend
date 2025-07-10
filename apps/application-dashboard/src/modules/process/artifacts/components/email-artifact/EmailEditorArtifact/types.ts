import type { EmitHITLActionPayload } from '@/modules/process/process.types';
import { EmailArtifactsResponseType, EmailAttachmentType } from '@/types/api/processApi.types';
import type { defaultFnType } from '@/types/commonTypes';

export type ToolbarConfig = {
  id: string;
  icon?: string;
  onClick?: defaultFnType;
  showDivider?: boolean;
  component?: React.ReactNode;
  tooltipBody?: string;
};

export type HeaderProps = {
  onChange: (key: string, value: string | string[]) => void;
  value: {
    heading: string;
    to_mail_ids: string[];
    cc_mail_ids: string[];
    bcc_mail_ids: string[];
  };
};

export type BodyAndFooterProps = {
  initialContent: string;
  onSend: (htmlString: string) => void;
  onDelete: defaultFnType;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  attachments: EmailAttachmentType[];
  processId: string;
  artifactId: string;
  isEmailSending: boolean;
};

export type EmailEditorArtifactProps = {
  emailArtifact: EmailArtifactsResponseType;
  artifactId: string;
  processId: string;
  activityId: string;
  emitHITLActionPayload: EmitHITLActionPayload;
  onClose: defaultFnType;
};
