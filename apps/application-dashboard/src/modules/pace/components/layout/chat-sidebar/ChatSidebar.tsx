'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'framer-motion';
import { getSidebarTransitionDirection, getSidebarTransitions, NO_ANIMATION } from 'modules/pace/pace.animations';
import { SIDEBAR_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { CHAT_SIDEBAR_STATE } from 'modules/pace/pace.types';
import ChatSidebarInner from '@/modules/pace/components/layout/chat-sidebar/ChatSidebarInner';
import { useChatSidebarState } from '@/modules/pace/hooks/useChatSidebarState';
import { useSyncedUrlParam } from '@/modules/pace/hooks/useSyncedSearchParam';
import { usePaceContext } from '@/modules/pace/pace.context';

const ChatSidebar = () => {
  const {
    registerStartNewChat,
    registerSelectConversation,
    chatSidebarState,
    prevChatSidebarState,
    filesPanelOpen,
    filesPanelPinned,
    filesPanelWidth,
    sidebarWidth,
    isSidebarResizing,
  } = usePaceContext();
  const initialConversationId = useSyncedUrlParam(SIDEBAR_CONVERSATION_ID_PARAM);
  const { chatTitle, setChatTitle, conversationId, setConversationId, chatKey, startNewChat } = useChatSidebarState({
    initialConversationId,
  });

  const [isHydrated, setIsHydrated] = useState(false);

  const isCollapsed = chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED;
  const isExpanded = chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED;
  const isPinnedFilesPanel = filesPanelOpen && filesPanelPinned;
  const expandedWidth = isPinnedFilesPanel ? `calc(100% - ${filesPanelWidth + 8}px)` : '100%';
  const targetWidth = isCollapsed ? 0 : isExpanded ? expandedWidth : sidebarWidth;
  const direction = getSidebarTransitionDirection(prevChatSidebarState, chatSidebarState);
  const innerWidth =
    direction === 'sidebar-to-collapsed' || direction === 'collapsed-to-sidebar' ? sidebarWidth : '100%';

  const transitions = useMemo(() => {
    if (!isHydrated) return { width: NO_ANIMATION, opacity: NO_ANIMATION };
    if (isSidebarResizing) return { width: NO_ANIMATION, opacity: NO_ANIMATION };

    return getSidebarTransitions(direction);
  }, [direction, isHydrated, isSidebarResizing]);

  useEffect(() => {
    registerStartNewChat(startNewChat);
  }, [registerStartNewChat, startNewChat]);

  useEffect(() => {
    registerSelectConversation(setConversationId);
  }, [registerSelectConversation, setConversationId]);

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
        'bg-BG_WHITE relative flex h-full min-w-0 shrink-0 flex-col overflow-hidden rounded-t-xl border border-transparent',
        !isCollapsed && 'border-border border',
      )}
    >
      <div className='flex h-full flex-col' style={{ width: innerWidth, minWidth: innerWidth }}>
        <ChatSidebarInner
          conversationId={conversationId}
          setConversationId={setConversationId}
          setChatTitle={setChatTitle}
          startNewChat={startNewChat}
          chatTitle={chatTitle}
          chatKey={chatKey}
        />
      </div>
    </motion.div>
  );
};

export default ChatSidebar;
