import { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import TooltipV2 from '@/components/common/TooltipV2';
import { defaultFnType, SIDE_OPTIONS } from '@/types/commonTypes';

interface ConfigureFilterButtonProps {
  onConfigureFilter?: defaultFnType;
}

const ConfigureFilterButton: FC<ConfigureFilterButtonProps> = ({ onConfigureFilter }) => {
  if (!onConfigureFilter) return null;

  return (
    <TooltipV2 tooltipBody='Configure' side={SIDE_OPTIONS.BOTTOM} asChildTrigger>
      <Button
        size='xxsmall'
        variant='ghost'
        className='text-gray-700 [&_svg]:size-3.5'
        onClick={onConfigureFilter}
        data-testid='configure-filter-button'
      >
        <SvgSpriteLoader id='settings-04' size={14} />
      </Button>
    </TooltipV2>
  );
};

export default ConfigureFilterButton;
