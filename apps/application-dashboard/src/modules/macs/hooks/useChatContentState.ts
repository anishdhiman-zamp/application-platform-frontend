'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import type { RootState } from '@/store';

const CONVERSATION_ID_PARAM = 'c';

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

  // Initialize from URL on mount
  useEffect(() => {
    if (!isInitializedRef.current && initialConversationId) {
      setConversationIdState(initialConversationId);
      isInitializedRef.current = true;
    }
  }, [initialConversationId]);

  const setConversationId = useCallback((id: string | null) => {
    setConversationIdState(id);

    const params = new URLSearchParams(window.location.search);

    if (id) {
      params.set(CONVERSATION_ID_PARAM, id);
    } else {
      params.delete(CONVERSATION_ID_PARAM);
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
