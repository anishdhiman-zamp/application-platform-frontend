'use client';

import { type UnknownAction } from '@reduxjs/toolkit';
import { captureException, withScope } from '@sentry/browser';
import {
  APITags,
  BLOCK_TYPE,
  chatApi,
  type ChatMessage,
  ChatMessageType,
  type ConversationMessageType,
  ConversationService,
  type CreateConversationPayloadTypeV2,
  type GetConversationByIdRequestType,
  getHistoryFormattedMessages,
  getStreamingMessageId,
  MessageState,
  type ResourceType,
  SenderType,
  SSEEventType,
  streamingStateStore,
  type TaskStatus,
  useCreateConversationV2Mutation,
  useGetConversationByIdQuery,
  useLazyGetConversationByIdQuery,
  useSendMessageV2Mutation,
  useStopConversationMutation,
  useStreamingState,
} from '@zamp-platform/chat';
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useEventBus } from '@/app/_providers/sse-provider';
import type { MapAny } from '@/types/commonTypes';

import { type ConversationEventCallbacks } from '../handlers/conversationEventHandler';
import { conversationSSERegistry } from '../registry/conversationSSERegistry';
import { type ConversationActions, ConversationActionsContext } from './ConversationActionsContext';
import { type ConversationState, ConversationStateContext } from './ConversationStateContext';

