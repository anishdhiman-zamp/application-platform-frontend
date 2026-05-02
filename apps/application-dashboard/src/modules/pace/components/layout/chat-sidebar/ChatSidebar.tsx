'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'framer-motion';
import { getSidebarTransitionDirection, getSidebarTransitions, NO_ANIMATION } from 'modules/pace/pace.animations';
import { SIDEBAR_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { CHAT_SIDEBAR_STATE } from 'modules/pace/pace.types';
import { useSearchParams } from 'next/navigation';
import ChatSidebarInner from '@/modules/pace/components/layout/chat-sidebar/ChatSidebarInner';
import { useChatSidebarState } from '@/modules/pace/hooks/useChatSidebarState';
import { usePaceContext } from '@/modules/pace/pace.context';

const ChatSidebar = () => {
  const {
    registerStartNewChat,
    registerSelectConversation,
    chatSidebarState,
    prevChatSidebarState,
    sidebarWidth,
    isSidebarResizing,
    setActiveAgentInfo,
  } = usePaceContext();
  const searchParams = useSearchParams();
  const initialConversationId = searchParams?.get(SIDEBAR_CONVERSATION_ID_PARAM) ?? null;
  const { chatTitle, setChatTitle, conversationId, setConversationId, chatKey, startNewChat } = useChatSidebarState({
    initialConversationId,
  });

  const [isHydrated, setIsHydrated] = useState(false);

  const isCollapsed = chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED;
  const isExpanded = chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED;
  const targetWidth = isCollapsed ? 0 : isExpanded ? '100%' : sidebarWidth;
  const direction = getSidebarTransitionDirection(prevChatSidebarState, chatSidebarState);
  const innerWidth =
    direction === 'sidebar-to-collapsed' || direction === 'collapsed-to-sidebar' ? sidebarWidth : '100%';

  const transitions = useMemo(() => {
    if (!isHydrated) return { width: NO_ANIMATION, opacity: NO_ANIMATION };
    if (isSidebarResizing) return { width: NO_ANIMATION, opacity: NO_ANIMATION };

    return getSidebarTransitions(direction);
  }, [direction, isHydrated, isSidebarResizing]);

  const handleStartNewChat = useCallback(() => {
    setActiveAgentInfo(null);
    startNewChat();
  }, [startNewChat, setActiveAgentInfo]);

  const handleSelectConversation = useCallback(
    (id: string, title?: string) => {
      setActiveAgentInfo(null);
      setConversationId(id, title);
    },
    [setConversationId, setActiveAgentInfo],
  );

  useEffect(() => {
    registerStartNewChat(handleStartNewChat);
  }, [registerStartNewChat, handleStartNewChat]);

  useEffect(() => {
    registerSelectConversation(handleSelectConversation);
  }, [registerSelectConversation, handleSelectConversation]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsHydrated(true);
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{
        width: targetWidth,
        opacity: isCollapsed ? 0 : 1,
        x: 0,
        transition: {
          width: transitions.width,
          opacity: transitions.opacity,
          x: transitions.width,
        },
      }}
      style={{ willChange: 'width, opacity, transform' }}
      className={cn(
        'bg-BG_WHITE relative flex h-full min-w-0 shrink-0 flex-col overflow-hidden border border-t-0 border-r-0 border-transparent',
        !isCollapsed && 'border-border border border-t-0 border-r-0',
      )}
    >
      <div className='flex h-full flex-col' style={{ width: innerWidth, minWidth: innerWidth }}>
        <ChatSidebarInner
          conversationId={conversationId}
          setConversationId={setConversationId}
          setChatTitle={setChatTitle}
          startNewChat={handleStartNewChat}
          chatTitle={chatTitle}
          chatKey={chatKey}
        />
      </div>
    </motion.div>
  );
};

export default ChatSidebar;
