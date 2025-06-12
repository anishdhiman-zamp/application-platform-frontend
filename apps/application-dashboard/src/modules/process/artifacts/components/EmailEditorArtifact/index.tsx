'use client';
import { useState } from 'react';
import BodyAndFooter from 'modules/process/artifacts/components/EmailEditorArtifact/BodyAndFooter';
import Header from 'modules/process/artifacts/components/EmailEditorArtifact/Header';
import { EmailArtifactsResponseType } from '@/types/api/processApi.types';

interface EmailEditorArtifactProps {
  emailArtifact: EmailArtifactsResponseType;
  artifactId: string;
}

const EmailEditorArtifact = ({ emailArtifact }: EmailEditorArtifactProps) => {
  const [header, setHeader] = useState({
    heading: emailArtifact.heading,
    to_mail_ids: emailArtifact.to_mail_ids,
    cc_mail_ids: emailArtifact.cc_mail_ids,
    bcc_mail_ids: emailArtifact.bcc_mail_ids,
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
    <div className='bg-bg-gray-2 p-5'>
      <div className='border-GRAY_500 rounded-xl border bg-white'>
        <Header onChange={handleChangeHeading} value={header} />
        <BodyAndFooter
          initialContent={emailArtifact.body_html || `<p>${emailArtifact.body_plain_text}</p>`}
          onSend={handleSend}
          onDelete={handleDelete}
          className='relative h-[calc(100vh-376px)] pt-0'
          bodyClassName='h-[calc(100vh-376px)]'
        />
      </div>
    </div>
  );
};

export default EmailEditorArtifact;
