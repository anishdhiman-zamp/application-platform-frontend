'use client';

import type { ChatMessage, ConversationInputRequiredItem } from '@zamp-platform/chat';
import { createContext } from 'react';

export interface TaskState {
  messages: ChatMessage[];
  taskId: string | null;
  isStreaming: boolean;
  isLoadingHistory: boolean;
  isFetchingHistory: boolean;
  isErrorHistory: boolean;
  conversationData: unknown;
  inputsRequired: ConversationInputRequiredItem[] | undefined;
}

export const TaskStateContext = createContext<TaskState | null>(null);
