'use client';

import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from 'utils/common';
import { ICON_SPRITE_TYPES } from '@/constants/icons';

interface ProcessNavTabProps {
  label: string;
  processId: string;
  isSelected?: boolean;
}

const ProcessNavTab = ({ label, isSelected }: ProcessNavTabProps) => {
  return (
    <div
      className={cn(
        'text-GRAY_900 f-13-500 hover:bg-GRAY_20 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 select-none',
        isSelected ? 'bg-GRAY_100 text-GRAY_1000' : '',
      )}
    >
      <SvgSpriteLoader
        iconCategory={ICON_SPRITE_TYPES.GENERAL}
        id='activity'
        height={16}
        width={16}
        className='w-[14px] cursor-pointer align-middle'
      />
      <div>{label}</div>
    </div>
  );
};

export default ProcessNavTab;
