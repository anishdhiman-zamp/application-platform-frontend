'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from 'hooks/toolkit';
import { usePathname } from 'next/navigation';
import { RootState } from 'store';
import { getLayoutConfig } from 'utils/layout.config';
import { PagesAndProcessesProvider } from '@/contexts/PagesAndProcessesContext';
import Sidebar from 'components/layouts/dashboard-layout/sidebar';
import Topbar from 'components/layouts/dashboard-layout/topbar/TopBar';
import LayoutChildren from 'components/layouts/LayoutChildren';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname() || '/';
  const { isSidebarOpen } = useAppSelector((state: RootState) => state.layoutConfig);
  const { showTopbar, showSidebar } = getLayoutConfig(pathname);

  return (
    <PagesAndProcessesProvider>
      <div className='relative'>
        <div className='relative flex h-full w-full min-w-[768px]'>
          {showSidebar && <Sidebar />}
          <motion.div
            initial={false}
            animate={{
              marginLeft: isSidebarOpen && showSidebar ? 240 : 0,
            }}
            transition={{
              duration: 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
            className='flex h-full w-full grow flex-col'
          >
            {showTopbar && (
              <nav className='sticky top-0 z-10'>
                <Suspense>
                  <Topbar />
                </Suspense>
              </nav>
            )}
            <LayoutChildren showTopbar={showTopbar}>{children}</LayoutChildren>
          </motion.div>
        </div>
      </div>
    </PagesAndProcessesProvider>
  );
}
