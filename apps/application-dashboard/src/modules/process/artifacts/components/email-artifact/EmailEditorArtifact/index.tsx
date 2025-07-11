'use client';
import { useState } from 'react';
import BodyAndFooter from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/BodyAndFooter';
import Header from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/Header';
import { type EmailEditorArtifactProps } from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/types';
import { useEmitHITLActionMutation } from '@/apis/processes';
import { toast } from '@/components/common/toast/Toast';
import { useAppSelector } from '@/hooks/toolkit';
import { CTA_COMPONENT_TYPE } from '@/modules/process/process.types';

const EmailEditorArtifact = ({
  emailArtifact,
  artifactId,
  processId,
  activityId,
  emitHITLActionPayload,
  onClose,
}: EmailEditorArtifactProps) => {
  const userId = useAppSelector((state) => state.user?.user?.user_id);
  const [header, setHeader] = useState({
    heading: emailArtifact.heading,
    to_mail_ids: emailArtifact.to_mail_ids ?? [],
    cc_mail_ids: emailArtifact.cc_mail_ids ?? [],
    bcc_mail_ids: emailArtifact.bcc_mail_ids ?? [],
  });

  const [emitHITLAction, { isLoading }] = useEmitHITLActionMutation();

  const handleSend = (htmlString: string) => {
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
          values: [htmlString],
          cta_component_type: CTA_COMPONENT_TYPE.EMAIL_DRAFT_SEND_BUTTON,
        },
      ],
    };

    emitHITLAction({ processId, activityRunId: activityId, payload })
      .unwrap()
      .then(() => {
        toast.success('Email sent successfully');
        onClose();
      })
      .catch((error) => {
        toast.error(error?.data?.message ?? 'Something went wrong');
      });
  };

  const handleDelete = () => {
    console.log('delete');
  };

  const handleChangeHeading = (key: string, value: string | string[]) => {
    setHeader({ ...header, [key]: value });
  };

  return (
    <div className='bg-bg-gray-2 h-[calc(100vh-110px)] overflow-y-auto p-5'>
      <div className='border-GRAY_500 rounded-xl border-[0.5px] bg-white'>
        <Header onChange={handleChangeHeading} value={header} />
        <BodyAndFooter
          initialContent={emailArtifact.body_html || `<p>${emailArtifact.body_plain_text}</p>`}
          onSend={handleSend}
          onDelete={handleDelete}
          attachments={emailArtifact?.attachments}
          processId={processId}
          artifactId={artifactId}
          isEmailSending={isLoading}
        />
      </div>
    </div>
  );
};

export default EmailEditorArtifact;
