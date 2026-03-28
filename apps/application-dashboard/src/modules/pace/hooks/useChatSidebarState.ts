'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SIDEBAR_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { CHAT_SIDEBAR_STATE } from 'modules/pace/pace.types';
import { usePaceContext } from '@/modules/pace/pace.context';

interface UseChatSidebarStateProps {
  initialConversationId: string | null;
}

export const useChatSidebarState = ({ initialConversationId }: UseChatSidebarStateProps) => {
  const { chatSidebarState, setChatSidebarState } = usePaceContext();

  const prevInitialConversationIdRef = useRef(initialConversationId);
  const internalUpdateRef = useRef(false);

  const [chatTitle, setChatTitle] = useState('');
  const [conversationId, setConversationIdState] = useState<string | null>(initialConversationId);
  const [chatKey, setChatKey] = useState(0);

  const handleConversationIdUpdate = useCallback(() => {
    const params = new URLSearchParams(window.location.search);

    params.delete(SIDEBAR_CONVERSATION_ID_PARAM);

    const currentPath = window.location.pathname;
    const newUrl = params.toString() ? `${currentPath}?${params.toString()}` : currentPath;

    window.history.replaceState(null, '', newUrl);
  }, []);

  const setConversationId = useCallback((id: string | null, title?: string) => {
    internalUpdateRef.current = true;
    setConversationIdState((prev) => {
      if (prev && id && prev !== id) {
        setChatKey((k) => k + 1);
      }

      return id;
    });
    setChatTitle(title || '');

    const params = new URLSearchParams(window.location.search);

    if (id) {
      params.set(SIDEBAR_CONVERSATION_ID_PARAM, id);
    } else {
      params.delete(SIDEBAR_CONVERSATION_ID_PARAM);
    }

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

  useEffect(() => {
    if (prevInitialConversationIdRef.current !== initialConversationId) {
      const wasNull = prevInitialConversationIdRef.current === null;
      const wasInternal = internalUpdateRef.current;

      internalUpdateRef.current = false;

      prevInitialConversationIdRef.current = initialConversationId;

      if (wasInternal) {
        return;
      }

      setConversationIdState(initialConversationId);

      if (initialConversationId) {
        if (wasNull) {
          setChatKey((prev) => prev + 1);
        }
        if (chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED) {
          setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
        }
      } else {
        setChatTitle('');
        setChatKey((prev) => prev + 1);
      }
    }
  }, [initialConversationId, chatSidebarState, setChatSidebarState]);

  return {
    chatTitle,
    setChatTitle,
    conversationId,
    setConversationId,
    chatKey,
    startNewChat,
  };
};
