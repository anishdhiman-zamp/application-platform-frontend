'use client';

import { useEffect, useMemo } from 'react';
import type { ChatMessage } from '@zamp-platform/chat';
import { useMacsContext } from '@/modules/macs/context/MacsContext';

interface UseChatSyncOptions {
  messages: ChatMessage[];
}
/**
 * Custom hook to sync chat state with MacsContext.
 */
export const useChatSync = ({ messages }: UseChatSyncOptions) => {
  const { setHasChatMessages } = useMacsContext();

  const hasMessages = useMemo(() => messages.length > 0, [messages]);

  useEffect(() => {
    setHasChatMessages(hasMessages);
  }, [hasMessages, setHasChatMessages]);

  return {
    hasMessages,
  };
};
