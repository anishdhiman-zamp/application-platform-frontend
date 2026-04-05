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

export const ConversationActionsContext = createContext<ConversationActions | null>(null);
