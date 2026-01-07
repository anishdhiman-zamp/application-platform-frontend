'use client';

import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

interface ChatSidebarContextType {
  isChatSidebarOpen: boolean;
  setIsChatSidebarOpen: (open: boolean) => void;
}

const ChatSidebarContext = createContext<ChatSidebarContextType | null>(null);

export const ChatSidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);

  const value: ChatSidebarContextType = useMemo(
    () => ({
      isChatSidebarOpen,
      setIsChatSidebarOpen,
    }),
    [isChatSidebarOpen],
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
