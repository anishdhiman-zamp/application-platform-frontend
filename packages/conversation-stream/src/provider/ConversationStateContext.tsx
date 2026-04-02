'use client';

import type { ChatMessage } from '@zamp-platform/chat';
import { createContext } from 'react';

export interface ConversationState {
  messages: ChatMessage[];
  conversationId: string | null;
  isStreaming: boolean;
  isStopping: boolean;
  isLoadingConversationHistory: boolean;
  isFetchingConversationHistory: boolean;
  isCreatingConversationV2: boolean;
  isSendingMessage: boolean;
  isErrorConversationHistory: boolean;
  isUninitializedConversationHistory: boolean;
  sendMessageError: unknown;
  sendMessageV2Error: unknown;
  createConversationV2Error: unknown;
}

export const ConversationStateContext = createContext<ConversationState | null>(null);
