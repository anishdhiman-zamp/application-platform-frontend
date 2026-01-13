'use client';

import { FC, useCallback } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { SIDEBAR_CONVERSATION_ID_PARAM, SIDEBAR_WIDTH } from 'modules/pace/pace.constants';
import { useSearchParams } from 'next/navigation';
import { useChatSidebarContext } from '@/modules/pace/chatsidebar.context';
import ChatSidebarInner from '@/modules/pace/components/layout/ChatSidebarInner';
import { useChatSidebarState } from '@/modules/pace/hooks/useChatSidebarState';

interface ChatSidebarProps {
  className?: string;
}

const ChatSidebar: FC<ChatSidebarProps> = ({ className }) => {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams?.get(SIDEBAR_CONVERSATION_ID_PARAM) ?? null;

  const { isExpanded, toggleExpand, resetExpand } = useChatSidebarContext();

  const {
    isChatSidebarOpen,
    chatTitle,
    setChatTitle,
    conversationId,
    setConversationId,
    chatKey,
    startNewChat,
    handleClose,
  } = useChatSidebarState({ initialConversationId });

  const handleCloseWithReset = useCallback(() => {
    resetExpand();
    handleClose();
  }, [resetExpand, handleClose]);

  return (
    <AnimatePresence>
      {isChatSidebarOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: isExpanded ? '100%' : SIDEBAR_WIDTH, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            'border-GRAY_400 flex h-full flex-shrink-0 flex-col overflow-hidden border-r bg-white',
            isExpanded && 'absolute inset-0 z-50 border-r-0',
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
            isExpanded={isExpanded}
            onToggleExpand={toggleExpand}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatSidebar;
