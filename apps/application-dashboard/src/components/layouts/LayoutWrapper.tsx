'use client';

import { FC, ReactNode, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/common';
import Sidebar from 'components/layouts/dashboard-layout/Sidebar';
import Topbar from 'components/layouts/dashboard-layout/topbar/TopBar';
import { getLayoutConfig } from 'components/layouts/layout.config';
import LayoutChildren from 'components/layouts/LayoutChildren';

const LayoutWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname() ?? '/';
  const { showTopbar, showSidebar } = getLayoutConfig(pathname);

  return (
    <div className='bg-BACKGROUND_GRAY_1 relative'>
      {showTopbar && (
        <Suspense>
          <Topbar />
        </Suspense>
      )}

      <div className={cn('relative flex w-full min-w-[768px]', showTopbar ? 'h-[calc(100vh-48px)]' : 'h-screen')}>
        {showSidebar && (
          <Suspense>
            <Sidebar />
          </Suspense>
        )}
        <LayoutChildren showTopbar={showTopbar} showSidebar={showSidebar}>
          {children}
        </LayoutChildren>
      </div>
    </div>
  );
};

export default LayoutWrapper;
