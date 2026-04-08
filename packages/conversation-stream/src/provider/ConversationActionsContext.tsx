'use client';

import type { ChatMessage, CreateConversationPayloadTypeV2 } from '@zamp-platform/chat';
import { createContext } from 'react';

export interface ConversationActions {
  sendMessage: (payload: ChatMessage) => Promise<unknown>;
  createConversationV2: (payload: CreateConversationPayloadTypeV2) => Promise<{
    conversation_id: string;
    status_message: string;
    title: string;
  }>;
  stopConversation: () => Promise<void>;
  clearMessages: () => void;
  setConversationId: (id: string | null) => void;
  refetchConversationHistory: () => void;
}

const NOOP_ACTIONS: ConversationActions = {
  sendMessage: async () => {},
  createConversationV2: async () => ({ conversation_id: '', status_message: '', title: '' }),
  stopConversation: async () => {},
  clearMessages: () => {},
  setConversationId: () => {},
  refetchConversationHistory: () => {},
};

/** Merge partial overrides with no-op defaults to produce a full ConversationActions. */
export const createConversationActions = (overrides: Partial<ConversationActions>): ConversationActions => ({
  ...NOOP_ACTIONS,
  ...overrides,
});

export const ConversationActionsContext = createContext<ConversationActions | null>(null);
