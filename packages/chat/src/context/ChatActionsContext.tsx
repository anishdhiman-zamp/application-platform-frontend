'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';

import type { SiblingTask, TaskBreadcrumb } from '../types/chat.types';

interface ChatActionsContextType {
  onFileOpen?: (path: string, name: string) => void;
  onTaskOpen?: (name: string, path: string) => void;
  parentTasks?: TaskBreadcrumb[];
  siblings?: SiblingTask[];
}

const ChatActionsContext = createContext<ChatActionsContextType>({});

interface ChatActionsProviderProps {
  children: ReactNode;
  onFileOpen?: (path: string, name: string) => void;
  onTaskOpen?: (name: string, path: string) => void;
  parentTasks?: TaskBreadcrumb[];
  siblings?: SiblingTask[];
}

export const ChatActionsProvider = ({
  children,
  onFileOpen,
  onTaskOpen,
  parentTasks,
  siblings,
}: ChatActionsProviderProps) => {
  const value = useMemo(
    () => ({ onFileOpen, onTaskOpen, parentTasks, siblings }),
    [onFileOpen, onTaskOpen, parentTasks, siblings],
  );

  return <ChatActionsContext.Provider value={value}>{children}</ChatActionsContext.Provider>;
};

export const useChatActions = () => {
  return useContext(ChatActionsContext);
};

export default ChatActionsContext;
