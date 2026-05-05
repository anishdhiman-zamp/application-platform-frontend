'use client';

import type { ChatMessage, ConversationInputRequiredItem } from '@zamp-platform/chat';
import { createContext } from 'react';

export interface ConversationState {
  messages: ChatMessage[];
  queuedMessages: ChatMessage[];
  hasMessages: boolean;
  conversationId: string | null;
  isStreaming: boolean;
  isStopping: boolean;
  isLoadingConversationHistory: boolean;
  isFetchingConversationHistory: boolean;
  isCreatingConversationV2: boolean;
  isSendingMessage: boolean;
  isErrorConversationHistory: boolean;
  errorConversationHistory: unknown;
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
  initiatedBy: string | null;
}

export const ConversationStateContext = createContext<ConversationState | null>(null);

export type ConversationMessagesState = Pick<ConversationState, 'messages' | 'queuedMessages' | 'hasMessages'>;

export type ConversationStatusState = Pick<
  ConversationState,
  | 'conversationId'
  | 'isStreaming'
  | 'isStopping'
  | 'isLoadingConversationHistory'
  | 'isFetchingConversationHistory'
  | 'isCreatingConversationV2'
  | 'isSendingMessage'
  | 'isErrorConversationHistory'
  | 'errorConversationHistory'
  | 'isUninitializedConversationHistory'
  | 'isAnalysing'
  | 'sendMessageError'
  | 'sendMessageV2Error'
  | 'createConversationV2Error'
>;

export type ConversationInputState = Pick<ConversationState, 'inputsRequired' | 'initiatedBy'>;

export type ConversationBrowserState = Pick<
  ConversationState,
  'isBrowserStreamingAvailable' | 'browserSessionId' | 'taskSummaries'
>;

export const ConversationMessagesContext = createContext<ConversationMessagesState | null>(null);
export const ConversationStatusContext = createContext<ConversationStatusState | null>(null);
export const ConversationInputContext = createContext<ConversationInputState | null>(null);
export const ConversationBrowserContext = createContext<ConversationBrowserState | null>(null);
