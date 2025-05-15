import { FC, memo } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import ArtifactTag from 'modules/process/common/ArtifactTag';
import { CTA_COMPONENT_TYPE } from 'modules/process/process.types';
import type { CtasType } from '@/types/api/processApi.types';
type LogCtaProps = {
  ctas: CtasType[];
};

const LogCta: FC<LogCtaProps> = ({ ctas }) => {
  const artifactTypeCta = ctas.filter((cta) => cta.cta_component_type === CTA_COMPONENT_TYPE.ARTIFACT);
  const buttonTypeCta = ctas.filter((cta) => cta.cta_component_type === CTA_COMPONENT_TYPE.BUTTON);

  return (
    <div className='flex flex-col items-center justify-start gap-y-2 mt-3 w-full'>
      <div className='flex items-center justify-start gap-x-2 w-full'>
        {artifactTypeCta?.map((cta) => (
          <ArtifactTag key={cta?.id} displayName={cta?.display_name} type={cta?.cta_component_type} />
        ))}
      </div>
      <div className='flex items-center justify-start gap-x-2 w-full'>
        {buttonTypeCta?.map((cta) => (
          <Button key={cta?.id} className='gap-x-1.5 h-6 px-2.5 py-1.5 f-12-500'>
            <SvgSpriteLoader id={cta?.icon_url} size={12} />
            <span className='f-12-450'>{cta?.display_name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default memo(LogCta);
