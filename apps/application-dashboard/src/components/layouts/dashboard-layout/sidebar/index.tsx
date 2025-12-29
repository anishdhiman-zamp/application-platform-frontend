'use client';

import { memo } from 'react';
import { ZAMP_ICON } from 'constants/icons';
import { ROUTES_PATH } from 'constants/routeConfig';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { RootState } from 'store';
import { toggleSidebar } from 'store/slices/layout-configs';
import { cn } from 'utils/common';
import FlexAlignRight from '@/assets/Icons/FlexAlignRight';
import { COLORS } from '@/constants/colors';
import { SETTINGS_ID } from '@/constants/sidebar.constants';
import { useFilteredSidebarItems } from '@/hooks/useFilteredSidebarItems';
import OrgSwitcher from 'components/layouts/dashboard-layout/components/OrgSwitcher';
import SidebarTab from 'components/layouts/dashboard-layout/components/SidebarTab';
import SidebarDynamicNavItems from 'components/layouts/dashboard-layout/sidebar/SidebarDynamicNavItems';

const Sidebar = () => {
  const { isSidebarOpen, lastVisitedSettingsRoute } = useAppSelector((state: RootState) => state.layoutConfig);
  const dispatch = useAppDispatch();
  const params = useParams() as { pageId?: string; processId?: string };
  const pathname = usePathname();

  const { filteredItems: sidebarItems } = useFilteredSidebarItems();

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  const isSidebarItemSelected = (
    itemPath: string,
    pathname: string | null,
    params: { pageId?: string; processId?: string },
  ): boolean => {
    return !params?.pageId && !params?.processId && (pathname?.includes(itemPath) ?? false);
  };

  return (
    <>
      {/* Toggle button in top-left corner - only visible when sidebar is closed */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            onClick={handleSidebarToggle}
            className='absolute top-0 left-0 z-30 flex h-12 w-12 items-center justify-center bg-transparent'
            aria-label='Toggle sidebar'
          >
            <FlexAlignRight height={16} width={16} color={COLORS.GRAY_700} className='cursor-pointer' />
          </motion.button>
        )}
      </AnimatePresence>
      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : -240,
        }}
        transition={{
          duration: 0.15,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{
          willChange: 'transform',
        }}
        className={cn(
          'bg-BACKGROUND_GRAY_1 fixed top-0 left-0 z-20 flex h-screen w-60 flex-col overflow-hidden',
          !isSidebarOpen && 'pointer-events-none',
        )}
      >
        <div className='text-GRAY_700 border-GRAY_400 flex h-12 items-center justify-between px-4 py-4'>
          <div className='flex-1'>
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
          {sidebarItems.map((item) => {
            const itemPath = item.id === SETTINGS_ID ? lastVisitedSettingsRoute || ROUTES_PATH.SETTINGS : item.path;

            return (
              <Link prefetch href={itemPath} key={item.label} className='cursor-pointer'>
                <SidebarTab
                  key={item.label}
                  name={item.label}
                  iconComponent={item.iconComponent}
                  isSelected={isSidebarItemSelected(item.path, pathname, params)}
                />
              </Link>
            );
          })}
        </div>

        <SidebarDynamicNavItems params={params} />

        <div className='mt-auto'>
          <OrgSwitcher isSidebarOpen={isSidebarOpen} />
        </div>
      </motion.aside>
    </>
  );
};

export default memo(Sidebar);
