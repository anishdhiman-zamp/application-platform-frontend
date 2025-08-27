'use client';

import { captureException } from '@sentry/browser';
import { eventBus, UseSSEOptions } from '@zamp-platform/utils';
import { useCallback, useEffect, useState } from 'react';

import { useCreateConversationMutation, useSendMessageMutation } from '../api';
import {
  ChatMessage,
  ChatMessageType,
  type CreateConversationPayloadType,
  SenderType,
  SSEEventType,
} from '../types/chat.types';

export interface ChatConfig extends Omit<UseSSEOptions, 'url' | 'onMessage' | 'autoConnect'> {
  conversationId?: string;
  eventUrl?: string;
  onNewMessage?: (message: ChatMessage) => void;
  onTypingUpdate?: (users: string[]) => void;
  onUserJoin?: (user: { id: string; name: string }) => void;
  onUserLeave?: (userId: string) => void;
}

export const useChat = (config: ChatConfig) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sendMessageMutation, { isLoading: isSendingMessage, error: sendMessageError }] = useSendMessageMutation();
  const [_conversationId, setConversationId] = useState<string | null>(config.conversationId || null);
  const [createConversationMutation, { isLoading: isCreatingConversation, error: createConversationError }] =
    useCreateConversationMutation();

  const createConversation = async (conversationPayload: CreateConversationPayloadType) => {
    setMessages([
      {
        ...conversationPayload,
        message_type: ChatMessageType.TEXT,
        sender_type: SenderType.USER,
        message_content: conversationPayload.message_content || { message: '' },
        metadata: {},
        timestamp: new Date().toISOString(),
      },
    ]);
    const response = await createConversationMutation(conversationPayload).unwrap();
    setConversationId(response.conversation_id);
    return response.conversation_id;
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.payload.type) {
          case SSEEventType.MESSAGE:
            const newMessage: ChatMessage = data.payload.message;
            setMessages((prev) => [...prev, { ...newMessage, timestamp: new Date().toISOString() }]);
            config.onNewMessage?.(newMessage);
            break;
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    },
    [config],
  );

  // const sseConfig: UseSSEOptions = useMemo(
  //   () => ({
  //     ...config,
  //     url: config.eventUrl,
  //     onMessage: handleMessage,
  //     autoConnect: false,
  //   }),
  //   [config, handleMessage],
  // );

  // const connection = useSSE(sseConfig);

  useEffect(() => {
    const sub = eventBus.subscribe('conversation', (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log('conversation data', data.source_id, _conversationId);
      if (data.source_id === _conversationId) {
        handleMessage(event);
      }
    });
    return sub.unsubscribe;
  }, [handleMessage]);

  const sendMessage = useCallback(
    async (messagePayload: ChatMessage) => {
      if (!_conversationId) {
        throw new Error('Conversation ID is required to send messages');
      }

      try {
        setMessages((prev) => [...prev, messagePayload]);
        const response = await sendMessageMutation({
          conversationId: _conversationId,
          body: messagePayload,
        }).unwrap();

        return response;
      } catch (error) {
        console.error('Failed to send message:', error);
        captureException(error);
        throw error;
      }
    },
    [_conversationId, sendMessageMutation],
  );

  return {
    // ...connection,
    messages,
    sendMessage,
    clearMessages,
    isSendingMessage,
    sendMessageError,
    createConversation,
    isCreatingConversation,
    createConversationError,
  };
};
