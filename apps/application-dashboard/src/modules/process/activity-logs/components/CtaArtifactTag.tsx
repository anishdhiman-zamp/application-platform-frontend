import { memo } from 'react';
import ArtifactTag from 'modules/process/common/ArtifactTag';
import type { CtasType } from '@/types/api/processApi.types';

interface CtaArtifactTagProps {
  cta: CtasType;
  onShowArtifacts: () => void;
}

const CtaArtifactTag = memo(({ cta, onShowArtifacts }: CtaArtifactTagProps) => (
  <ArtifactTag
    displayName={cta.display_name}
    artifactType={cta.artifact_type}
    iconIdentifier={cta.cta_config?.icon_identifier}
    ctaAction={cta.cta_action}
    onClick={onShowArtifacts}
    displayClassName='max-w-40'
  />
));

CtaArtifactTag.displayName = 'CtaArtifactTag';

export default CtaArtifactTag;
