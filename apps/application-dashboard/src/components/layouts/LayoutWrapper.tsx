'use client';

import { Suspense } from 'react';
import VoiceChatFloatingIndicator from '@/components/common/VoiceChatFloatingIndicator';
import UrlToTabSync from '@/components/layouts/app-sidebar/UrlToTabSync';
import { PendingDatasetProvider } from '@/context/pendingDataset.context';
import { ProcessesProvider } from '@/contexts/ProcessesContext';
import { VoiceChatProvider } from '@/contexts/VoiceChatContext';
import useGlobalShortcuts from '@/hooks/useGlobalShortcuts';
// eslint-disable-next-line import/no-named-as-default
import usePostHogHeartbeat from '@/hooks/usePostHogHeartbeat';
import Sidebar from '@/modules/pace/components/layout/sidebar/Sidebar';
import { FileTreeNavigationProvider } from '@/modules/pace/context/FileTreeNavigationContext';
import { FileUploadProvider } from '@/modules/pace/context/FileUploadContext';
import { FileViewerProvider } from '@/modules/pace/context/FileViewerContext';
import { PaceProvider } from '@/modules/pace/pace.context';
import '@/app/(authenticated)/resources';

const GlobalShortcuts = () => {
  useGlobalShortcuts();

  return null;
};

interface LayoutWrapperProps {
  children: React.ReactNode;
  initialNavSidebarExpanded: boolean;
}

export default function LayoutWrapper({ children, initialNavSidebarExpanded }: LayoutWrapperProps) {
  usePostHogHeartbeat();

  return (
    <PaceProvider initialNavSidebarExpanded={initialNavSidebarExpanded}>
      <FileViewerProvider>
        <FileTreeNavigationProvider>
          <FileUploadProvider>
            <ProcessesProvider>
              <PendingDatasetProvider>
                <VoiceChatProvider>
                  <Suspense fallback={null}>
                    <GlobalShortcuts />
                  </Suspense>
                  <Suspense fallback={null}>
                    <UrlToTabSync />
                  </Suspense>
                  <div className='bg-BG_GRAY_2 flex h-screen w-full min-w-[768px] overflow-hidden'>
                    <Sidebar />
                    <div className='relative min-h-0 min-w-0 flex-1 overflow-hidden'>{children}</div>
                  </div>
                  <VoiceChatFloatingIndicator />
                </VoiceChatProvider>
              </PendingDatasetProvider>
            </ProcessesProvider>
          </FileUploadProvider>
        </FileTreeNavigationProvider>
      </FileViewerProvider>
    </PaceProvider>
  );
}
