'use client';

import { memo, useCallback, useEffect, useRef } from 'react';
import BodyAndFooter from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/BodyAndFooter';
import Header from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/Header';
import type {
  EmailEditorArtifactProps,
  SENDER_HEADING_VALUES,
} from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/types';
import { useEmitHITLActionMutation, useUpdateArtifactMutation } from '@/apis/processes';
import { toast } from '@/components/common/toast/Toast';
import { useAppSelector } from '@/hooks/toolkit';
import { useEmailEditorState } from '@/modules/process/hooks/useEmailEditorState';
import { ARTIFACT_TYPE, CTA_COMPONENT_TYPE, EMAIL_DATA_SECTION } from '@/modules/process/process.types';
import { base64Encode } from '@/modules/process/process.utils';
import type { EmailAttachmentType } from '@/types/api/processApi.types';
import { debounce } from '@/utils/common';

const EmailEditorArtifact = ({
  emailArtifact,
  artifactId,
  processId,
  activityId,
  emitHITLActionPayload,
  onCloseArtifacts,
}: EmailEditorArtifactProps) => {
  const userId = useAppSelector((state) => state.user?.user?.user_id);
  const isFirstRender = useRef(true);
  const { emailData, updateSection } = useEmailEditorState(emailArtifact);

  const [emitHITLAction, { isLoading }] = useEmitHITLActionMutation();
  const [updateArtifact] = useUpdateArtifactMutation();

  const updateArtifactData = useCallback(
    (data: typeof emailData) => {
      if (!userId) return;

      const payload = {
        artifact_type: ARTIFACT_TYPE.EMAIL,
        artifact_data: {
          is_email_body_encoded: true,
          heading: data.header.heading,
          body_html: base64Encode(data.content),
          to_mail_ids: data.header.to_mail_ids,
          cc_mail_ids: data.header.cc_mail_ids,
          bcc_mail_ids: data.header.bcc_mail_ids,
          attachments: data.attachments,
          last_updated_by: {
            id: userId,
          },
        },
      };

      updateArtifact({ processId, artifactId, payload })
        .unwrap()
        .catch((error) => {
          toast.error(error?.data?.message ?? 'Something went wrong');
        });
    },
    [artifactId, processId, userId],
  );

  const debouncedUpdateArtifact = useCallback(debounce(updateArtifactData, 1500), [updateArtifactData]);

  const handleHeaderChange = (key: SENDER_HEADING_VALUES, value: string | string[] | EmailAttachmentType[]) => {
    updateSection({ section: EMAIL_DATA_SECTION.HEADER, key, value });
  };

  const handleContentChange = (content: string) => {
    updateSection({ section: EMAIL_DATA_SECTION.CONTENT, value: content });
  };

  const handleAttachmentsChange = (attachments: EmailAttachmentType[]) => {
    updateSection({ section: EMAIL_DATA_SECTION.ATTACHMENTS, value: attachments });
  };

  const handleSend = () => {
    const { logGroupId, hitlRequestId, ctaActionId } = emitHITLActionPayload;

    if (!logGroupId || !hitlRequestId || !userId || !ctaActionId) {
      toast.error('Missing required data for sending email');

      return;
    }

    const payload = {
      log_group_id: logGroupId,
      hitl_request_id: hitlRequestId,
      submitted_by: userId,
      responses: [
        {
          action_id: ctaActionId,
          values: [],
          cta_component_type: CTA_COMPONENT_TYPE.EMAIL_DRAFT_SEND_BUTTON,
        },
      ],
    };

    emitHITLAction({ processId, activityRunId: activityId, payload })
      .unwrap()
      .then(() => {
        toast.success('Email sent successfully');
        onCloseArtifacts();
      })
      .catch((error) => {
        toast.error(error?.data?.message ?? 'Something went wrong');
      });
  };

  const handleDelete = () => {
    console.log('delete');
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    debouncedUpdateArtifact(emailData);
  }, [emailData, debouncedUpdateArtifact]);

  return (
    <div className='bg-BG_GRAY_2 h-[calc(100vh-110px)] overflow-y-auto p-5'>
      <div className='border-GRAY_500 flex h-full flex-col rounded-xl border-[0.5px] bg-white'>
        <Header value={emailData.header} onHeaderChange={handleHeaderChange} />
        <BodyAndFooter
          initialContent={emailData.content}
          onSend={handleSend}
          onDelete={handleDelete}
          attachments={emailData.attachments}
          processId={processId}
          artifactId={artifactId}
          isEmailSending={isLoading}
          onContentChange={handleContentChange}
          onAttachmentsChange={handleAttachmentsChange}
        />
      </div>
    </div>
  );
};

export default memo(EmailEditorArtifact);
