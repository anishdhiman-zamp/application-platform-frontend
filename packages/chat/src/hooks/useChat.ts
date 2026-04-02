'use client';

import { captureException } from '@sentry/browser';
import { UseSSEOptions } from '@zamp-platform/utils';
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useEventBus } from '@/app/_providers/sse-provider';
import type { MapAny } from '@/types/commonTypes';

import {
  APITags,
  chatApi,
  useCreateConversationMutation,
  useCreateConversationV2Mutation,
  useGetConversationByIdQuery,
  useLazyGetConversationByIdQuery,
  useSendMessageMutation,
  useSendMessageV2Mutation,
  useStopConversationMutation,
} from '../api';
import { getHistoryFormattedMessages } from '../components/block.utils';
import { streamingStateStore } from '../stores/streamingStateStore';
import { BLOCK_TYPE, type TaskStatus } from '../types/block.types';
import {
  ChatMessage,
  ChatMessageType,
  CreateConversationPayloadType,
  CreateConversationPayloadTypeV2,
  ResourceType,
  SenderType,
  SSEEventType,
} from '../types/chat.types';
import { useStreamingState } from './useStreamingState';

export interface ChatConfig extends Omit<UseSSEOptions, 'url' | 'onMessage' | 'autoConnect'> {
  conversationId?: string;
  eventUrl?: string;
  eventType?: EVENT_TYPE.CONVERSATION_V2 | EVENT_TYPE.TASK;
  onNewMessage?: (message: ChatMessage) => void;
  onTypingUpdate?: (users: string[]) => void;
  onUserJoin?: (user: { id: string; name: string }) => void;
  onUserLeave?: (userId: string) => void;
  resourceId?: string;
  resourceType?: ResourceType;
  setHeader?: (header: string) => void;
  refetchConversationHistory?: boolean;
  apiConfig?: {
    getConversationById?: string;
    sendMessage?: string;
    createConversation?: string;
  };
  enableStreaming?: boolean;
  showThinkingContent?: boolean;
}

