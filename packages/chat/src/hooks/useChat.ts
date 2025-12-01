'use client';

import { captureException } from '@sentry/browser';
import { UseSSEOptions } from '@zamp-platform/utils';
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useEventBus } from '@/app/_providers/sse-provider';
import type { MapAny } from '@/types/commonTypes';

import {
  APITags,
  chatApi,
  useCreateConversationMutation,
  useCreateConversationV2Mutation,
  useGetConversationByIdQuery,
  useSendMessageMutation,
  useSendMessageV2Mutation,
} from '../api';
import { getHistoryFormattedMessages } from '../components/block.utils';
import { BLOCK_TYPE } from '../types/block.types';
import {
  ChatMessage,
  ChatMessageType,
  CreateConversationPayloadType,
  CreateConversationPayloadTypeV2,
  ResourceType,
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
  resourceId?: string;
  resourceType?: ResourceType;
  setHeader?: (header: string) => void;
  refetchConversationHistory?: boolean;
}

export const useChat = (config: ChatConfig) => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sendMessageMutation, { isLoading: isSendingMessage, error: sendMessageError }] = useSendMessageMutation();
  const [sendMessageV2Mutation, { isLoading: isSendingMessageV2, error: sendMessageV2Error }] =
    useSendMessageV2Mutation();
  const [_conversationId, setConversationId] = useState<string | null>(config.conversationId || null);
  const [createConversationMutation, { isLoading: isCreatingConversation, error: createConversationError }] =
    useCreateConversationMutation();
  const [createConversationV2Mutation, { isLoading: isCreatingConversationV2, error: createConversationV2Error }] =
    useCreateConversationV2Mutation();

  const {
    data: conversationHistory,
    isLoading: isLoadingConversationHistory,
    isFetching: isFetchingConversationHistory,
  } = useGetConversationByIdQuery(
    {
      conversationId: config.conversationId || '',
      resourceId: config.resourceId,
      resourceType: config.resourceType,
    },
    {
      skip: !config.resourceId || !config.resourceType || !config.conversationId,
      refetchOnMountOrArgChange: config.refetchConversationHistory,
    },
  );

  const { sseEventBus } = useEventBus();
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

  const createConversationV2 = async (conversationPayload: CreateConversationPayloadTypeV2) => {
    const messagePayload: ChatMessage = {
      ...conversationPayload,
      message_type: ChatMessageType.TEXT,
      sender_type: SenderType.USER,
      sender_name: conversationPayload.sender_name || '',
      message_content: conversationPayload.message_content || { text: '', text_type: 'plain_text' },
      metadata: {},
      timestamp: new Date().toISOString(),
    };
    if (messagePayload?.message_content?.attachments?.length) {
      messagePayload.message_content.elements = [
        ...(messagePayload.message_content.elements || []),
        {
          id: 'element_2',
          type: BLOCK_TYPE.ATTACHMENTS,
          order: 2,
          payload: {
            attachments: messagePayload.message_content.attachments,
          },
        },
      ];
    }
    setMessages([messagePayload]);
    const response = await createConversationV2Mutation(conversationPayload).unwrap();
    setConversationId(response.conversation_id);

    // Update header with title from response
    if (response.title) {
      config.setHeader?.(response.title);
    }

    return response;
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const handleMessage = useCallback(
    (data: MapAny) => {
      try {
        switch (data.payload.type) {
          case SSEEventType.MESSAGE:
          case SSEEventType.NEW_CHAT_MESSAGE:
            const newMessage: ChatMessage = data.payload.message;
            setMessages((prev) => [...prev, { ...newMessage, timestamp: new Date().toISOString() }]);
            // invalidate the conversation by id cache
            if (newMessage.conversation_id) {
              dispatch(
                chatApi.util.invalidateTags([{ type: APITags.GET_CONVERSATION_BY_ID, id: newMessage.conversation_id }]),
              );
            }
            config.onNewMessage?.(newMessage);
            break;
          case SSEEventType.CONVERSATION_UPDATED:
            if (_conversationId) {
              dispatch(chatApi.util.invalidateTags([{ type: APITags.GET_CONVERSATION_BY_ID, id: _conversationId }]));
            }
            break;
          default:
        }
      } catch (error) {
        captureException(error);
      }
    },
    [dispatch, _conversationId],
  );

  useEffect(() => {
    if (config.conversationId) {
      setConversationId(config.conversationId);
    }
  }, [config.conversationId]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.CONVERSATION, (data: BaseEventPayload) => {
      if (data?.source_id === _conversationId) handleMessage(data);
    });
    return () => sub.unsubscribe();
  }, [handleMessage, _conversationId]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.CONVERSATION_V2, (data: BaseEventPayload) => {
      if (data?.source_id === _conversationId) handleMessage(data);
    });
    return () => sub.unsubscribe();
  }, [handleMessage, _conversationId]);

  useEffect(() => {
    if (!isFetchingConversationHistory && conversationHistory && conversationHistory?.messages?.length > 0) {
      const historyMessages: ChatMessage[] = getHistoryFormattedMessages(conversationHistory);

      setMessages(historyMessages);
      config.setHeader?.(conversationHistory?.conversation?.title || '');
    }
  }, [conversationHistory, isFetchingConversationHistory]);

  const sendMessage = useCallback(
    async (messagePayload: ChatMessage, useV2Api?: boolean) => {
      if (!_conversationId) {
        throw new Error('Conversation ID is required to send messages');
      }

      try {
        if (messagePayload?.message_content?.attachments?.length) {
          const attachmentsMessagePayload: ChatMessage = {
            ...messagePayload,
            message_content: {
              ...messagePayload.message_content,
              elements: [
                ...(messagePayload.message_content.elements || []),
                {
                  id: 'element_2',
                  type: BLOCK_TYPE.ATTACHMENTS,
                  order: 2,
                  payload: {
                    attachments: messagePayload.message_content.attachments,
                  },
                },
              ],
            },
          };

          setMessages((prev) => [...prev, attachmentsMessagePayload]);
        } else {
          setMessages((prev) => [...prev, messagePayload]);
        }
        const response = useV2Api
          ? await sendMessageV2Mutation({
              conversationId: _conversationId,
              body: messagePayload,
            }).unwrap()
          : await sendMessageMutation({
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
    isSendingMessageV2,
    sendMessageError,
    createConversation,
    isCreatingConversation,
    isCreatingConversationV2,
    sendMessageV2Error,
    createConversationV2Error,
    createConversationError,
    setMessages,
    isLoadingConversationHistory,
    createConversationV2,
    conversationId: _conversationId,
    setConversationId,
  };
};
