'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, TooltipV2 } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronsUpDown, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/layouts/dashboard-layout/components/LogoutButton';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import { PACE_SETTINGS_TABS } from '@/modules/pace/pace.constants';
import type { RootState } from '@/store';
import { SIDE_OPTIONS } from '@/types/commonTypes';
import { getFromSessionStorage, SESSION_STORAGE_KEYS } from '@/utils/sessionstorage';

interface SidebarFooterProps {
  isExpanded: boolean;
}

const VALID_SETTINGS_PATHS = new Set(PACE_SETTINGS_TABS.map((tab) => tab.path));

const resolveSettingsTarget = (): string => {
  const lastTab = getFromSessionStorage(SESSION_STORAGE_KEYS.PACE_SETTINGS_LAST_TAB);

  return lastTab && VALID_SETTINGS_PATHS.has(lastTab) ? lastTab : ROUTES_PATH.CHAT_SETTINGS_GENERAL;
};

const SidebarFooter = ({ isExpanded }: SidebarFooterProps) => {
  const router = useRouter();
  const user = useAppSelector((state: RootState) => state?.user?.user);
  const userName = user?.user_name ?? user?.username ?? 'You';
  const initial = userName.charAt(0).toUpperCase();

  const handleSettingsClick = () => {
    router.push(resolveSettingsTarget());
  };

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
        <DropdownMenuItem
          onSelect={handleSettingsClick}
          className='hover:bg-GRAY_100 text-GRAY_700 f-12-450 h-8 gap-2 rounded-md px-1 py-1'
        >
          <Settings size={14} />
          <span className='flex-1 text-left'>Settings</span>
        </DropdownMenuItem>
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SidebarFooter;
