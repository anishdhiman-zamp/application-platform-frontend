'use client';

import { FC, useCallback, useEffect } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  SIDEBAR_CONVERSATION_ID_PARAM,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_WIDTH,
} from 'modules/pace/pace.constants';
import { ROUTES_PATH } from '@/constants/routeConfig';
import ChatSidebarInner from '@/modules/pace/components/layout/chat-sidebar/ChatSidebarInner';
import { useChatSidebarState } from '@/modules/pace/hooks/useChatSidebarState';
import { useResizable } from '@/modules/pace/hooks/useResizable';
import { useSyncedPathname, useSyncedUrlParam } from '@/modules/pace/hooks/useSyncedSearchParam';
import { usePaceContext } from '@/modules/pace/pace.context';

interface ChatSidebarProps {
  className?: string;
}

const ChatSidebar: FC<ChatSidebarProps> = ({ className }) => {
  const initialConversationId = useSyncedUrlParam(SIDEBAR_CONVERSATION_ID_PARAM);
  const pathname = useSyncedPathname();
  const { setIsPaceSidebarOpen } = usePaceContext();

  const {
    width: sidebarWidth,
    isResizing,
    handleMouseDown,
  } = useResizable({
    initialWidth: SIDEBAR_WIDTH,
    minWidth: SIDEBAR_MIN_WIDTH,
    maxWidth: SIDEBAR_MAX_WIDTH,
  });

  const {
    isPaceSidebarOpen,
    chatTitle,
    setChatTitle,
    conversationId,
    setConversationId,
    chatKey,
    startNewChat,
    handleClose,
  } = useChatSidebarState({ initialConversationId });

  const handleCloseWithReset = useCallback(() => {
    handleClose();
  }, [handleClose]);

  useEffect(() => {
    if (pathname === ROUTES_PATH.CHAT) {
      setIsPaceSidebarOpen(false);
    }
  }, [pathname, setIsPaceSidebarOpen]);

  return (
    <AnimatePresence>
      {isPaceSidebarOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: sidebarWidth, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={isResizing ? { duration: 0 } : { duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            'border-border bg-BG_WHITE relative flex h-full shrink-0 flex-col overflow-hidden border-r',
            className,
          )}
        >
          <ChatSidebarInner
            key={chatKey}
            conversationId={conversationId}
            setConversationId={setConversationId}
            setChatTitle={setChatTitle}
            startNewChat={startNewChat}
            handleClose={handleCloseWithReset}
            chatTitle={chatTitle}
          />
          <div
            onMouseDown={handleMouseDown}
            className={cn(
              'absolute top-0 right-0 z-10 h-full w-[2px] cursor-col-resize hover:bg-black/50',
              isResizing && 'bg-GRAY_700',
            )}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatSidebar;
