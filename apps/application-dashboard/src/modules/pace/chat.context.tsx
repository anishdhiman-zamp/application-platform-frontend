'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

interface ChatContextType {
  isChatSidebarOpen: boolean;
  setIsChatSidebarOpen: (open: boolean) => void;
  registerStartNewChat: (callback: () => void) => void;
  startNewChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const startNewChatRef = useRef<(() => void) | null>(null);

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
      registerStartNewChat,
      startNewChat,
    }),
    [isChatSidebarOpen, registerStartNewChat, startNewChat],
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
