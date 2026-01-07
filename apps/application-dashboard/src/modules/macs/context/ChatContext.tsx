'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ROUTES_PATH } from '@/constants/routeConfig';
import type { ChatContextType } from '@/modules/macs/types';

const ChatContext = createContext<ChatContextType | null>(null);

const CONVERSATION_ID_PARAM = 'c';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatTitle, setChatTitle] = useState('');
  const [conversationId, setConversationIdState] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const isInitializedRef = useRef(false);

  const setInitialConversationId = useCallback((id: string | null) => {
    if (!isInitializedRef.current && id) {
      isInitializedRef.current = true;
      setConversationIdState(id);
    }
  }, []);

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

  const resetToDefault = useCallback(() => {
    setChatTitle('');
  }, []);

  const startNewChat = useCallback(() => {
    setChatTitle('');
    setConversationIdState(null);
    setChatKey((prev) => prev + 1);
    window.history.replaceState(null, '', ROUTES_PATH.CHAT);
  }, []);

  const value: ChatContextType = useMemo(
    () => ({
      resetToDefault,
      chatTitle,
      setChatTitle,
      conversationId,
      setConversationId,
      startNewChat,
      chatKey,
      setInitialConversationId,
    }),
    [resetToDefault, chatTitle, conversationId, setConversationId, startNewChat, chatKey, setInitialConversationId],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }

  return context;
};

export default ChatContext;
