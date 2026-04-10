'use client';

import type { ChatMessage, ConversationInputRequiredItem } from '@zamp-platform/chat';
import { createContext } from 'react';

export interface ConversationState {
  messages: ChatMessage[];
  hasMessages: boolean;
  conversationId: string | null;
  isStreaming: boolean;
  isStopping: boolean;
  isLoadingConversationHistory: boolean;
  isFetchingConversationHistory: boolean;
  isCreatingConversationV2: boolean;
  isSendingMessage: boolean;
  isErrorConversationHistory: boolean;
  isUninitializedConversationHistory: boolean;
  isAnalysing: boolean;
  sendMessageError: unknown;
  sendMessageV2Error: unknown;
  createConversationV2Error: unknown;
  inputsRequired: ConversationInputRequiredItem[] | undefined;
  isBrowserStreamingAvailable: boolean;
  browserSessionId?: string;
  /** Latest summary text per child task, received from the per-conversation SSE channel. */
  taskSummaries: Record<string, string>;
}

export const ConversationStateContext = createContext<ConversationState | null>(null);
