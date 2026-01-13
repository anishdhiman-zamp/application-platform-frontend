'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SIDEBAR_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { usePathname } from 'next/navigation';
import { useChatSidebarContext } from '@/modules/pace/chatsidebar.context';

interface UseChatSidebarStateProps {
  initialConversationId: string | null;
}

export const useChatSidebarState = ({ initialConversationId }: UseChatSidebarStateProps) => {
  const { isChatSidebarOpen, setIsChatSidebarOpen } = useChatSidebarContext();
  const pathname = usePathname();

  const isInitializedRef = useRef(false);
  const previousPathnameRef = useRef(pathname);

  const [chatTitle, setChatTitle] = useState('');
  const [conversationId, setConversationIdState] = useState<string | null>(initialConversationId);
  const [chatKey, setChatKey] = useState(0);

  const handleConversationIdUpdate = useCallback(() => {
    // Remove conversation ID from URL
    const params = new URLSearchParams(window.location.search);

    params.delete(SIDEBAR_CONVERSATION_ID_PARAM);

    const currentPath = window.location.pathname;
    const newUrl = params.toString() ? `${currentPath}?${params.toString()}` : currentPath;

    window.history.replaceState(null, '', newUrl);
  }, []);

  const setConversationId = useCallback((id: string | null) => {
    setConversationIdState(id);

    const params = new URLSearchParams(window.location.search);

    if (id) {
      params.set(SIDEBAR_CONVERSATION_ID_PARAM, id);
    } else {
      params.delete(SIDEBAR_CONVERSATION_ID_PARAM);
    }

    // Keep the current pathname, only update the query params
    const currentPath = window.location.pathname;
    const newUrl = params.toString() ? `${currentPath}?${params.toString()}` : currentPath;

    window.history.replaceState(null, '', newUrl);
  }, []);

  const startNewChat = useCallback(() => {
    setChatTitle('');
    setConversationIdState(null);
    setChatKey((prev) => prev + 1);
    handleConversationIdUpdate();
  }, []);

  const handleClose = useCallback(() => {
    setIsChatSidebarOpen(false);
  }, [setIsChatSidebarOpen]);

  // Initialize conversation ID from URL on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      const params = new URLSearchParams(window.location.search);
      const urlConversationId = params.get(SIDEBAR_CONVERSATION_ID_PARAM);

      if (urlConversationId) {
        setConversationIdState(urlConversationId);
        setIsChatSidebarOpen(true);
      }
      isInitializedRef.current = true;
    }
  }, [setIsChatSidebarOpen]);

  // Reset chat state when route changes
  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      setChatTitle('');
      setConversationIdState(null);
      setChatKey((prev) => prev + 1);
      setIsChatSidebarOpen(false);
    }
  }, [pathname, setIsChatSidebarOpen]);

  return {
    isChatSidebarOpen,
    chatTitle,
    setChatTitle,
    conversationId,
    setConversationId,
    chatKey,
    startNewChat,
    handleClose,
  };
};