export const useChat = (config: ChatConfig) => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStopping, setIsStopping] = useState(false);
  const messagesRef = useRef<ChatMessage[]>(messages);
  const [sendMessageMutation, { isLoading: isSendingMessage, error: sendMessageError }] = useSendMessageMutation();
  const [sendMessageV2Mutation, { isLoading: isSendingMessageV2, error: sendMessageV2Error }] =
    useSendMessageV2Mutation();
  const [_conversationId, setConversationId] = useState<string | null>(config.conversationId || null);
  const [createConversationMutation, { isLoading: isCreatingConversation, error: createConversationError }] =
    useCreateConversationMutation();
  const [createConversationV2Mutation, { isLoading: isCreatingConversationV2, error: createConversationV2Error }] =
    useCreateConversationV2Mutation();

  const [triggerGetConversation] = useLazyGetConversationByIdQuery();
  const [stopConversationMutation] = useStopConversationMutation();

  const { sseEventBus } = useEventBus();
  const stoppingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const streamingState = useStreamingState(_conversationId);

  const conversationIdRef = useRef<string | null>(_conversationId);

  // Skip fetching history for conversations created in this session
  const isNewlyCreatedConversationRef = useRef<string | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (stoppingTimerRef.current) clearTimeout(stoppingTimerRef.current);
    };
  }, []);

  const isStreaming = useMemo(() => {
    return config.enableStreaming ? (streamingState?.is_active ?? false) : false;
  }, [config.enableStreaming, streamingState?.is_active]);

  const clearStreamingState = useCallback(() => {
    if (config.enableStreaming && _conversationId) {
      streamingStateStore.delete(_conversationId);
    }
  }, [config.enableStreaming, _conversationId]);

  const clearStoppingTimer = useCallback(() => {
    if (stoppingTimerRef.current) {
      clearTimeout(stoppingTimerRef.current);
      stoppingTimerRef.current = null;
    }
  }, []);

  const stopConversation = useCallback(async () => {
    if (!_conversationId || isStopping) return;

    setIsStopping(true);
    stoppingTimerRef.current = setTimeout(() => {
      setIsStopping(false);
      stoppingTimerRef.current = null;
    }, 30_000);

    try {
      await stopConversationMutation({ conversationId: _conversationId }).unwrap();
    } catch (error) {
      clearStoppingTimer();
      setIsStopping(false);
      captureException(error);
      throw new Error('Failed to stop conversation. Please try again.');
    }
  }, [_conversationId, stopConversationMutation, isStopping, clearStoppingTimer]);

  const shouldSkipConversationFetch =
    !config.resourceId ||
    !config.resourceType ||
    !config.conversationId ||
    isNewlyCreatedConversationRef.current === config.conversationId ||
    isNewlyCreatedConversationRef.current === _conversationId;

  const {
    data: conversationHistory,
    isLoading: isLoadingConversationHistory,
    isFetching: isFetchingConversationHistory,
    isUninitialized: isUninitializedConversationHistory,
    isError: isErrorConversationHistory,
    refetch: refetchConversationHistory,
  } = useGetConversationByIdQuery(
    {
      conversationId: config.conversationId || '',
      resourceId: config.resourceId,
      resourceType: config.resourceType,
      url: config.apiConfig?.getConversationById,
    },
    {
      skip: shouldSkipConversationFetch,
      refetchOnMountOrArgChange: config.refetchConversationHistory,
    },
  );

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
    try {
      const response = await createConversationMutation(conversationPayload).unwrap();
      setConversationId(response.conversation_id);
      isNewlyCreatedConversationRef.current = response.conversation_id;

      if (config.resourceId && config.resourceType) {
        triggerGetConversation({
          conversationId: response.conversation_id,
          resourceId: config.resourceId,
          resourceType: config.resourceType,
          url: config.apiConfig?.getConversationById,
        });
      }

      return response.conversation_id;
    } catch (error) {
      setMessages([]);
      captureException(error);
      throw new Error('Failed to start conversation. Please try again.');
    }
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
    if (messagePayload?.message_content?.file_references?.length) {
      messagePayload.message_content.elements = [
        ...(messagePayload.message_content.elements || []),
        {
          id: 'element_2',
          type: BLOCK_TYPE.FILE_REFERENCES,
          order: 2,
          payload: {
            file_references: messagePayload.message_content.file_references,
          },
        },
      ];
    }
    setMessages([messagePayload]);
    try {
      const response = await createConversationV2Mutation({
        ...conversationPayload,
        url: config.apiConfig?.createConversation,
      }).unwrap();
      setConversationId(response.conversation_id);
      isNewlyCreatedConversationRef.current = response.conversation_id;

      if (config.resourceId && config.resourceType) {
        triggerGetConversation({
          conversationId: response.conversation_id,
          resourceId: config.resourceId,
          resourceType: config.resourceType,
          url: config.apiConfig?.getConversationById,
        });
      }

      if (response.title && !config.enableStreaming) {
        config.setHeader?.(response.title);
      }

      return response;
    } catch (error) {
      setMessages([]);
      captureException(error);
      throw new Error('Failed to start conversation. Please try again.');
    }
  };

  const clearMessages = useCallback(() => {
    if (config.enableStreaming && conversationIdRef.current) {
      streamingStateStore.delete(conversationIdRef.current);
    }
    setMessages([]);
    setConversationId(null);
    isNewlyCreatedConversationRef.current = null;
  }, [config.enableStreaming]);

  const resolvedEventType = config.eventType ?? EVENT_TYPE.CONVERSATION_V2;
  const isTaskEvent = resolvedEventType === EVENT_TYPE.TASK;

  const handleSSEMessage = useCallback(
    (data: MapAny) => {
      try {
        const convId = isTaskEvent
          ? (data.payload?.task_id as string) || conversationIdRef.current
          : (data.payload?.conversation_id as string) || conversationIdRef.current;

        switch (data.payload.type) {
          case SSEEventType.MESSAGE:
          case SSEEventType.NEW_CHAT_MESSAGE: {
            const newMessage: ChatMessage = data.payload.message;

            setMessages((prev) => {
              if (newMessage.id && prev.some((msg) => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, { ...newMessage, timestamp: new Date().toISOString() }];
            });

            const invalidationId = isTaskEvent ? conversationIdRef.current : newMessage.conversation_id;
            if (invalidationId && isNewlyCreatedConversationRef.current !== invalidationId) {
              dispatch(chatApi.util.invalidateTags([{ type: APITags.GET_CONVERSATION_BY_ID, id: invalidationId }]));
            }
            config.onNewMessage?.(newMessage);
            break;
          }
          case SSEEventType.CONVERSATION_UPDATED:
            if (_conversationId && isNewlyCreatedConversationRef.current !== _conversationId) {
              dispatch(chatApi.util.invalidateTags([{ type: APITags.GET_CONVERSATION_BY_ID, id: _conversationId }]));
            }
            break;
          case SSEEventType.TITLE_UPDATED:
            if (config.enableStreaming) {
              const title = data.payload?.title;
              config.setHeader?.(title);
            }
            break;
          case SSEEventType.MESSAGE_START:
          case SSEEventType.OUTPUT_FILES:
            break;
          case SSEEventType.MESSAGE_STOP: {
            if (convId) {
              const prev = streamingStateStore.get(convId);
              if (prev?.message_content?.elements && prev.message_content.elements.length > 0) {
                const streamingMessagePayload: ChatMessage = {
                  resource_type: prev.resource_type,
                  resource_id: prev.resource_id,
                  id: prev.id,
                  conversation_id: convId,
                  message_type: prev.message_type,
                  metadata: prev.metadata || {},
                  timestamp: prev.timestamp,
                  sender_type: prev.sender_type,
                  sender_name: prev.sender_name || 'assistant',
                  message_content: {
                    elements: prev.message_content.elements,
                  },
                };

                setMessages((messagePrev) => {
                  if (streamingMessagePayload.id && messagePrev.some((msg) => msg.id === streamingMessagePayload.id)) {
                    return messagePrev;
                  }
                  return [...messagePrev, streamingMessagePayload];
                });
              }
              streamingStateStore.delete(convId);
            }

            clearStoppingTimer();
            setIsStopping(false);

            if (conversationIdRef.current && config.resourceId && config.resourceType) {
              triggerGetConversation({
                conversationId: conversationIdRef.current,
                resourceId: config.resourceId,
                resourceType: config.resourceType,
                url: config.apiConfig?.getConversationById,
              });
            }

            break;
          }
          default:
        }
      } catch (error) {
        captureException(error);
      }
    },
    [
      dispatch,
      isTaskEvent,
      _conversationId,
      config.resourceId,
      config.resourceType,
      config.apiConfig?.getConversationById,
      triggerGetConversation,
      clearStoppingTimer,
    ],
  );

  useEffect(() => {
    const newConversationId = config.conversationId || null;
    const previousConversationId = conversationIdRef.current;

    conversationIdRef.current = newConversationId;

    if (newConversationId !== previousConversationId) {
      setConversationId(newConversationId);
    }
  }, [config.conversationId]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(resolvedEventType, (data: BaseEventPayload) => {
      const payload = data?.payload as MapAny;
      const matches = isTaskEvent
        ? (payload?.task_id as string) === _conversationId
        : data?.source_id === _conversationId || (payload?.conversation_id as string) === _conversationId;

      if (matches) {
        handleSSEMessage(data);
      }
    });
    return () => sub.unsubscribe();
  }, [handleSSEMessage, _conversationId, sseEventBus, resolvedEventType, isTaskEvent]);

  const handleTaskUpdate = useCallback((data: BaseEventPayload) => {
    if (data.source_id !== conversationIdRef.current) return;

    const payload = data.payload as MapAny;
    const taskId = payload?.task_id as string;
    const status = (payload?.updated_fields as MapAny)?.status as TaskStatus | undefined;

    if (!taskId || !status) return;

    setMessages((prev) =>
      prev.map((msg) => {
        const elements = msg.message_content?.elements;
        if (!elements?.length) return msg;

        let hasUpdate = false;
        const updatedElements = elements.map((el) => {
          if (el.type === BLOCK_TYPE.TASK && el.payload.task_id === taskId) {
            hasUpdate = true;
            return { ...el, payload: { ...el.payload, status } };
          }
          return el;
        });

        if (!hasUpdate) return msg;

        return {
          ...msg,
          message_content: { ...msg.message_content, elements: updatedElements },
        };
      }),
    );
  }, []);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.TASK_UPDATE, handleTaskUpdate);
    return () => sub.unsubscribe();
  }, [sseEventBus, handleTaskUpdate]);

  const handleInputRequiredSse = useCallback(
    (data: BaseEventPayload) => {
      if (!_conversationId) return;

      const payload = data.payload as MapAny | undefined;
      const matchesConversation =
        data.source_id === _conversationId ||
        payload?.conversation_id === _conversationId ||
        (isTaskEvent && payload?.task_id === _conversationId);

      if (!matchesConversation) {
        return;
      }

      dispatch(chatApi.util.invalidateTags([{ type: APITags.GET_CONVERSATION_BY_ID, id: _conversationId }]));

      if (config.resourceId && config.resourceType) {
        void triggerGetConversation({
          conversationId: _conversationId,
          resourceId: config.resourceId,
          resourceType: config.resourceType,
          url: config.apiConfig?.getConversationById,
        });
      } else {
        void refetchConversationHistory();
      }
    },
    [
      _conversationId,
      isTaskEvent,
      dispatch,
      config.resourceId,
      config.resourceType,
      config.apiConfig?.getConversationById,
      triggerGetConversation,
      refetchConversationHistory,
    ],
  );

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.INPUT_REQUIRED, handleInputRequiredSse);
    return () => sub.unsubscribe();
  }, [sseEventBus, handleInputRequiredSse]);

  useEffect(() => {
    if (!isFetchingConversationHistory && conversationHistory) {
      if (conversationHistory?.conversation?.title) {
        config.setHeader?.(conversationHistory.conversation.title);
      }

      if (conversationHistory?.messages?.length > 0) {
        const historyMessages: ChatMessage[] = getHistoryFormattedMessages(conversationHistory);

        // Clean up completed streams once DB history is loaded
        if (config.enableStreaming && conversationIdRef.current) {
          const currentStreamState = streamingStateStore.get(conversationIdRef.current);
          if (currentStreamState && !currentStreamState.is_active) {
            streamingStateStore.delete(conversationIdRef.current);
          }
        }

        // Merge DB history with any in-flight messages not yet persisted
        setMessages((prev) => {
          if (prev.length > 0) {
            const dbMessageIds = new Set(historyMessages.map((m) => m.id).filter(Boolean));
            const replayedMessages = prev.filter((m) => {
              if (!m.id || dbMessageIds.has(m.id)) return false;
              // When streaming is enabled, streaming/SSE assistant messages use a different ID
              // than the persisted DB version, so only keep optimistic user messages
              if (config.enableStreaming) return m.sender_type === SenderType.USER;
              return true;
            });

            if (replayedMessages.length > 0) {
              return [...historyMessages, ...replayedMessages];
            }
          }
          return historyMessages;
        });
      }
    }
  }, [conversationHistory, isFetchingConversationHistory, config.enableStreaming]);

  const sendMessage = useCallback(
    async (messagePayload: ChatMessage, useV2Api?: boolean) => {
      if (!_conversationId) {
        throw new Error('Conversation ID is required to send messages');
      }

      const previousMessageCount = messagesRef.current.length;

      if (messagePayload?.message_content?.file_references?.length) {
        const messageWithFileReferences: ChatMessage = {
          ...messagePayload,
          message_content: {
            ...messagePayload.message_content,
            elements: [
              ...(messagePayload.message_content.elements || []),
              {
                id: 'element_2',
                type: BLOCK_TYPE.FILE_REFERENCES,
                order: 2,
                payload: {
                  file_references: messagePayload.message_content.file_references,
                },
              },
            ],
          },
        };

        setMessages((prev) => [...prev, messageWithFileReferences]);
      } else {
        setMessages((prev) => [...prev, messagePayload]);
      }

      try {
        const response = useV2Api
          ? await sendMessageV2Mutation({
              conversationId: _conversationId,
              body: messagePayload,
              url: config.apiConfig?.sendMessage,
            }).unwrap()
          : await sendMessageMutation({
              conversationId: _conversationId,
              body: messagePayload,
            }).unwrap();

        if (config.resourceId && config.resourceType) {
          triggerGetConversation({
            conversationId: _conversationId,
            resourceId: config.resourceId,
            resourceType: config.resourceType,
            url: config.apiConfig?.getConversationById,
          });
        }

        return response;
      } catch (error) {
        setMessages((prev) => prev.slice(0, previousMessageCount));
        captureException(error);
        throw new Error('Failed to send message. Please try again.');
      }
    },
    [
      _conversationId,
      sendMessageMutation,
      sendMessageV2Mutation,
      config.apiConfig?.sendMessage,
      config.apiConfig?.getConversationById,
      config.resourceId,
      config.resourceType,
      triggerGetConversation,
    ],
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
    isFetchingConversationHistory,
    createConversationV2,
    conversationId: _conversationId,
    setConversationId,
    streamingState,
    isStreaming,
    clearStreamingState,
    stopConversation,
    isStopping,
    isUninitializedConversationHistory,
    isErrorConversationHistory,
    refetchConversationHistory: refetchConversationHistory,
    conversationData: conversationHistory?.conversation,
    inputsRequired: conversationHistory?.inputs_required,
  };
};
