'use client';

import { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { X } from 'lucide-react';
import Link from 'next/link';
import TooltipV2 from '@/components/common/TooltipV2';
import { DYNAMIC_TAB_ICON_MAP } from '@/modules/pace/pace.constants';
import { DynamicTab } from '@/modules/pace/pace.types';
import { SIDE_OPTIONS } from '@/types/commonTypes';

export interface DynamicTabItemProps {
  tab: DynamicTab;
  isActive: boolean;
  onClose: (e: React.MouseEvent, id: string) => void;
}

const DynamicTabItem = ({ tab, isActive, onClose }: DynamicTabItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = DYNAMIC_TAB_ICON_MAP[tab.type];

  return (
    <TooltipV2 tooltipBody={tab.name} side={SIDE_OPTIONS.BOTTOM} delayDuration={300} asChildTrigger>
      <Link
        href={tab.path}
        className={cn(
          'group relative flex h-[30px] max-w-[172px] min-w-[60px] flex-1 cursor-pointer items-center gap-x-2 rounded-[8px] border p-2 transition-all duration-150 ease-in-out',
          isActive
            ? 'border-GRAY_300 text-GRAY_1000 bg-white hover:bg-white'
            : 'text-GRAY_700 hover:text-GRAY_900 hover:bg-GRAY_100 border-transparent',
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon size={14} className='shrink-0' />
        <span className='f-11-500 min-w-0 flex-1 truncate'>{tab.name}</span>
        {isHovered && (
          <Button
            variant='ghost'
            size='xxsmall'
            onClick={(e) => onClose(e, tab.id)}
            className='ml-0.5 h-4 w-4 shrink-0 p-0'
          >
            <X size={12} className='text-GRAY_700' />
          </Button>
        )}
      </Link>
    </TooltipV2>
  );
};

export default DynamicTabItem;
