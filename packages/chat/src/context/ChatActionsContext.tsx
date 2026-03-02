'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';

interface ChatActionsContextType {
  onFileOpen?: (path: string, name: string) => void;
}

const ChatActionsContext = createContext<ChatActionsContextType>({});

interface ChatActionsProviderProps {
  children: ReactNode;
  onFileOpen?: (path: string, name: string) => void;
}

export const ChatActionsProvider = ({ children, onFileOpen }: ChatActionsProviderProps) => {
  const value = useMemo(() => ({ onFileOpen }), [onFileOpen]);

  return <ChatActionsContext.Provider value={value}>{children}</ChatActionsContext.Provider>;
};

export const useChatActions = () => {
  return useContext(ChatActionsContext);
};

export default ChatActionsContext;
