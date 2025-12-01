'use client';

import { memo } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { useAppSelector } from 'hooks/toolkit';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RootState } from 'store';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { SETTINGS_TABS } from '@/constants/sidebar.constants';
import { useLogout } from '@/hooks/useLogout';
import SidebarTab from 'components/layouts/dashboard-layout/components/SidebarTab';

const SettingsSidebar = () => {
  const { isSidebarOpen, lastVisitedRouteBeforeSettings } = useAppSelector((state: RootState) => state.layoutConfig);
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();

  return (
    <div className='bg-BACKGROUND_GRAY_1 relative z-20 flex transition-all'>
      <div className={cn('relative transition-all', isSidebarOpen ? 'w-60' : 'invisible w-0 opacity-0')}>
        <div className='flex h-full w-60 flex-col'>
          {/* Back button */}
          <div className='px-2 py-5'>
            <div className='text-GRAY_700 flex w-full items-center gap-2.5 rounded-md px-2.5 transition-colors'>
              <Link prefetch href={lastVisitedRouteBeforeSettings || ROUTES_PATH.PROCESSES} className='cursor-pointer'>
                <ArrowLeft width={16} height={16} />
              </Link>
              <span className='f-13-500 select-none'>Settings</span>
            </div>
          </div>

          {/* Settings tabs */}
          <div className='flex flex-1 flex-col gap-y-[2px] px-2 pt-2 pb-4'>
            {SETTINGS_TABS.map((item) => (
              <Link prefetch href={item.path} key={item.id} className='cursor-pointer'>
                <SidebarTab
                  name={item.label}
                  iconComponent={item.iconComponent}
                  isSelected={pathname?.includes(item.path)}
                />
              </Link>
            ))}
          </div>

          {/* Logout button */}
          <div className='border-GRAY_400 border-t px-2 py-3'>
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className={cn(
                'text-GRAY_700 hover:bg-GRAY_100 flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 transition-colors',
                { 'cursor-not-allowed opacity-50': isLoggingOut },
              )}
            >
              <div className='flex h-4 w-4 items-center justify-center'>
                <SvgSpriteLoader id='log-out-02' size={16} />
              </div>
              <span className='f-13-500 flex-1 text-left select-none'>Logout</span>
              {isLoggingOut && <Loader2 className='w-4 animate-spin' />}
            </button>
          </div>
        </div>
      </div>
      <div className='bg-GRAY_400 absolute right-0 h-[calc(100vh-64px)] w-[1px] translate-x-[1px] translate-y-4' />
    </div>
  );
};

export default memo(SettingsSidebar);
