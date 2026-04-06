'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from 'hooks/toolkit';
import { usePathname } from 'next/navigation';
import { RootState } from 'store';
import { getLayoutConfig } from 'utils/layout.config';
import VoiceChatFloatingIndicator from '@/components/common/VoiceChatFloatingIndicator';
import { PendingDatasetProvider } from '@/context/pendingDataset.context';
import { ProcessesProvider } from '@/contexts/ProcessesContext';
import { VoiceChatProvider } from '@/contexts/VoiceChatContext';
import useGlobalShortcuts from '@/hooks/useGlobalShortcuts';
// eslint-disable-next-line import/no-named-as-default
import usePostHogHeartbeat from '@/hooks/usePostHogHeartbeat';
import Sidebar from 'components/layouts/dashboard-layout/sidebar';
import Topbar from 'components/layouts/dashboard-layout/topbar/TopBar';
import LayoutChildren from 'components/layouts/LayoutChildren';
import '@/app/(authenticated)/resources';

/**
 * Initializes global keyboard shortcuts on all authenticated pages.
 * Wrapped in Suspense because useGlobalShortcuts depends on useLogout,
 * which uses useSearchParams() that requires a Suspense boundary.
 */
const GlobalShortcuts = () => {
  useGlobalShortcuts();

  return null;
};

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  usePostHogHeartbeat(); // Add heartbeat tracking
  const pathname = usePathname() || '/';
  const { isSidebarOpen } = useAppSelector((state: RootState) => state.layoutConfig);
  const { showTopbar, showSidebar } = getLayoutConfig(pathname);

  return (
    <ProcessesProvider>
      <PendingDatasetProvider>
        <VoiceChatProvider>
          <Suspense fallback={null}>
            <GlobalShortcuts />
          </Suspense>
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
                  <nav className='bg-BG_GRAY_1 sticky top-0 z-10'>
                    <Topbar />
                  </nav>
                )}
                <LayoutChildren showTopbar={showTopbar}>{children}</LayoutChildren>
              </motion.div>
            </div>
          </div>
          <VoiceChatFloatingIndicator />
        </VoiceChatProvider>
      </PendingDatasetProvider>
    </ProcessesProvider>
  );
}
