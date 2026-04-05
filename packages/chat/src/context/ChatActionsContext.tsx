'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';

import type { ToolResultContentBlock } from '../types/block.types';
import type { SiblingTask, TaskBreadcrumb } from '../types/chat.types';

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
  isBrowserStreamingAvailable?: boolean;
  parentTasks?: TaskBreadcrumb[];
  siblings?: SiblingTask[];
  /** Per-task summary text received from the per-conversation SSE channel. */
  taskSummaries?: Record<string, string>;
}

const ChatActionsContext = createContext<ChatActionsContextType>({});

interface ChatActionsProviderProps {
  children: ReactNode;
  onFileOpen?: (path: string, name: string) => void;
  onTaskOpen?: (name: string, path: string) => void;
  onWatchStream?: (data: LiveStreamingData | null) => void;
  isBrowserStreamingAvailable?: boolean;
  parentTasks?: TaskBreadcrumb[];
  siblings?: SiblingTask[];
  taskSummaries?: Record<string, string>;
}

export const ChatActionsProvider = ({
  children,
  onFileOpen,
  onTaskOpen,
  onWatchStream,
  isBrowserStreamingAvailable,
  parentTasks,
  siblings,
  taskSummaries,
}: ChatActionsProviderProps) => {
  const value = useMemo(
    () => ({
      onFileOpen,
      onTaskOpen,
      onWatchStream,
      isBrowserStreamingAvailable,
      parentTasks,
      siblings,
      taskSummaries,
    }),
    [onFileOpen, onTaskOpen, onWatchStream, isBrowserStreamingAvailable, parentTasks, siblings, taskSummaries],
  );

  return <ChatActionsContext.Provider value={value}>{children}</ChatActionsContext.Provider>;
};

export const useChatActions = () => {
  return useContext(ChatActionsContext);
};

export default ChatActionsContext;
