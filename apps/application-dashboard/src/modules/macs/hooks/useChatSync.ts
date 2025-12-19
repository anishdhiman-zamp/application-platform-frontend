'use client';

import { useEffect, useMemo } from 'react';
import type { ChatMessage } from '@zamp-platform/chat';
import { SenderType } from '@zamp-platform/chat';
import { useMacsContext } from '@/modules/macs/context/MacsContext';

interface UseChatSyncOptions {
  messages: ChatMessage[];
  clearMessages: () => void;
}
/**
 * Custom hook to sync chat state with MacsContext.
 */
export const useChatSync = ({ messages, clearMessages }: UseChatSyncOptions) => {
  const { setHasChatMessages, registerClearMessages } = useMacsContext();

  const hasMessages = useMemo(() => messages.length > 0, [messages]);

  const firstUserMessage = useMemo(() => {
    const userMessage = messages.find((msg) => msg.sender_type === SenderType.USER);

    if (userMessage?.message_content) {
      const content = userMessage.message_content;

      if ('message' in content && typeof content.message === 'string') {
        return content.message;
      }
      if ('text' in content && typeof content.text === 'string') {
        return content.text;
      }
    }

    return null;
  }, [messages]);

  useEffect(() => {
    registerClearMessages(clearMessages);
  }, [clearMessages, registerClearMessages]);

  useEffect(() => {
    setHasChatMessages(hasMessages);
  }, [hasMessages, setHasChatMessages]);

  return {
    hasMessages,
    firstUserMessage,
  };
};
