'use client';
import { useState } from 'react';
import BodyAndFooter from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/BodyAndFooter';
import Header from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/Header';
import { EmailEditorArtifactProps } from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/types';

const EmailEditorArtifact = ({ emailArtifact, artifactId, processId }: EmailEditorArtifactProps) => {
  const [header, setHeader] = useState({
    heading: emailArtifact.heading,
    to_mail_ids: emailArtifact.to_mail_ids ?? [],
    cc_mail_ids: emailArtifact.cc_mail_ids ?? [],
    bcc_mail_ids: emailArtifact.bcc_mail_ids ?? [],
  });

  const handleSend = (htmlString: string) => {
    console.log({ htmlString, header });
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
        />
      </div>
    </div>
  );
};

export default EmailEditorArtifact;
