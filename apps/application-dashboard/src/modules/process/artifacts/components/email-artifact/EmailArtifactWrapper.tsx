import { memo } from 'react';
import ArtifactLoader from 'modules/process/artifacts/components/ArtifactLoader';
import EmailArtifact from 'modules/process/artifacts/components/email-artifact/EmailArtifact';
import { EMAIL_STATUS, EmailArtifactWrapperProps } from 'modules/process/process.types';
import dynamic from 'next/dynamic';
import { EmailArtifactsResponseType } from '@/types/api/processApi.types';

const EmailEditorArtifact = dynamic(
  () => import('modules/process/artifacts/components/email-artifact/EmailEditorArtifact'),
  {
    ssr: false,
    loading: () => <ArtifactLoader />,
  },
);

const EmailArtifactWrapper = ({ artifactData, artifactId, processId }: EmailArtifactWrapperProps) => {
  switch (artifactData?.status) {
    case EMAIL_STATUS.DRAFT:
      return (
        <EmailEditorArtifact
          emailArtifact={artifactData as EmailArtifactsResponseType}
          artifactId={artifactId}
          processId={processId}
          key={artifactId}
        />
      );
    default:
      return (
        <EmailArtifact
          emailArtifact={artifactData as EmailArtifactsResponseType}
          artifactId={artifactId}
          key={artifactId}
        />
      );
  }
};

export default memo(EmailArtifactWrapper);
