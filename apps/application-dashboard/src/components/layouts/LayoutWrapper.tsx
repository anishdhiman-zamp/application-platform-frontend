'use client';

import { FC, ReactNode } from 'react';
import { useSettingsRouteTracking } from '@/hooks/useSettingsRouteTracking';
import { cn } from '@/utils/common';
import LayoutChildren from 'components/layouts/LayoutChildren';

const LayoutWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const { isSettingsPage } = useSettingsRouteTracking();

  return (
    <div className='bg-BACKGROUND_GRAY_1 relative'>
      {/* {!isSettingsPage && (
        <Suspense>
          <Topbar />
        </Suspense>
      )} */}
      <div
        className={cn('relative flex h-full w-full min-w-[768px]', {
          'h-[calc(100vh-48px)]': !isSettingsPage,
        })}
      >
        {/* <Suspense>{isSettingsPage ? <SettingsSidebar /> : <Sidebar />}</Suspense> */}
        <LayoutChildren>{children}</LayoutChildren>
      </div>
    </div>
  );
};

export default LayoutWrapper;
