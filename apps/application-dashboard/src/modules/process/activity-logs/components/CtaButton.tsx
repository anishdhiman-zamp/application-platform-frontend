import { memo } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import type { CtasType } from '@/types/api/processApi.types';
import { capitalizeFirstLetter } from '@/utils/common';

interface CtaButtonProps {
  cta: CtasType;
  isMultiple: boolean;
  isLoading: boolean;
  isCtaLoading: boolean;
  onClick: () => void;
}

const CtaButton = memo(({ cta, isMultiple, isLoading, isCtaLoading, onClick }: CtaButtonProps) => (
  <Button
    variant={isMultiple ? 'secondary' : 'default'}
    className='f-12-500 h-6 gap-x-1.5 px-2.5 py-1.5'
    onClick={onClick}
    disabled={isLoading || isCtaLoading}
    isLoading={isLoading && isCtaLoading}
  >
    {cta.cta_config?.icon_identifier && (
      <SvgSpriteLoader id={cta.cta_config.icon_identifier} size={12} className='shrink-0' />
    )}
    <span className='f-12-500'>{capitalizeFirstLetter(cta.display_name)}</span>
  </Button>
));

CtaButton.displayName = 'CtaButton';

export default CtaButton;
