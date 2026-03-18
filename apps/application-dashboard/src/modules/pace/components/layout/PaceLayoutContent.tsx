'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import ChatSidebar from 'modules/pace/components/layout/chat-sidebar/ChatSidebar';
import PaceNavbar from 'modules/pace/components/layout/PaceNavbar';
import { CHAT_SIDEBAR_STATE } from 'modules/pace/pace.types';
import UploadProgressToast from '@/modules/pace/components/progress-toast/UploadProgressToast';
import { FileUploadProvider, useFileUploadContext } from '@/modules/pace/context/FileUploadContext';
import { usePaceContext } from '@/modules/pace/pace.context';

interface PaceLayoutContentProps {
  children: ReactNode;
}

const PaceLayoutContentInner: FC<PaceLayoutContentProps> = ({ children }) => {
  const { uploadState, cancelUpload } = useFileUploadContext();
  const { chatSidebarState } = usePaceContext();

  const isExpanded = chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED;
  const isCollapsed = chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED;

  return (
    <div className='bg-BG_GRAY_2 flex h-full w-full flex-col overflow-hidden overscroll-none'>
      <PaceNavbar />
      <div className={cn('flex min-h-0 flex-1 overflow-hidden px-2', !isCollapsed && 'gap-x-2')}>
        <ChatSidebar />
        {!isExpanded && (
          <main className='flex min-h-0 flex-1 flex-col'>
            <section className='shadow-chat-section border-border bg-BG_WHITE flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-t-xl border'>
              {children}
            </section>
          </main>
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
