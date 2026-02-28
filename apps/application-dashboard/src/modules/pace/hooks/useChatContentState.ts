'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAT_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import type { RootState } from '@/store';

interface UseChatContentStateProps {
  initialConversationId: string | null;
}

export const useChatContentState = ({ initialConversationId }: UseChatContentStateProps) => {
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';

  const [chatTitle, setChatTitle] = useState('');
  const [conversationId, setConversationIdState] = useState<string | null>(initialConversationId);
  const [chatKey, setChatKey] = useState(0);
  const isInitializedRef = useRef(false);

  const setConversationId = useCallback((id: string | null, title?: string) => {
    const currentConversationId = new URLSearchParams(window.location.search).get(CHAT_CONVERSATION_ID_PARAM);

    setConversationIdState(id);
    setChatTitle(title || '');

    const params = new URLSearchParams(window.location.search);

    if (id) {
      params.set(CHAT_CONVERSATION_ID_PARAM, id);
    } else {
      params.delete(CHAT_CONVERSATION_ID_PARAM);
    }
    const newUrl = params.toString() ? `${ROUTES_PATH.CHAT}?${params.toString()}` : ROUTES_PATH.CHAT;

    // Use pushState when opening a new conversation, replaceState otherwise
    if (id && !currentConversationId) {
      window.history.pushState({ conversationId: id }, '', newUrl);
    } else {
      window.history.replaceState({ conversationId: id }, '', newUrl);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setChatTitle('');
    setConversationIdState(null);
    setChatKey((prev) => prev + 1);
    window.history.replaceState({ conversationId: null }, '', ROUTES_PATH.CHAT);
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlConversationId = params.get(CHAT_CONVERSATION_ID_PARAM);

      if (urlConversationId) {
        // URL has conversation ID, update state
        setConversationIdState(urlConversationId);
      } else {
        // No conversation ID in URL, start fresh chat
        setChatTitle('');
        setConversationIdState(null);
        setChatKey((prev) => prev + 1);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Initialize from URL on mount
  useEffect(() => {
    if (!isInitializedRef.current && initialConversationId) {
      setConversationIdState(initialConversationId);
      isInitializedRef.current = true;
    }
  }, [initialConversationId]);

  return {
    organizationId,
    username,
    chatTitle,
    setChatTitle,
    conversationId,
    setConversationId,
    chatKey,
    startNewChat,
  };
};
