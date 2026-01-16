'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

interface ChatContextType {
  isChatSidebarOpen: boolean;
  setIsChatSidebarOpen: (open: boolean) => void;
  isExpanded: boolean;
  toggleExpand: () => void;
  resetExpand: () => void;
  registerStartNewChat: (callback: () => void) => void;
  startNewChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const startNewChatRef = useRef<(() => void) | null>(null);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const resetExpand = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const registerStartNewChat = useCallback((callback: () => void) => {
    startNewChatRef.current = callback;
  }, []);

  const startNewChat = useCallback(() => {
    startNewChatRef.current?.();
  }, []);

  const value: ChatContextType = useMemo(
    () => ({
      isChatSidebarOpen,
      setIsChatSidebarOpen,
      isExpanded,
      toggleExpand,
      resetExpand,
      registerStartNewChat,
      startNewChat,
    }),
    [isChatSidebarOpen, isExpanded, toggleExpand, resetExpand, registerStartNewChat, startNewChat],
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
