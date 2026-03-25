'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';

import type { ToolResultContentBlock } from '../types/block.types';

export interface LiveStreamingData {
  toolName: string;
  screenshotUrl?: string;
  toolResult?: ToolResultContentBlock;
  isComplete: boolean;
}

interface ChatActionsContextType {
  onFileOpen?: (path: string, name: string) => void;
  onTaskOpen?: (name: string, path: string) => void;
  onWatchStream?: (data: LiveStreamingData | null) => void;
}

const ChatActionsContext = createContext<ChatActionsContextType>({});

interface ChatActionsProviderProps {
  children: ReactNode;
  onFileOpen?: (path: string, name: string) => void;
  onTaskOpen?: (name: string, path: string) => void;
  onWatchStream?: (data: LiveStreamingData | null) => void;
}

export const ChatActionsProvider = ({ children, onFileOpen, onTaskOpen, onWatchStream }: ChatActionsProviderProps) => {
  const value = useMemo(() => ({ onFileOpen, onTaskOpen, onWatchStream }), [onFileOpen, onTaskOpen, onWatchStream]);

  return <ChatActionsContext.Provider value={value}>{children}</ChatActionsContext.Provider>;
};

export const useChatActions = () => {
  return useContext(ChatActionsContext);
};

export default ChatActionsContext;
