'use client';

import { motion } from 'framer-motion';
import { useAppSelector } from 'hooks/toolkit';
import { usePathname } from 'next/navigation';
import { RootState } from 'store';
import { PagesAndProcessesProvider } from '@/contexts/PagesAndProcessesContext';
import { isSettingsPage, shouldShowTopbar } from '@/utils/topbarVisibility';
import Sidebar from 'components/layouts/dashboard-layout/sidebar';
import SettingsSidebar from 'components/layouts/dashboard-layout/sidebar/SettingsSidebar';
import Topbar from 'components/layouts/dashboard-layout/topbar/TopBar';
import LayoutChildren from 'components/layouts/LayoutChildren';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const { isSidebarOpen } = useAppSelector((state: RootState) => state.layoutConfig);

  const showTopbar = shouldShowTopbar(pathname);
  const isSettings = isSettingsPage(pathname);

  return (
    <PagesAndProcessesProvider>
      <div className='bg-BACKGROUND_GRAY_1 relative'>
        <div className='relative flex h-full w-full min-w-[768px]'>
          {isSettings ? <SettingsSidebar /> : <Sidebar />}
          <motion.div
            initial={false}
            animate={{
              marginLeft: isSidebarOpen ? 240 : 0,
            }}
            transition={{
              duration: 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
            className='flex h-full w-full grow flex-col'
          >
            {showTopbar && (
              <nav className='sticky top-0 z-10'>
                <Topbar />
              </nav>
            )}
            <LayoutChildren>{children}</LayoutChildren>
          </motion.div>
        </div>
      </div>
    </PagesAndProcessesProvider>
  );
}
