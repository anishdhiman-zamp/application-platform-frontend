'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import ChatSidebar from 'modules/pace/components/layout/chat-sidebar/ChatSidebar';
import { CHAT_SIDEBAR_STATE } from 'modules/pace/pace.types';
import { usePathname } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import FilesPanel from '@/modules/pace/components/files-panel/FilesPanel';
import FilesPanelResizeHandle from '@/modules/pace/components/layout/FilesPanelResizeHandle';
import PaneHost from '@/modules/pace/components/layout/PaneHost';
import SidebarResizeHandle from '@/modules/pace/components/layout/SidebarResizeHandle';
import UploadProgressToast from '@/modules/pace/components/progress-toast/UploadProgressToast';
import { useFileUploadContext } from '@/modules/pace/context/FileUploadContext';
import { usePaceContext } from '@/modules/pace/pace.context';

interface PaceLayoutContentProps {
  children: ReactNode;
}

const PaceLayoutContent: FC<PaceLayoutContentProps> = ({ children }) => {
  const pathname = usePathname();
  const isOnChatSurface = pathname === ROUTES_PATH.CHAT;

  const { uploadState, cancelUpload } = useFileUploadContext();
  const {
    chatSidebarState,
    isFilesPanelResizing,
    isSidebarResizing,
    isTreeColumnResizing,
    hasActivePanelTab,
    filesPanelOpen,
    isFilesPanelExpanded,
  } = usePaceContext();

  const isResizing = isFilesPanelResizing || isSidebarResizing || isTreeColumnResizing;

  const isExpanded = chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED;
  const isSidebar = chatSidebarState === CHAT_SIDEBAR_STATE.SIDEBAR;
  const isFilesPanelFullWidth = filesPanelOpen && isFilesPanelExpanded;
  const isMainHidden = isOnChatSurface && (isExpanded || hasActivePanelTab || isFilesPanelFullWidth);

  return (
    <div className='bg-BG_GRAY_2 relative flex h-full w-full overflow-hidden overscroll-none'>
      {isResizing && <div className='absolute inset-0 z-50 cursor-col-resize' />}
      <div className='flex min-h-0 min-w-0 flex-1 overflow-hidden'>
        {isOnChatSurface && <ChatSidebar />}
        {isOnChatSurface && isSidebar && !hasActivePanelTab && !isFilesPanelFullWidth && <SidebarResizeHandle />}
        <main
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col',
            isMainHidden && 'pointer-events-none invisible w-0 min-w-0 flex-none overflow-hidden',
          )}
          aria-hidden={isMainHidden}
        >
          <section
            className={cn(
              'bg-BG_WHITE flex min-h-0 w-full flex-1 flex-col overflow-hidden',
              isOnChatSurface && 'border-border border-l',
            )}
          >
            <PaneHost>{children}</PaneHost>
          </section>
        </main>
        {isOnChatSurface && filesPanelOpen && !isFilesPanelExpanded && <FilesPanelResizeHandle />}
        {isOnChatSurface && <FilesPanel />}
      </div>
      <UploadProgressToast uploadState={uploadState} onCancel={cancelUpload} />
    </div>
  );
};

export default PaceLayoutContent;
