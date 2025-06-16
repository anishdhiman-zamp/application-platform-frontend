import { memo } from 'react';
import ArtifactLoader from 'modules/process/artifacts/components/ArtifactLoader';
import EmailArtifact from 'modules/process/artifacts/components/EmailArtifact';
import { EMAIL_STATUS } from 'modules/process/process.types';
import dynamic from 'next/dynamic';
import { EmailArtifactsResponseType } from '@/types/api/processApi.types';

const EmailEditorArtifact = dynamic(() => import('modules/process/artifacts/components/EmailEditorArtifact'), {
  ssr: false,
  loading: () => <ArtifactLoader />,
});

const EmailArtifactWrapper = ({ artifactData, id }: { artifactData: EmailArtifactsResponseType; id: string }) => {
  switch (artifactData?.status) {
    case EMAIL_STATUS.RECEIVED:
      return <EmailArtifact emailArtifact={artifactData as EmailArtifactsResponseType} artifactId={id} key={id} />;
    case EMAIL_STATUS.DRAFT:
      return (
        <EmailEditorArtifact emailArtifact={artifactData as EmailArtifactsResponseType} artifactId={id} key={id} />
      );
    default:
      return <EmailArtifact emailArtifact={artifactData as EmailArtifactsResponseType} artifactId={id} key={id} />;
  }
};

export default memo(EmailArtifactWrapper);
