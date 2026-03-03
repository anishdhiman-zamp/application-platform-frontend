'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAT_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import type { RootState } from '@/store';

interface UseChatContentStateProps {
  initialConversationId: string | null;
}

export const useChatContentState = ({ initialConversationId }: UseChatContentStateProps) => {
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';
  const router = useRouter();

  const prevInitialConversationIdRef = useRef(initialConversationId);

  const [chatTitle, setChatTitle] = useState('');
  const [conversationId, setConversationIdState] = useState<string | null>(initialConversationId);
  const [chatKey, setChatKey] = useState(0);

  const setConversationId = useCallback(
    (id: string | null, title?: string) => {
      const currentConversationId = new URLSearchParams(window.location.search).get(CHAT_CONVERSATION_ID_PARAM);
      const isOnChatPage = window.location.pathname === ROUTES_PATH.CHAT;

      setConversationIdState(id);
      setChatTitle(title || '');

      const params = new URLSearchParams(window.location.search);

      if (id) {
        params.set(CHAT_CONVERSATION_ID_PARAM, id);
      } else {
        params.delete(CHAT_CONVERSATION_ID_PARAM);
      }
      const newUrl = params.toString() ? `${ROUTES_PATH.CHAT}?${params.toString()}` : ROUTES_PATH.CHAT;

      if (!isOnChatPage) {
        router.push(newUrl);
      } else if (id && !currentConversationId) {
        window.history.pushState({ conversationId: id }, '', newUrl);
      } else {
        window.history.replaceState({ conversationId: id }, '', newUrl);
      }
    },
    [router],
  );

  const startNewChat = useCallback(() => {
    const isOnChatPage = window.location.pathname === ROUTES_PATH.CHAT;

    setChatTitle('');
    setConversationIdState(null);
    setChatKey((prev) => prev + 1);

    if (isOnChatPage) {
      window.history.replaceState({ conversationId: null }, '', ROUTES_PATH.CHAT);
    } else {
      router.push(ROUTES_PATH.CHAT);
    }
  }, [router]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlConversationId = params.get(CHAT_CONVERSATION_ID_PARAM);

      if (urlConversationId) {
        setConversationIdState(urlConversationId);
      } else {
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

  // Sync state with URL when initialConversationId changes (e.g., browser back/forward)
  useEffect(() => {
    if (prevInitialConversationIdRef.current !== initialConversationId) {
      prevInitialConversationIdRef.current = initialConversationId;
      setConversationIdState(initialConversationId);

      if (!initialConversationId) {
        setChatTitle('');
        setChatKey((prev) => prev + 1);
      }
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
