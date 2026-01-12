'use client';

import { FC } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import ChatSidebarInner from '@/modules/macs/components/chat/ChatSidebarInner';
import { useChatSidebarState } from '@/modules/macs/hooks/useChatSidebarState';

interface ChatSidebarProps {
  className?: string;
}

const ChatSidebar: FC<ChatSidebarProps> = ({ className }) => {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams?.get('s') ?? null;

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

  return (
    <AnimatePresence>
      {isChatSidebarOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 400, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            'border-GRAY_400 flex h-full flex-shrink-0 flex-col overflow-hidden border-r bg-white',
            className,
          )}
        >
          <ChatSidebarInner
            key={chatKey}
            conversationId={conversationId}
            setConversationId={setConversationId}
            setChatTitle={setChatTitle}
            startNewChat={startNewChat}
            handleClose={handleClose}
            chatTitle={chatTitle}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatSidebar;
