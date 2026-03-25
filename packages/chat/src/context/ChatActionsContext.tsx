'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';

interface ChatActionsContextType {
  onFileOpen?: (path: string, name: string) => void;
  onTaskOpen?: (name: string, path: string) => void;
}

const ChatActionsContext = createContext<ChatActionsContextType>({});

interface ChatActionsProviderProps {
  children: ReactNode;
  onFileOpen?: (path: string, name: string) => void;
  onTaskOpen?: (name: string, path: string) => void;
}

export const ChatActionsProvider = ({ children, onFileOpen, onTaskOpen }: ChatActionsProviderProps) => {
  const value = useMemo(() => ({ onFileOpen, onTaskOpen }), [onFileOpen, onTaskOpen]);

  return <ChatActionsContext.Provider value={value}>{children}</ChatActionsContext.Provider>;
};

export const useChatActions = () => {
  return useContext(ChatActionsContext);
};

export default ChatActionsContext;
