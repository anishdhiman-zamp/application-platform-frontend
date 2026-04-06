'use client';

import { useContext } from 'react';

import { type ConversationActions, ConversationActionsContext } from '../provider/ConversationActionsContext';

export function useConversationActions(): ConversationActions {
  const context = useContext(ConversationActionsContext);
  if (!context) {
    throw new Error('useConversationActions must be used within a ConversationProvider');
  }
  return context;
}
