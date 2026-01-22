import { memo } from 'react';
import ArtifactTag from 'modules/process/common/ArtifactTag';
import type { CtasType } from '@/types/api/processApi.types';
import type { defaultFnType } from '@/types/commonTypes';

interface CtaArtifactTagProps {
  cta: CtasType;
  onShowArtifacts: defaultFnType;
  disabled?: boolean;
}

const CtaArtifactTag = memo(({ cta, onShowArtifacts, disabled = false }: CtaArtifactTagProps) => (
  <ArtifactTag
    displayName={cta.display_name}
    artifactType={cta.artifact_type}
    iconIdentifier={cta.cta_config?.icon_identifier}
    ctaAction={cta.cta_action}
    onClick={onShowArtifacts}
    displayClassName='max-w-40'
    disabled={disabled}
  />
));

CtaArtifactTag.displayName = 'CtaArtifactTag';

export default CtaArtifactTag;
