'use client';

import { memo } from 'react';
import { ZAMP_ICON } from 'constants/icons';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { RootState } from 'store';
import { toggleSidebar } from 'store/slices/layout-configs';
import { cn } from 'utils/common';
import FlexAlignRight from '@/assets/Icons/FlexAlignRight';
import { COLORS } from '@/constants/colors';
import { SETTINGS_ID, SIDEBAR_ITEMS } from '@/constants/sidebar.constants';
import { useHash } from '@/hooks/useHash';
import OrgSwitcher from 'components/layouts/dashboard-layout/components/OrgSwitcher';
import SidebarTab from 'components/layouts/dashboard-layout/components/SidebarTab';
import SidebarDynamicNavItems from 'components/layouts/dashboard-layout/sidebar/SidebarDynamicNavItems';

const Sidebar = () => {
  const { isSidebarOpen, lastVisitedSettingsRoute } = useAppSelector((state: RootState) => state.layoutConfig);
  const dispatch = useAppDispatch();
  const params = useParams() as { pageId?: string; processId?: string };
  const pathTrim = usePathname();
  const hash = useHash();
  const pathname = pathTrim + hash;

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <>
      {/* Toggle button in top-left corner - only visible when sidebar is closed */}

      {!isSidebarOpen && (
        <button
          onClick={handleSidebarToggle}
          className='bg-BACKGROUND_GRAY_1 absolute top-0 left-0 z-30 flex h-12 w-12 items-center justify-center transition-colors'
          aria-label='Toggle sidebar'
        >
          <FlexAlignRight height={16} width={16} color={COLORS.GRAY_700} className='cursor-pointer' />
        </button>
      )}
      <div
        className={cn(
          'bg-BACKGROUND_GRAY_1 relative z-20 flex h-screen flex-col transition-all',
          isSidebarOpen ? 'w-60' : 'invisible w-0 opacity-0',
        )}
      >
        <div className='text-GRAY_700 border-GRAY_400 flex h-12 items-center justify-between px-4 py-4'>
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
        <div className='border-GRAY_400 border-b px-2 pb-4'>
          {SIDEBAR_ITEMS.map((item) => {
            const itemPath = item.id === SETTINGS_ID ? lastVisitedSettingsRoute || ROUTES_PATH.SETTINGS : item.path;

            return (
              <Link prefetch href={itemPath} key={item.label} className='cursor-pointer'>
                <SidebarTab
                  key={item.label}
                  name={item.label}
                  iconComponent={item.iconComponent}
                  isSelected={!params?.pageId && !params?.processId && pathname?.includes(item?.path)}
                />
              </Link>
            );
          })}
        </div>

        <SidebarDynamicNavItems params={params} />

        <div className='mt-auto'>
          <OrgSwitcher isSidebarOpen={isSidebarOpen} />
        </div>
      </div>
    </>
  );
};

export default memo(Sidebar);
