import type { FC } from 'react';
import { TabsList, TabsTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from '@/constants/colors';

interface ArtifactTopbarProps {
  onClose: () => void;
  onExpand: () => void;
  isExpanded: boolean;
}

const ArtifactTopbar: FC<ArtifactTopbarProps> = ({ onClose, onExpand, isExpanded }) => {
  return (
    <div className='flex justify-between h-15 items-center w-full border-b border-GRAY_100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
      <div className='flex justify-center items-center gap-x-2 p-4 min-w-max'>
        <SvgSpriteLoader id='menu-03' height={14} width={14} color={COLORS.GRAY_1000} className='cursor-pointer' />

        <span className='f-14-500 text-GRAY_1000'>Artifact Title</span>
      </div>

      <div className='flex justify-center items-center gap-x-3.5 p-4 min-w-max'>
        <TabsList className='gap-x-1'>
          <TabsTrigger value='tab-1' className='p-1.5 shrink-0 flex items-center justify-center h-6 w-[26px]'>
            <SvgSpriteLoader id='coins-stacked-04' height={14} width={14} color={COLORS.GRAY_1000} />
          </TabsTrigger>
          <TabsTrigger value='tab-2' className='p-1.5 shrink-0 flex items-center justify-center h-6 w-[26px]'>
            <SvgSpriteLoader id='file-02' height={14} width={14} color={COLORS.GRAY_1000} className='shrink-0' />
          </TabsTrigger>
        </TabsList>

        <SvgSpriteLoader
          id={isExpanded ? 'minimize-01' : 'expand-01'}
          height={12}
          width={12}
          color={COLORS.GRAY_1000}
          onClick={onExpand}
          className='cursor-pointer animate-opacity transition-all duration-300'
          key={isExpanded ? 'minimize-01' : 'expand-01'}
        />

        <SvgSpriteLoader
          id='x-close'
          height={16}
          width={16}
          color={COLORS.GRAY_1000}
          onClick={onClose}
          className='cursor-pointer'
        />
      </div>
    </div>
  );
};

export default ArtifactTopbar;
