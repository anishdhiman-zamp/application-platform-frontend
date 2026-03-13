'use client';

import { FC, ReactNode } from 'react';
import ChatSidebar from 'modules/pace/components/layout/chat-sidebar/ChatSidebar';
import PaceNavbar from 'modules/pace/components/layout/PaceNavbar';
import UploadProgressToast from '@/modules/pace/components/progress-toast/UploadProgressToast';
import { FileUploadProvider, useFileUploadContext } from '@/modules/pace/context/FileUploadContext';

interface PaceLayoutContentProps {
  children: ReactNode;
}

const PaceLayoutContentInner: FC<PaceLayoutContentProps> = ({ children }) => {
  const { uploadState, cancelUpload } = useFileUploadContext();

  return (
    <div className='bg-BG_GRAY_2 flex h-full w-full overflow-hidden overscroll-none'>
      <ChatSidebar />
      <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        <PaceNavbar />
        <main className='flex min-h-0 flex-1 flex-col px-2'>
          <section className='shadow-chat-section border-border bg-BG_WHITE flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-t-xl border'>
            {children}
          </section>
        </main>
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
