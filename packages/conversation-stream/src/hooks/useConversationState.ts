'use client';

import { useContext } from 'react';

import {
  ConversationBrowserContext,
  type ConversationBrowserState,
  ConversationInputContext,
  type ConversationInputState,
  ConversationMessagesContext,
  type ConversationMessagesState,
  type ConversationState,
  ConversationStateContext,
  ConversationStatusContext,
  type ConversationStatusState,
} from '../provider/ConversationStateContext';

export function useConversationState(): ConversationState {
  const context = useContext(ConversationStateContext);
  if (!context) {
    throw new Error('useConversationState must be used within a ConversationProvider');
  }
  return context;
}

export function useConversationMessagesState(): ConversationMessagesState {
  const context = useContext(ConversationMessagesContext);
  if (!context) {
    throw new Error('useConversationMessagesState must be used within a ConversationProvider');
  }
  return context;
}

export function useConversationStatusState(): ConversationStatusState {
  const context = useContext(ConversationStatusContext);
  if (!context) {
    throw new Error('useConversationStatusState must be used within a ConversationProvider');
  }
  return context;
}

export function useConversationInputState(): ConversationInputState {
  const context = useContext(ConversationInputContext);
  if (!context) {
    throw new Error('useConversationInputState must be used within a ConversationProvider');
  }
  return context;
}

export function useConversationBrowserState(): ConversationBrowserState {
  const context = useContext(ConversationBrowserContext);
  if (!context) {
    throw new Error('useConversationBrowserState must be used within a ConversationProvider');
  }
  return context;
}
