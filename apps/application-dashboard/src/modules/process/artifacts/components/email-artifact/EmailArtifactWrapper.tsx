import { memo } from 'react';
import ArtifactLoader from 'modules/process/artifacts/components/ArtifactLoader';
import EmailArtifact from 'modules/process/artifacts/components/email-artifact/EmailArtifact';
import { EMAIL_STATUS, EmailArtifactWrapperProps } from 'modules/process/process.types';
import dynamic from 'next/dynamic';

const EmailEditorArtifact = dynamic(
  () => import('modules/process/artifacts/components/email-artifact/EmailEditorArtifact'),
  {
    ssr: false,
    loading: () => <ArtifactLoader />,
  },
);

const EmailArtifactWrapper = ({
  artifactData,
  processId,
  artifactId,
  activityId,
  emitHITLActionPayload,
  onCloseArtifacts,
}: EmailArtifactWrapperProps) => {
  switch (artifactData?.status) {
    case EMAIL_STATUS.DRAFT:
      return (
        <EmailEditorArtifact
          key={artifactId}
          emailArtifact={artifactData}
          artifactId={artifactId}
          processId={processId}
          activityId={activityId}
          emitHITLActionPayload={emitHITLActionPayload}
          onCloseArtifacts={onCloseArtifacts}
        />
      );
    default:
      return <EmailArtifact emailArtifact={artifactData} artifactId={artifactId} key={artifactId} />;
  }
};

export default memo(EmailArtifactWrapper);
