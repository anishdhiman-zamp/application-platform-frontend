'use client';

import type { ReactNode } from 'react';
import { TooltipV2 } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { SIDE_OPTIONS } from '@/types/commonTypes';

interface SidebarRowProps {
  icon: ReactNode;
  label: string;
  isExpanded: boolean;
  isActive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  trailing?: ReactNode;
  asLink?: boolean;
  href?: string;
}

const SidebarRow = ({ icon, label, isExpanded, isActive, onClick, trailing }: SidebarRowProps) => {
  const className = cn(
    'flex cursor-pointer items-center rounded-lg border-[0.75px] border-transparent text-GRAY_700 hover:text-GRAY_900 hover:bg-accent transition-colors',
    isExpanded ? 'h-8 w-full gap-x-2 px-2 text-sm font-medium' : 'h-8 w-8 justify-center p-[7px]',
    isActive && 'border-GRAY_500 text-GRAY_900 hover:text-GRAY_900 shadow-tab-shadow bg-BG_WHITE hover:bg-BG_WHITE',
  );

  const content = (
    <button type='button' className={className} onClick={onClick}>
      <span className='shrink-0'>{icon}</span>
      {isExpanded && <span className='flex-1 truncate text-left'>{label}</span>}
      {isExpanded && trailing}
    </button>
  );

  if (isExpanded) return content;

  return (
    <TooltipV2 tooltipBody={label} side={SIDE_OPTIONS.RIGHT} asChildTrigger>
      {content}
    </TooltipV2>
  );
};

export default SidebarRow;
