'use client';

import { useContext } from 'react';

import { type ConversationState, ConversationStateContext } from '../provider/ConversationStateContext';

export function useConversationState(): ConversationState {
  const context = useContext(ConversationStateContext);
  if (!context) {
    throw new Error('useConversationState must be used within a ConversationProvider');
  }
  return context;
}
