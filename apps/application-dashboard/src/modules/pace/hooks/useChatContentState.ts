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
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';

  const [chatTitle, setChatTitle] = useState('');
  const [conversationId, setConversationIdState] = useState<string | null>(initialConversationId);
  const [chatKey, setChatKey] = useState(0);
  const isInitializedRef = useRef(false);

  const setConversationId = useCallback((id: string | null, title?: string) => {
    setConversationIdState(id);
    setChatTitle(title || '');

    const params = new URLSearchParams(window.location.search);

    if (id) {
      params.set(CHAT_CONVERSATION_ID_PARAM, id);
    } else {
      params.delete(CHAT_CONVERSATION_ID_PARAM);
    }
    const newUrl = params.toString() ? `${ROUTES_PATH.CHAT}?${params.toString()}` : ROUTES_PATH.CHAT;

    window.history.replaceState(null, '', newUrl);
  }, []);

  const startNewChat = useCallback(() => {
    setChatTitle('');
    setConversationIdState(null);
    setChatKey((prev) => prev + 1);
    window.history.replaceState(null, '', ROUTES_PATH.CHAT);
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
    currentUserName,
    chatTitle,
    setChatTitle,
    conversationId,
    setConversationId,
    chatKey,
    startNewChat,
  };
};
