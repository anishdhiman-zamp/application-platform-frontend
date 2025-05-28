import type { FC } from 'react';
import { TabsList, TabsTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { PDF_DATASET_TAB } from 'modules/process/process.types';
import TooltipV2 from '@/components/common/TooltipV2';
import { COLORS } from '@/constants/colors';
import { type defaultFnType, SIDE_OPTIONS } from '@/types/commonTypes';

interface ArtifactTopbarProps {
  onClose: defaultFnType;
  onExpand: defaultFnType;
  isExpanded: boolean;
  isPdfDataset: boolean;
  title?: string;
  onOpenAllArtifacts: defaultFnType;
}

const ArtifactTopbar: FC<ArtifactTopbarProps> = ({
  onClose,
  onExpand,
  isExpanded,
  isPdfDataset,
  title,
  onOpenAllArtifacts,
}) => {
  return (
    <div className='flex justify-between h-15 shrink-0 items-center w-full border-b border-GRAY_100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
      <div className='flex justify-center items-center gap-x-2 p-4 min-w-max'>
        <SvgSpriteLoader
          id='menu-03'
          size={14}
          color={COLORS.GRAY_1000}
          className='cursor-pointer'
          onClick={onOpenAllArtifacts}
        />

        <span className='f-14-500 text-GRAY_1000 animate-opacity transition-all duration-300'>
          {title ?? 'Artifact'}
        </span>
      </div>

      <div className='flex justify-center items-center gap-x-3.5 p-4 min-w-max'>
        {isPdfDataset && (
          <TabsList className='gap-x-1'>
            <TabsTrigger
              value={PDF_DATASET_TAB.DATASET}
              className='p-1.5 shrink-0 flex items-center justify-center h-6 w-[26px]'
            >
              <TooltipV2 side={SIDE_OPTIONS.TOP} tooltipBody={'Switch to Dataset'}>
                <SvgSpriteLoader id='coins-stacked-04' size={14} color={COLORS.GRAY_1000} />
              </TooltipV2>
            </TabsTrigger>
            <TabsTrigger
              value={PDF_DATASET_TAB.PDF}
              className='p-1.5 shrink-0 flex items-center justify-center h-6 w-[26px]'
            >
              <TooltipV2 side={SIDE_OPTIONS.TOP} tooltipBody={'Switch to PDF'}>
                <SvgSpriteLoader id='file-02' size={14} color={COLORS.GRAY_1000} className='shrink-0' />
              </TooltipV2>
            </TabsTrigger>
          </TabsList>
        )}

        <TooltipV2 side={SIDE_OPTIONS.TOP} tooltipBody={isExpanded ? 'Collapse' : 'Expand'}>
          <SvgSpriteLoader
            id={isExpanded ? 'minimize-01' : 'expand-01'}
            size={12}
            color={COLORS.GRAY_1000}
            onClick={onExpand}
            className='cursor-pointer animate-opacity transition-all duration-300'
            key={isExpanded ? 'minimize-01' : 'expand-01'}
          />
        </TooltipV2>

        <TooltipV2 side={SIDE_OPTIONS.TOP} tooltipBody={'Close'}>
          <SvgSpriteLoader
            id='x-close'
            size={16}
            color={COLORS.GRAY_1000}
            onClick={onClose}
            className='cursor-pointer'
          />
        </TooltipV2>
      </div>
    </div>
  );
};

export default ArtifactTopbar;
