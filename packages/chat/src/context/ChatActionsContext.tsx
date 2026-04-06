'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';

import type { AgentBlockType, AgentContentBlock } from '../types/block.types';
import type { ToolResultContentBlock } from '../types/block.types';
import type { SiblingTask, TaskBreadcrumb } from '../types/chat.types';

type AgentBlockPayload = AgentBlockType['payload'] | AgentContentBlock['payload'];

export interface LiveStreamingData {
  toolName: string;
  screenshotUrl?: string;
  toolResult?: ToolResultContentBlock;
  isComplete: boolean;
}

interface ChatActionsContextType {
  onFileOpen?: (path: string, name: string) => void;
  onTaskOpen?: (name: string, path: string) => void;
  onAgentClick?: (agentId: string, agentName: string, agentDescription?: string, avatarKey?: string) => void;
  onAgentTest?: (agentId: string, agentName: string) => void;
  renderAgentBlock?: (payload: AgentBlockPayload) => ReactNode;
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
  onAgentClick?: (agentId: string, agentName: string, agentDescription?: string, avatarKey?: string) => void;
  onAgentTest?: (agentId: string, agentName: string) => void;
  renderAgentBlock?: (payload: AgentBlockPayload) => ReactNode;
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
  onAgentClick,
  onAgentTest,
  renderAgentBlock,
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
      onAgentClick,
      onAgentTest,
      renderAgentBlock,
      onWatchStream,
      isBrowserStreamingAvailable,
      parentTasks,
      siblings,
      taskSummaries,
    }),
    [
      onFileOpen,
      onTaskOpen,
      onAgentClick,
      onAgentTest,
      renderAgentBlock,
      onWatchStream,
      isBrowserStreamingAvailable,
      parentTasks,
      siblings,
      taskSummaries,
    ],
  );

  return <ChatActionsContext.Provider value={value}>{children}</ChatActionsContext.Provider>;
};

export const useChatActions = () => {
  return useContext(ChatActionsContext);
};

export default ChatActionsContext;
