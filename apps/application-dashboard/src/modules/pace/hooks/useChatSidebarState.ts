'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SIDEBAR_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

interface UseChatSidebarStateProps {
  initialConversationId: string | null;
}

export const useChatSidebarState = ({ initialConversationId }: UseChatSidebarStateProps) => {
  const { isPaceSidebarOpen, setIsPaceSidebarOpen } = usePaceContext();

  const prevInitialConversationIdRef = useRef(initialConversationId);

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

  const setConversationId = useCallback((id: string | null, title?: string) => {
    setConversationIdState(id);
    setChatTitle(title || '');

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
    setIsPaceSidebarOpen(false);
  }, [setIsPaceSidebarOpen]);

  // Sync state with URL when initialConversationId changes (e.g., browser back/forward)
  useEffect(() => {
    if (prevInitialConversationIdRef.current !== initialConversationId) {
      prevInitialConversationIdRef.current = initialConversationId;
      setConversationIdState(initialConversationId);

      if (initialConversationId) {
        setIsPaceSidebarOpen(true);
      } else {
        setChatTitle('');
        setChatKey((prev) => prev + 1);
      }
    }
  }, [initialConversationId]);

  return {
    isPaceSidebarOpen,
    chatTitle,
    setChatTitle,
    conversationId,
    setConversationId,
    chatKey,
    startNewChat,
    handleClose,
  };
};