export interface ConversationProviderProps {
  children: ReactNode;
  conversationId: string | null;
  resourceId: string;
  resourceType: ResourceType;
  enableStreaming?: boolean;
  usePerConversationSSE?: boolean;
  setHeader?: (header: string) => void;
  apiConfig?: {
    getConversationById?: string;
    sendMessage?: string;
    createConversation?: string;
  };
  onConversationIdChange?: (id: string | null) => void;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({
  children,
  conversationId: externalConversationId,
  resourceId,
  resourceType,
  enableStreaming = true,
  usePerConversationSSE: usePerConvSSE = false,
  setHeader,
  apiConfig,
  onConversationIdChange,
}) => {
  const dispatch = useDispatch();
  const { sseEventBus } = useEventBus();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [_conversationId, _setConversationId] = useState<string | null>(externalConversationId);
  const [isStopping, setIsStopping] = useState(false);
  // Flips to true once fresh history has settled; resets on remount. SSE waits for it.
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  // State (not ref) so the SSE gate re-runs when the mount refetch completes.
  const [mountRefetchDone, setMountRefetchDone] = useState(false);

  const messagesRef = useRef<ChatMessage[]>(messages);
  const conversationIdRef = useRef<string | null>(_conversationId);
  const stoppingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNewlyCreatedConversationRef = useRef<string | null>(null);
  const setHeaderRef = useRef(setHeader);

  // Clear stale streaming state on mount, unless the registry has a live background
  // stream — in that case the store already has fresh in-progress content.
  useEffect(() => {
    if (externalConversationId && enableStreaming) {
      const hasLiveBackgroundStream =
        conversationSSERegistry.isConnected(externalConversationId) &&
        streamingStateStore.get(externalConversationId)?.is_active === true;
      if (!hasLiveBackgroundStream) {
        streamingStateStore.delete(externalConversationId);
      }
    }
  }, []);

  // When a background stream completes, proactively refetch that conversation's history
  // so the cache is warm before the user navigates back — no loading flash on return.
  // Uses triggerGetConversation with the current provider's resourceId/resourceType,
  // which are stable for the lifetime of this provider.
  useEffect(() => {
    if (!resourceId || !resourceType) return;

    return conversationSSERegistry.setOnBackgroundStop((convId) => {
      triggerGetConversation({
        conversationId: convId,
        resourceId,
        resourceType,
        url: apiConfig?.getConversationById,
      });
    });
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    setHeaderRef.current = setHeader;
  }, [setHeader]);

  const streamingState = useStreamingState(_conversationId);
  const isStreaming = useMemo(
    () => (enableStreaming ? (streamingState?.is_active ?? false) : false),
    [enableStreaming, streamingState?.is_active],
  );

  const [createConversationV2Mutation, { isLoading: isCreatingConversationV2, error: createConversationV2Error }] =
    useCreateConversationV2Mutation();
  const [sendMessageV2Mutation, { isLoading: isSendingMessage, error: sendMessageV2Error }] =
    useSendMessageV2Mutation();
  const [triggerGetConversation] = useLazyGetConversationByIdQuery();
  const [stopConversationMutation] = useStopConversationMutation();

  // True only for newly created conversations — permanent skip, not a transient resourceId gap.
  const isNewConversationSkip =
    isNewlyCreatedConversationRef.current === externalConversationId ||
    isNewlyCreatedConversationRef.current === _conversationId;

  const shouldSkipConversationFetch = !resourceId || !resourceType || !externalConversationId || isNewConversationSkip;

  const {
    data: conversationHistory,
    isLoading: isLoadingConversationHistory,
    isFetching: isFetchingConversationHistory,
    isUninitialized: isUninitializedConversationHistory,
    isError: isErrorConversationHistory,
    refetch: refetchConversationHistory,
  } = useGetConversationByIdQuery(
    {
      conversationId: externalConversationId || '',
      resourceId,
      resourceType,
      url: apiConfig?.getConversationById,
    },
    { skip: shouldSkipConversationFetch },
  );

  useEffect(() => {
    const newId = externalConversationId || null;
    const prevId = conversationIdRef.current;
    conversationIdRef.current = newId;
    if (newId !== prevId) {
      _setConversationId(newId);
    }
  }, [externalConversationId]);

  useEffect(() => {
    return () => {
      if (stoppingTimerRef.current) clearTimeout(stoppingTimerRef.current);
    };
  }, []);

  const clearStoppingTimer = useCallback(() => {
    if (stoppingTimerRef.current) {
      clearTimeout(stoppingTimerRef.current);
      stoppingTimerRef.current = null;
    }
  }, []);

  const handlePerConvMessageStop = useCallback(
    (finalMessage: ChatMessage | null) => {
      if (finalMessage) {
        setMessages((prev) => {
          if (finalMessage.id && prev.some((msg) => msg.id === finalMessage.id)) return prev;
          return [...prev, finalMessage];
        });
      }
      clearStoppingTimer();
      setIsStopping(false);
    },
    [clearStoppingTimer],
  );

  const handlePerConvTitleUpdated = useCallback((title: string) => {
    setHeaderRef.current?.(title);
  }, []);

  const perConvCallbacks = useRef<ConversationEventCallbacks>({
    onTitleUpdated: handlePerConvTitleUpdated,
    onMessageStop: handlePerConvMessageStop,
  });
  useEffect(() => {
    perConvCallbacks.current = {
      onTitleUpdated: handlePerConvTitleUpdated,
      onMessageStop: handlePerConvMessageStop,
    };
  }, [handlePerConvTitleUpdated, handlePerConvMessageStop]);

  const isNew = isNewlyCreatedConversationRef.current === _conversationId;

  // Fires the mount refetch exactly once after both resourceId and conversationId are available.
  const mountRefetchFiredRef = useRef(false);

  // Fetch fresh history on mount so streamingMessageId is correct before SSE connects.
  // Waits for resourceId (may be empty on first render while Redux hydrates).
  // Skipped for new conversations and when the registry already has a live background stream.
  useEffect(() => {
    if (mountRefetchFiredRef.current) return;
    if (!resourceId || !externalConversationId) return;

    mountRefetchFiredRef.current = true;

    const hasLiveBackgroundStream =
      conversationSSERegistry.isConnected(externalConversationId) &&
      streamingStateStore.get(externalConversationId)?.is_active === true;

    if (isNew || isNewConversationSkip || hasLiveBackgroundStream) {
      setMountRefetchDone(true);
      return;
    }

    refetchConversationHistory()
      .catch((error) =>
        withScope((scope) => {
          scope.setTag('operation', 'mount_refetch');
          scope.setContext('conversation', { conversationId: externalConversationId });
          captureException(error instanceof Error ? error : new Error(String(error)));
        }),
      )
      .finally(() => {
        setMountRefetchDone(true);
      });
  }, [resourceId, externalConversationId]);

  // Open the SSE gate once the refetch has completed and RTK has delivered history data.
  // Ensures streamingMessageId is accurate before the SSE URL is built.
  useEffect(() => {
    if (!mountRefetchDone) return;
    if (isNew || isNewConversationSkip) {
      setIsHistoryLoaded(true);
      return;
    }
    if (!isFetchingConversationHistory && !isUninitializedConversationHistory && conversationHistory !== undefined) {
      setIsHistoryLoaded(true);
    }
  }, [
    mountRefetchDone,
    isFetchingConversationHistory,
    isUninitializedConversationHistory,
    isNew,
    isNewConversationSkip,
    conversationHistory,
  ]);

  const streamingMessageId = useMemo(
    () => (conversationHistory ? getStreamingMessageId(conversationHistory) : null),
    [conversationHistory],
  );

  // isNewConversationSkip (not shouldSkipConversationFetch) avoids opening SSE while
  // resourceId is transiently empty during Redux hydration.
  const historyReady = isNew || isNewConversationSkip || isHistoryLoaded;
  const sseEnabled =
    usePerConvSSE && enableStreaming && Boolean(_conversationId) && Boolean(resourceId) && historyReady;

  // Register with the global SSE registry when ready.
  // The registry keeps the connection alive across remounts while streaming is active.
  // On unmount, deregister — the registry decides whether to close or keep the connection.
  useEffect(() => {
    if (!sseEnabled || !_conversationId) return;

    const callbacks = perConvCallbacks.current;
    conversationSSERegistry.register(_conversationId, resourceId, isNew, streamingMessageId, callbacks);

    return () => {
      conversationSSERegistry.deregister(_conversationId, callbacks);
    };
    // streamingMessageId excluded: connection is already open after mount; reconnect is external.
  }, [sseEnabled, _conversationId]);

  const setConversationId = useCallback(
    (id: string | null) => {
      conversationIdRef.current = id;
      _setConversationId(id);
      onConversationIdChange?.(id);
    },
    [onConversationIdChange],
  );

  const clearMessages = useCallback(() => {
    if (enableStreaming && conversationIdRef.current) {
      streamingStateStore.delete(conversationIdRef.current);
    }
    setMessages([]);
    _setConversationId(null);
    conversationIdRef.current = null;
    isNewlyCreatedConversationRef.current = null;
  }, [enableStreaming]);

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
      withScope((scope) => {
        scope.setTag('operation', 'stop_conversation');
        scope.setContext('conversation', { conversationId: _conversationId });
        captureException(error instanceof Error ? error : new Error(String(error)));
      });
      throw new Error('Failed to stop conversation. Please try again.');
    }
  }, [_conversationId, stopConversationMutation, isStopping, clearStoppingTimer]);

  const createConversationV2 = useCallback(
    async (conversationPayload: CreateConversationPayloadTypeV2) => {
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
          url: apiConfig?.createConversation,
        }).unwrap();

        setConversationId(response.conversation_id);
        isNewlyCreatedConversationRef.current = response.conversation_id;

        if (resourceId && resourceType) {
          triggerGetConversation({
            conversationId: response.conversation_id,
            resourceId,
            resourceType,
            url: apiConfig?.getConversationById,
          });
        }

        if (response.title && !enableStreaming) {
          setHeaderRef.current?.(response.title);
        }

        return response;
      } catch (error) {
        setMessages([]);
        withScope((scope) => {
          scope.setTag('operation', 'create_conversation');
          scope.setContext('conversation', { resourceId, resourceType });
          captureException(error instanceof Error ? error : new Error(String(error)));
        });
        throw new Error('Failed to start conversation. Please try again.');
      }
    },
    [
      createConversationV2Mutation,
      apiConfig?.createConversation,
      apiConfig?.getConversationById,
      resourceId,
      resourceType,
      enableStreaming,
      setConversationId,
      triggerGetConversation,
    ],
  );

  const appendUserMessageToCache = useCallback(
    (conversationId: string, messagePayload: ChatMessage) => {
      if (!resourceId || !resourceType) return;

      const cacheMessage: ConversationMessageType = {
        id: messagePayload.id || `optimistic-${Date.now()}`,
        organization_id: messagePayload.resource_id || '',
        conversation_id: conversationId,
        sender_id: '',
        sender_type: messagePayload.sender_type,
        sender_name: messagePayload.sender_name || '',
        state: MessageState.DONE,
        intent: null,
        content: { elements: messagePayload.message_content?.elements || [] },
        created_at: messagePayload.timestamp || new Date().toISOString(),
        deleted_at: null,
      };

      const queryArgs: GetConversationByIdRequestType = {
        conversationId,
        resourceId,
        resourceType,
        url: apiConfig?.getConversationById,
      };

      // updateQueryData returns a ThunkAction typed against the app's RootState.
      // This package's dispatch doesn't carry that RootState type, so we cast
      // the thunk to UnknownAction — the runtime behavior is identical.
      try {
        dispatch(
          ConversationService.util.updateQueryData('getConversationById', queryArgs, (draft) => {
            if (!draft.messages.some((m) => m.id === cacheMessage.id)) {
              draft.messages.push(cacheMessage);
            }
          }) as unknown as UnknownAction,
        );
      } catch (error) {
        withScope((scope) => {
          scope.setTag('operation', 'append_user_message_cache');
          scope.setContext('conversation', { conversationId, messageId: cacheMessage.id });
          captureException(error instanceof Error ? error : new Error(String(error)));
        });
      }
    },
    [dispatch, resourceId, resourceType, apiConfig?.getConversationById],
  );

  const sendMessage = useCallback(
    async (messagePayload: ChatMessage) => {
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
        appendUserMessageToCache(_conversationId, messageWithFileReferences);
      } else {
        setMessages((prev) => [...prev, messagePayload]);
        appendUserMessageToCache(_conversationId, messagePayload);
      }

      try {
        const response = await sendMessageV2Mutation({
          conversationId: _conversationId,
          body: messagePayload,
          url: apiConfig?.sendMessage,
        }).unwrap();

        return response;
      } catch (error) {
        setMessages((prev) => prev.slice(0, previousMessageCount));
        withScope((scope) => {
          scope.setTag('operation', 'send_message');
          scope.setContext('conversation', { conversationId: _conversationId });
          captureException(error instanceof Error ? error : new Error(String(error)));
        });
        throw new Error('Failed to send message. Please try again.');
      }
    },
    [_conversationId, sendMessageV2Mutation, apiConfig?.sendMessage, appendUserMessageToCache],
  );

  // Global SSE event handler (used when usePerConvSSE is false).
  const handleSSEMessage = useCallback(
    (data: MapAny) => {
      try {
        const convId = (data.payload?.conversation_id as string) || conversationIdRef.current;

        switch (data.payload.type) {
          case SSEEventType.MESSAGE:
          case SSEEventType.NEW_CHAT_MESSAGE: {
            const newMessage: ChatMessage = data.payload.message;
            setMessages((prev) => {
              if (newMessage.id && prev.some((msg) => msg.id === newMessage.id)) return prev;
              return [...prev, { ...newMessage, timestamp: new Date().toISOString() }];
            });

            const invalidationId = newMessage.conversation_id;
            if (invalidationId && isNewlyCreatedConversationRef.current !== invalidationId) {
              dispatch(chatApi.util.invalidateTags([{ type: APITags.GET_CONVERSATION_BY_ID, id: invalidationId }]));
            }
            break;
          }
          case SSEEventType.CONVERSATION_UPDATED:
            if (_conversationId && isNewlyCreatedConversationRef.current !== _conversationId) {
              dispatch(chatApi.util.invalidateTags([{ type: APITags.GET_CONVERSATION_BY_ID, id: _conversationId }]));
            }
            break;
          case SSEEventType.TITLE_UPDATED:
            if (enableStreaming) {
              const title = data.payload?.title;
              setHeaderRef.current?.(title);
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
            break;
          }
          default:
        }
      } catch (error) {
        withScope((scope) => {
          scope.setTag('operation', 'handle_sse_message');
          scope.setContext('conversation', { conversationId: _conversationId });
          captureException(error instanceof Error ? error : new Error(String(error)));
        });
      }
    },
    [dispatch, _conversationId, enableStreaming, clearStoppingTimer],
  );

  // Subscribe to global SSE events when per-conversation SSE is not active.
  useEffect(() => {
    if (usePerConvSSE) return;

    const sub = sseEventBus.subscribe(EVENT_TYPE.CONVERSATION_V2, (data: BaseEventPayload) => {
      const payload = data?.payload as MapAny;
      const matches = data?.source_id === _conversationId || (payload?.conversation_id as string) === _conversationId;
      if (matches) {
        handleSSEMessage(data);
      }
    });
    return () => sub.unsubscribe();
  }, [handleSSEMessage, _conversationId, sseEventBus, usePerConvSSE]);

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
        return { ...msg, message_content: { ...msg.message_content, elements: updatedElements } };
      }),
    );
  }, []);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.TASK_UPDATE, handleTaskUpdate);
    return () => sub.unsubscribe();
  }, [sseEventBus, handleTaskUpdate]);

  useEffect(() => {
    // Apply cached data immediately (isFetchingConversationHistory may be true during refetch).
    // This prevents a blank message list while a background-stream conversation is switching back —
    // the cache already has prior history; we don't need to wait for the fresh response.
    if (!conversationHistory) return;

    if (conversationHistory?.conversation?.title) {
      setHeaderRef.current?.(conversationHistory.conversation.title);
    }

    if (conversationHistory?.messages?.length > 0) {
      const historyMessages: ChatMessage[] = getHistoryFormattedMessages(conversationHistory);

      setMessages((prev) => {
        if (prev.length > 0) {
          const dbMessageIds = new Set(historyMessages.map((m) => m.id).filter(Boolean));
          const replayedMessages = prev.filter((m) => {
            if (!m.id || dbMessageIds.has(m.id)) return false;
            if (enableStreaming) return m.sender_type === SenderType.USER;
            return true;
          });

          if (replayedMessages.length > 0) {
            return [...historyMessages, ...replayedMessages];
          }
        }
        return historyMessages;
      });
    }
  }, [conversationHistory, enableStreaming]);

  const actionsValue: ConversationActions = useMemo(
    () => ({
      sendMessage,
      createConversationV2,
      stopConversation,
      clearMessages,
      setConversationId,
      refetchConversationHistory,
    }),
    [sendMessage, createConversationV2, stopConversation, clearMessages, setConversationId, refetchConversationHistory],
  );

  const stateValue: ConversationState = useMemo(
    () => ({
      messages,
      conversationId: _conversationId,
      isStreaming,
      isStopping,
      isLoadingConversationHistory,
      isFetchingConversationHistory,
      isCreatingConversationV2,
      isSendingMessage,
      isErrorConversationHistory,
      isUninitializedConversationHistory,
      sendMessageError: null,
      sendMessageV2Error,
      createConversationV2Error,
    }),
    [
      messages,
      _conversationId,
      isStreaming,
      isStopping,
      isLoadingConversationHistory,
      isFetchingConversationHistory,
      isCreatingConversationV2,
      isSendingMessage,
      isErrorConversationHistory,
      isUninitializedConversationHistory,
      sendMessageV2Error,
      createConversationV2Error,
    ],
  );

  return (
    <ConversationActionsContext.Provider value={actionsValue}>
      <ConversationStateContext.Provider value={stateValue}>{children}</ConversationStateContext.Provider>
    </ConversationActionsContext.Provider>
  );
};
