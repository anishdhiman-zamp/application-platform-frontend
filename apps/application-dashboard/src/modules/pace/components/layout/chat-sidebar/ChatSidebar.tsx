'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { motion, useReducedMotion } from 'framer-motion';
import { getSidebarTransitionDirection, getSidebarTransitions, NO_ANIMATION } from 'modules/pace/pace.animations';
import { SIDEBAR_CONVERSATION_ID_PARAM, SIDEBAR_MIN_WIDTH } from 'modules/pace/pace.constants';
import { CHAT_SIDEBAR_STATE } from 'modules/pace/pace.types';
import { useSearchParams } from 'next/navigation';
import ChatSidebarInner from '@/modules/pace/components/layout/chat-sidebar/ChatSidebarInner';
import { useChatSidebarState } from '@/modules/pace/hooks/useChatSidebarState';
import { usePaceActionsContext, usePaceConversationContext, usePaceLayoutContext } from '@/modules/pace/pace.context';
import { SIDEBAR_TOGGLE_TRANSITION } from '@/utils/animations/sidebar.animations';

const ChatSidebar = () => {
  const {
    chatSidebarState,
    prevChatSidebarState,
    sidebarWidth,
    isSidebarResizing,
    hasActivePanelTab,
    filesPanelOpen,
    isFilesPanelExpanded,
  } = usePaceLayoutContext();
  const { setActiveAgentInfo, setActiveConversationId, chatMessageIntent } = usePaceConversationContext();
  const { registerStartNewChat, registerSelectConversation } = usePaceActionsContext();

  const isSendFromHome = chatMessageIntent !== null;

  const isFilesPanelFullWidth = filesPanelOpen && isFilesPanelExpanded;
  const searchParams = useSearchParams();
  const initialConversationId = searchParams?.get(SIDEBAR_CONVERSATION_ID_PARAM) ?? null;
  const { chatTitle, setChatTitle, conversationId, setConversationId, chatKey, startNewChat } = useChatSidebarState({
    initialConversationId,
  });

  const [isHydrated, setIsHydrated] = useState(false);
  const [observedFlexWidth, setObservedFlexWidth] = useState<number | null>(null);
  const prevIsFilesPanelFullWidthRef = useRef(isFilesPanelFullWidth);
  const prevConversationIdRef = useRef(conversationId);
  const lastMeasuredFlexWidthRef = useRef(sidebarWidth);
  const outerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isConversationSwitch = prevConversationIdRef.current !== conversationId;

  const isCollapsed = chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED;
  const isExpanded = chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED;
  const isSidebar = chatSidebarState === CHAT_SIDEBAR_STATE.SIDEBAR;
  const isHidden = isCollapsed || isFilesPanelFullWidth;
  const isFlexGrow = hasActivePanelTab && isSidebar && !isFilesPanelFullWidth;
  const flexGrowWidth = observedFlexWidth ?? sidebarWidth;
  const targetWidth = isHidden ? 0 : isExpanded ? '100%' : isFlexGrow ? flexGrowWidth : sidebarWidth;
  const direction = getSidebarTransitionDirection(prevChatSidebarState, chatSidebarState);
  const isFilesPanelFullWidthChanging = prevIsFilesPanelFullWidthRef.current !== isFilesPanelFullWidth;
  const preservedInnerWidth = hasActivePanelTab && isSidebar ? lastMeasuredFlexWidthRef.current : sidebarWidth;
  const innerWidth =
    !isFlexGrow &&
    (direction === 'sidebar-to-collapsed' || direction === 'collapsed-to-sidebar' || isFilesPanelFullWidthChanging)
      ? preservedInnerWidth
      : '100%';
  const directionTransitions = getSidebarTransitions(direction);
  // The files panel grows in from the right, so the left chat pane should retreat toward the left.
  const hiddenX = isFilesPanelFullWidth ? '-100%' : '100%';

  const transitions = useMemo(() => {
    if (!isHydrated) return { width: NO_ANIMATION, opacity: NO_ANIMATION };
    if (shouldReduceMotion) return { width: NO_ANIMATION, opacity: NO_ANIMATION };
    if (isSidebarResizing) return { width: NO_ANIMATION, opacity: NO_ANIMATION };
    if (isConversationSwitch) return { width: NO_ANIMATION, opacity: NO_ANIMATION };
    if (isSendFromHome) return { width: NO_ANIMATION, opacity: NO_ANIMATION };
    if (isFilesPanelFullWidth || isFilesPanelFullWidthChanging) {
      return { width: SIDEBAR_TOGGLE_TRANSITION, opacity: SIDEBAR_TOGGLE_TRANSITION };
    }
    if (isFlexGrow) return { width: NO_ANIMATION, opacity: directionTransitions.opacity };

    return directionTransitions;
  }, [
    directionTransitions,
    isHydrated,
    shouldReduceMotion,
    isSidebarResizing,
    isFlexGrow,
    isFilesPanelFullWidth,
    isFilesPanelFullWidthChanging,
    isConversationSwitch,
    isSendFromHome,
  ]);

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

  const observeFlexGrowWidth = useCallback(() => {
    if (!isFlexGrow || !outerRef.current) {
      setObservedFlexWidth(null);

      return undefined;
    }
    const el = outerRef.current;

    const measureWidth = (width: number | undefined) => {
      if (!width) return;

      lastMeasuredFlexWidthRef.current = width;
      setObservedFlexWidth(width);
    };

    measureWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;

      measureWidth(w);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [isFlexGrow]);

  useEffect(() => {
    registerStartNewChat(handleStartNewChat);
  }, [registerStartNewChat, handleStartNewChat]);

  useEffect(() => {
    registerSelectConversation(handleSelectConversation);
  }, [registerSelectConversation, handleSelectConversation]);

  useEffect(() => {
    setActiveConversationId(conversationId);
  }, [conversationId, setActiveConversationId]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsHydrated(true);
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    prevIsFilesPanelFullWidthRef.current = isFilesPanelFullWidth;
  }, [isFilesPanelFullWidth]);

  useEffect(() => {
    prevConversationIdRef.current = conversationId;
  }, [conversationId]);

  useLayoutEffect(() => observeFlexGrowWidth(), [observeFlexGrowWidth]);

  return (
    <motion.div
      ref={outerRef}
      initial={false}
      animate={{ width: targetWidth }}
      transition={transitions.width}
      style={{
        willChange: 'width',
        ...(isFlexGrow ? { flex: 1, minWidth: SIDEBAR_MIN_WIDTH } : null),
      }}
      className={cn(
        'bg-BG_WHITE relative h-full min-w-0 overflow-hidden border-l border-transparent',
        isFlexGrow ? 'flex-1' : 'shrink-0',
        !isHidden && 'border-border border-l',
      )}
    >
      <motion.div
        initial={false}
        animate={{ x: isHidden ? hiddenX : 0, opacity: isHidden ? 0 : 1 }}
        transition={transitions.opacity}
        style={{
          willChange: 'transform, opacity',
          ...(isFlexGrow ? undefined : { width: innerWidth, minWidth: innerWidth }),
        }}
        className={cn('absolute inset-y-0 left-0 flex flex-col', isFlexGrow && 'right-0 min-w-0 flex-1')}
      >
        <ChatSidebarInner
          conversationId={conversationId}
          setConversationId={setConversationId}
          setChatTitle={setChatTitle}
          startNewChat={handleStartNewChat}
          chatTitle={chatTitle}
          chatKey={chatKey}
        />
      </motion.div>
    </motion.div>
  );
};

export default ChatSidebar;
