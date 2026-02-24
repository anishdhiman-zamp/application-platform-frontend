'use client';

import { FC, ReactNode } from 'react';
import { Button } from '@zamp-platform/ui';
import ChatSidebar from 'modules/pace/components/layout/chat-sidebar/ChatSidebar';
import PaceNavbar from 'modules/pace/components/layout/PaceNavbar';
import { usePathname } from 'next/navigation';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { UploadProgressToast } from '@/modules/pace/components/files/UploadProgressToast';
import { useDynamicTabs } from '@/modules/pace/hooks/useDynamicTabs';
import { FileUploadProvider, useFileUploadContext } from '@/modules/pace/hooks/useFileUploadContext';
import { usePaceContext } from '@/modules/pace/pace.context';

interface PaceLayoutContentProps {
  children: ReactNode;
}

const PaceLayoutContentInner: FC<PaceLayoutContentProps> = ({ children }) => {
  const { isPaceSidebarOpen, setIsPaceSidebarOpen } = usePaceContext();
  const { uploadState, cancelUpload } = useFileUploadContext();
  const { isOnAnyDynamicTab } = useDynamicTabs();
  const pathname = usePathname();

  const isHideFloatingButton =
    pathname === ROUTES_PATH.CHAT || pathname?.includes(ROUTES_PATH.CHAT_SETTINGS) || isOnAnyDynamicTab();

  const showFloatingButton = !isPaceSidebarOpen && !isHideFloatingButton;

  return (
    <div className='bg-BG_GRAY_1 flex h-full w-full overflow-hidden'>
      <ChatSidebar />
      <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        <PaceNavbar />
        <main className='flex min-h-0 flex-1 flex-col px-2'>
          <section className='border-GRAY_400 shadow-chat-section flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-t-xl border bg-white'>
            {children}
          </section>
        </main>
        {showFloatingButton && (
          <Button
            onClick={() => setIsPaceSidebarOpen(true)}
            variant='secondary'
            size='icon'
            className='absolute bottom-3 left-5 z-10 h-14 w-14 rounded-full border-none bg-white transition-all [&_svg]:size-10'
          >
            <NewPaceIcons />
          </Button>
        )}
      </div>
      <UploadProgressToast uploadState={uploadState} onCancel={cancelUpload} />
    </div>
  );
};

const PaceLayoutContent: FC<PaceLayoutContentProps> = ({ children }) => {
  return (
    <FileUploadProvider>
      <PaceLayoutContentInner>{children}</PaceLayoutContentInner>
    </FileUploadProvider>
  );
};

export default PaceLayoutContent;
