import { useState } from 'react';
import { produce } from 'immer';
import type { SENDER_HEADING_VALUES } from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/types';
import { getInitialEmailData } from 'modules/process/process.utils';
import { EMAIL_DATA_SECTION, type EmailDataTypes } from '@/modules/process/process.types';
import type { EmailArtifactsResponseType, EmailAttachmentType } from '@/types/api/processApi.types';

type UpdateSectionProps = {
  section: EMAIL_DATA_SECTION;
  key?: SENDER_HEADING_VALUES;
  value?: string | string[] | EmailAttachmentType[];
};

export const useEmailEditorState = (emailArtifact: EmailArtifactsResponseType) => {
  const initialEmailData = getInitialEmailData(emailArtifact);
  const [emailData, setEmailData] = useState<EmailDataTypes>(initialEmailData);

  const updateSection = ({ section, key, value }: UpdateSectionProps) => {
    setEmailData((prev) =>
      produce(prev, (draft) => {
        if (section === EMAIL_DATA_SECTION.HEADER && key) {
          (draft.header as Record<string, string | string[]>)[key] = value as string | string[];
        } else if (section === EMAIL_DATA_SECTION.CONTENT && typeof value === 'string') {
          draft.content = value as string;
        } else if (section === EMAIL_DATA_SECTION.ATTACHMENTS && Array.isArray(value)) {
          draft.attachments = value as EmailAttachmentType[];
        }
      }),
    );
  };

  return {
    emailData,
    setEmailData,
    updateSection,
  };
};
