import type { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import TooltipV2 from '@/components/common/TooltipV2';
import { COLORS } from '@/constants/colors';
import { type defaultFnType, SIDE_OPTIONS } from '@/types/commonTypes';

interface ArtifactTopbarProps {
  closeArtifacts: defaultFnType;
  expandArtifacts: defaultFnType;
  isExpanded: boolean;
  title?: string;
  onOpenAllArtifacts: defaultFnType;
}

const ArtifactTopbar: FC<ArtifactTopbarProps> = ({
  closeArtifacts,
  expandArtifacts,
  isExpanded,
  title,
  onOpenAllArtifacts,
}) => {
  return (
    <div className='border-GRAY_100 flex h-15 w-full shrink-0 items-center justify-between overflow-hidden border-b'>
      <div className='flex w-full items-center justify-center gap-x-2 p-4'>
        <SvgSpriteLoader
          id='menu-03'
          size={14}
          color={COLORS.GRAY_1000}
          className='cursor-pointer'
          onClick={onOpenAllArtifacts}
        />

        <span className='f-14-500 text-GRAY_1000 animate-opacity w-0 flex-1 truncate transition-all duration-300'>
          {title ?? 'Artifact'}
        </span>
      </div>

      <div className='flex min-w-max items-center justify-center gap-x-3.5 p-4'>
        <TooltipV2 side={SIDE_OPTIONS.TOP} tooltipBody={isExpanded ? 'Collapse' : 'Expand'}>
          <SvgSpriteLoader
            id={isExpanded ? 'minimize-01' : 'expand-01'}
            size={12}
            color={COLORS.GRAY_1000}
            onClick={expandArtifacts}
            className='animate-opacity cursor-pointer transition-all duration-300'
            key={isExpanded ? 'minimize-01' : 'expand-01'}
          />
        </TooltipV2>

        <TooltipV2 side={SIDE_OPTIONS.TOP} tooltipBody={'Close'}>
          <SvgSpriteLoader
            id='x-close'
            size={16}
            color={COLORS.GRAY_1000}
            onClick={closeArtifacts}
            className='cursor-pointer'
          />
        </TooltipV2>
      </div>
    </div>
  );
};

export default ArtifactTopbar;
