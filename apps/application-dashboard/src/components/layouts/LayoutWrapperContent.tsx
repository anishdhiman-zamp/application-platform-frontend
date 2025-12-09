'use client';

import { FC, ReactNode } from 'react';
import { useSettingsRouteTracking } from '@/hooks/useSettingsRouteTracking';
import { cn } from '@/utils/common';
import SettingsSidebar from 'components/layouts/dashboard-layout/SettingsSidebar';
import Sidebar from 'components/layouts/dashboard-layout/Sidebar';
import Topbar from 'components/layouts/dashboard-layout/topbar/TopBar';
import LayoutChildren from 'components/layouts/LayoutChildren';

const LayoutWrapperContent: FC<{ children: ReactNode }> = ({ children }) => {
  const { isSettingsPage } = useSettingsRouteTracking();

  return (
    <div className='bg-BACKGROUND_GRAY_1 relative'>
      {!isSettingsPage && <Topbar />}
      <div
        className={cn('relative flex h-full w-full min-w-[768px]', {
          'h-[calc(100vh-48px)]': !isSettingsPage,
        })}
      >
        {isSettingsPage ? <SettingsSidebar /> : <Sidebar />}
        <LayoutChildren>{children}</LayoutChildren>
      </div>
    </div>
  );
};

export default LayoutWrapperContent;
