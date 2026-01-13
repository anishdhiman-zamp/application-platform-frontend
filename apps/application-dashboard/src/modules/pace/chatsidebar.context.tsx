'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

interface ChatSidebarContextType {
  isChatSidebarOpen: boolean;
  setIsChatSidebarOpen: (open: boolean) => void;
  isExpanded: boolean;
  toggleExpand: () => void;
  resetExpand: () => void;
  registerStartNewChat: (callback: () => void) => void;
  startNewChat: () => void;
}

const ChatSidebarContext = createContext<ChatSidebarContextType | null>(null);

export const ChatSidebarProvider = ({ children }: { children: ReactNode }) => {
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

  const value: ChatSidebarContextType = useMemo(
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

  return <ChatSidebarContext.Provider value={value}>{children}</ChatSidebarContext.Provider>;
};

export const useChatSidebarContext = () => {
  const context = useContext(ChatSidebarContext);

  if (!context) {
    throw new Error('useChatSidebarContext must be used within a ChatSidebarProvider');
  }

  return context;
};

export default ChatSidebarContext;
