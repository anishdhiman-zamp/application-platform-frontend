'use client';

import { useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { X } from 'lucide-react';
import Link from 'next/link';
import { DYNAMIC_TAB_ICON_MAP } from '@/modules/pace/pace.constants';
import { DynamicTab } from '@/modules/pace/pace.types';

export interface DynamicTabItemProps {
  tab: DynamicTab;
  isActive: boolean;
  onClose: (e: React.MouseEvent, id: string) => void;
  tabRef?: (el: HTMLAnchorElement | null) => void;
}

const DynamicTabItem = ({ tab, isActive, onClose, tabRef }: DynamicTabItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = DYNAMIC_TAB_ICON_MAP[tab.type];

  return (
    <Link
      ref={tabRef}
      href={tab.path}
      className={cn(
        'group relative flex h-7 w-[172px] shrink-0 cursor-pointer items-center gap-x-2 rounded-[8px] border p-2 transition-all duration-150 ease-in-out',
        isActive
          ? 'border-GRAY_300 text-GRAY_1000 bg-white'
          : 'text-GRAY_700 hover:text-GRAY_900 border-transparent hover:bg-white',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Icon size={14} className='shrink-0' />
      <span className='f-11-500 min-w-0 flex-1 truncate'>{tab.name}</span>
      {isHovered && (
        <button
          onClick={(e) => onClose(e, tab.id)}
          className='hover:bg-GRAY_200 ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded'
        >
          <X size={12} className='text-GRAY_700' />
        </button>
      )}
    </Link>
  );
};

export default DynamicTabItem;
