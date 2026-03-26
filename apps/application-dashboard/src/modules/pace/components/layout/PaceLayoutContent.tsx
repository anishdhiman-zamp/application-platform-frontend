'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'framer-motion';
import ChatSidebar from 'modules/pace/components/layout/chat-sidebar/ChatSidebar';
import PaceNavbar from 'modules/pace/components/layout/PaceNavbar';
import { FILES_PANEL_SPACER_TRANSITION } from 'modules/pace/pace.animations';
import { CHAT_SIDEBAR_STATE } from 'modules/pace/pace.types';
import FilesPanel from '@/modules/pace/components/files-panel/FilesPanel';
import SidebarResizeHandle from '@/modules/pace/components/layout/SidebarResizeHandle';
import UploadProgressToast from '@/modules/pace/components/progress-toast/UploadProgressToast';
import { FileUploadProvider, useFileUploadContext } from '@/modules/pace/context/FileUploadContext';
import { FILES_PANEL_WIDTH } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

interface PaceLayoutContentProps {
  children: ReactNode;
}

const PaceLayoutContentInner: FC<PaceLayoutContentProps> = ({ children }) => {
  const { uploadState, cancelUpload } = useFileUploadContext();
  const { chatSidebarState, filesPanelOpen, filesPanelPinned } = usePaceContext();

  const isExpanded = chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED;
  const isCollapsed = chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED;
  const isSidebar = chatSidebarState === CHAT_SIDEBAR_STATE.SIDEBAR;
  const isPinned = filesPanelOpen && filesPanelPinned;

  return (
    <div className='bg-BG_GRAY_2 relative flex h-full w-full flex-col overflow-hidden overscroll-none'>
      <PaceNavbar />
      <div className='flex min-h-0 flex-1 overflow-hidden px-2'>
        <ChatSidebar />
        {isSidebar && <SidebarResizeHandle />}
        {!isExpanded && (
          <main className={cn('flex min-h-0 min-w-0 flex-1 flex-col', !isCollapsed && !isSidebar && 'ml-2')}>
            <section className='border-border bg-BG_WHITE flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-t-xl border'>
              {children}
            </section>
          </main>
        )}
        <motion.div
          initial={false}
          animate={{ width: isPinned ? FILES_PANEL_WIDTH + 8 : 0 }}
          transition={FILES_PANEL_SPACER_TRANSITION}
          className='shrink-0'
        />
      </div>
      <FilesPanel />
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
