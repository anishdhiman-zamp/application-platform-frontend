'use client';

import { memo } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ZAMP_ICON } from 'constants/icons';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import { ArrowLeft, Loader2, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RootState } from 'store';
import { toggleSidebar } from 'store/slices/layout-configs';
import FlexAlignRight from '@/assets/Icons/FlexAlignRight';
import { COLORS } from '@/constants/colors';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { SETTINGS_TABS } from '@/constants/sidebar.constants';
import { useLogout } from '@/hooks/useLogout';
import SidebarTab from 'components/layouts/dashboard-layout/components/SidebarTab';

const SettingsSidebar = () => {
  const { isSidebarOpen, lastVisitedRouteBeforeSettings } = useAppSelector((state: RootState) => state.layoutConfig);
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <>
      {/* Toggle button in top-left corner - only visible when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={handleSidebarToggle}
          className='bg-BACKGROUND_GRAY_1 border-GRAY_400 hover:bg-GRAY_100 absolute top-0 left-0 z-30 flex h-12 w-12 items-center justify-center border-r border-b transition-colors'
          aria-label='Toggle sidebar'
        >
          <FlexAlignRight height={16} width={16} color={COLORS.GRAY_700} className='cursor-pointer' />
        </button>
      )}

      <div className='bg-BACKGROUND_GRAY_1 relative z-20 flex transition-all'>
        <div className={cn('relative transition-all', isSidebarOpen ? 'w-60' : 'invisible w-0 opacity-0')}>
          <div className='flex h-full w-60 flex-col'>
            {/* Logo and Toggle Button Header */}
            <div className='text-GRAY_700 border-GRAY_400 flex h-12 items-center justify-between border-b px-4 py-4'>
              <div className={cn('flex-1 transition-all', isSidebarOpen ? 'w-[204px] opacity-100' : 'w-0 opacity-0')}>
                <Image
                  width={16}
                  height={16}
                  alt='zamp logo'
                  className='w-4 cursor-pointer align-middle'
                  src={ZAMP_ICON}
                  priority
                />
              </div>
              <div className='flex-shrink-0'>
                <FlexAlignRight
                  height={16}
                  width={16}
                  color={COLORS.GRAY_700}
                  className='cursor-pointer'
                  onClick={handleSidebarToggle}
                />
              </div>
            </div>
            {/* Back button */}
            <div className='px-2 py-5'>
              <div className='text-GRAY_700 flex w-full items-center gap-2.5'>
                <Link
                  prefetch
                  href={lastVisitedRouteBeforeSettings || ROUTES_PATH.PROCESSES}
                  className='cursor-pointer'
                >
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
              <Button
                id='logout-btn'
                variant='ghost'
                size='small'
                onClick={logout}
                disabled={isLoggingOut}
                className={cn('text-GRAY_700 hover:text-GRAY_700 w-full justify-start gap-2.5 rounded-md px-2', {
                  'cursor-not-allowed': isLoggingOut,
                })}
              >
                <LogOut width={14} height={14} />
                <span className='f-13-500 flex-1 text-left select-none'>Logout</span>
                {isLoggingOut && <Loader2 className='w-4 animate-spin' />}
              </Button>
            </div>
          </div>
        </div>
        <div className='bg-GRAY_400 absolute right-0 h-[calc(100vh-64px)] w-[1px] translate-x-[1px] translate-y-4' />
      </div>
    </>
  );
};

export default memo(SettingsSidebar);
