'use client';

import { captureException } from '@sentry/browser';
import { eventBus, UseSSEOptions } from '@zamp-platform/utils';
import { type BaseEventPayload, EventType } from '@zamp-platform/utils/event-bus/event-bus.types';
import { useCallback, useEffect, useState } from 'react';

import type { MapAny } from '@/types/commonTypes';

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
    (data: MapAny) => {
      console.log('[useChat] Handling message data', { data });
      try {
        switch (data.payload.type) {
          case SSEEventType.MESSAGE:
            const newMessage: ChatMessage = data.payload.message;
            console.log('[useChat] Processing new chat message', { newMessage });
            setMessages((prev) => [...prev, { ...newMessage, timestamp: new Date().toISOString() }]);
            config.onNewMessage?.(newMessage);
            break;
          default:
            console.log('[useChat] Unknown message type', { type: data.payload.type });
        }
      } catch (error) {
        console.error('[useChat] Error handling message', { data, error });
        captureException(error);
      }
    },
    [config],
  );

  useEffect(() => {
    console.log(`[useChat] Subscribing to conversation events for conversationId: ${_conversationId}`);
    const sub = eventBus.subscribe(EventType.CONVERSATION, (data: BaseEventPayload) => {
      console.log('[useChat] Received conversation event', { data, conversationId: _conversationId });
      if (data?.source_id === _conversationId) {
        console.log('[useChat] Processing conversation event (source_id matches)', { data });
        handleMessage(data);
      } else {
        console.log('[useChat] Ignoring conversation event (source_id mismatch)', {
          eventSourceId: data?.source_id,
          expectedConversationId: _conversationId,
        });
      }
    });
    return () => {
      console.log(`[useChat] Unsubscribing from conversation events for conversationId: ${_conversationId}`);
      sub.unsubscribe();
    };
  }, [handleMessage, _conversationId]);

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
        captureException(error);
        throw error;
      }
    },
    [_conversationId, sendMessageMutation],
  );

  return {
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
