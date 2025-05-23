import { type FC, memo } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import ArtifactTag from 'modules/process/common/ArtifactTag';
import { type ARTIFACT_TYPE, type CTA_ACTION, CTA_COMPONENT_TYPE } from 'modules/process/process.types';
import type { CtasType } from '@/types/api/processApi.types';
type LogCtaProps = {
  ctas: CtasType[];
  handleShowArtifacts: (artifactType: ARTIFACT_TYPE, artifactId: string, action?: CTA_ACTION) => void;
};

const LogCta: FC<LogCtaProps> = ({ ctas, handleShowArtifacts }) => {
  const artifactTypeCta = ctas.filter((cta) => cta.cta_component_type === CTA_COMPONENT_TYPE.ARTIFACT);
  const buttonTypeCta = ctas.filter((cta) => cta.cta_component_type === CTA_COMPONENT_TYPE.BUTTON);

  return (
    <div className='flex flex-col items-start justify-start gap-y-2 mt-3 w-full'>
      <div className='w-full flex items-start justify-start gap-x-2 gap-y-2 flex-wrap'>
        {artifactTypeCta?.map((cta) => (
          <ArtifactTag
            key={cta?.id}
            displayName={cta?.display_name}
            type={cta?.cta_component_type}
            onClick={() =>
              handleShowArtifacts(cta?.artifact_type as ARTIFACT_TYPE, cta?.id ?? '', cta?.cta_action as CTA_ACTION)
            }
          />
        ))}
        {buttonTypeCta?.map((cta) => (
          <Button key={cta?.id} className='gap-x-1.5 h-6 px-2.5 py-1.5 f-12-500 whitespace-nowrap'>
            <SvgSpriteLoader id={'check'} size={12} className='shrink-0' />
            <span className='f-12-450 truncate'>{cta?.display_name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default memo(LogCta);
