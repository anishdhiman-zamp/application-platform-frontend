'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, TooltipV2 } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronsUpDown } from 'lucide-react';
import LogoutButton from '@/components/layouts/dashboard-layout/components/LogoutButton';
import { useAppSelector } from '@/hooks/toolkit';
import type { RootState } from '@/store';
import { SIDE_OPTIONS } from '@/types/commonTypes';

interface SidebarFooterProps {
  isExpanded: boolean;
}

const SidebarFooter = ({ isExpanded }: SidebarFooterProps) => {
  const user = useAppSelector((state: RootState) => state?.user?.user);
  const userName = user?.user_name ?? user?.username ?? 'You';
  const initial = userName.charAt(0).toUpperCase();

  const trigger = (
    <button
      type='button'
      className={cn(
        'border-GRAY_300 hover:bg-accent flex cursor-pointer items-center border-t bg-transparent transition-colors',
        isExpanded ? 'h-12 w-full gap-x-2 px-3' : 'h-12 w-full justify-center px-1.5',
      )}
      aria-label='Account menu'
    >
      <div className='bg-BG_GRAY_3 text-GRAY_900 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold'>
        {initial}
      </div>
      {isExpanded && (
        <>
          <span className='text-GRAY_900 flex-1 truncate text-left text-sm font-medium'>{userName}</span>
          <ChevronsUpDown size={14} className='text-GRAY_500 shrink-0' />
        </>
      )}
    </button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isExpanded ? (
          trigger
        ) : (
          <TooltipV2 tooltipBody={userName} side={SIDE_OPTIONS.RIGHT} asChildTrigger>
            {trigger}
          </TooltipV2>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' side='top' className='bg-BG_WHITE z-9999 w-56 p-1'>
        <div className='px-2 py-1.5'>
          <p className='text-GRAY_900 truncate text-sm font-medium'>{userName}</p>
          {user?.user_email && <p className='text-GRAY_600 truncate text-xs'>{user.user_email}</p>}
        </div>
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SidebarFooter;
