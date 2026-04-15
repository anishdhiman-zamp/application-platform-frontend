'use client';

import { captureException } from '@sentry/browser';
import {
  APITags,
  BLOCK_TYPE,
  chatApi,
  type ChatMessage,
  ChatMessageType,
  type CreateConversationPayloadTypeV2,
  getHistoryFormattedMessages,
  getStreamingMessageId,
  MessageState,
  type ResourceType,
  SenderType,
  streamingStateStore,
  type TaskStatus,
  useCreateConversationV2Mutation,
  useGetConversationByIdQuery,
  useLazyGetConversationByIdQuery,
  useSendMessageV2Mutation,
  useStopConversationMutation,
  useStreamingState,
} from '@zamp-platform/chat';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { type ConversationEventCallbacks } from '../handlers/conversationEventHandler';
import { conversationSSERegistry } from '../registry/conversationSSERegistry';
import { type ConversationActions, ConversationActionsContext } from './ConversationActionsContext';
import { type ConversationState, ConversationStateContext } from './ConversationStateContext';

export interface ConversationProviderProps {
  children: ReactNode;
  conversationId: string | null;
  resourceId: string;
  resourceType: ResourceType;
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
  setHeader,
  apiConfig,
  onConversationIdChange,
}) => {
  const stoppingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNewlyCreatedConversationRef = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const conversationIdRef = useRef<string | null>(externalConversationId);
  const setHeaderRef = useRef(setHeader);
  const mountRefetchFiredRef = useRef(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [queuedMessages, setQueuedMessages] = useState<ChatMessage[]>([]);
  const [_conversationId, _setConversationId] = useState<string | null>(externalConversationId);
  const [isStopping, setIsStopping] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [mountRefetchDone, setMountRefetchDone] = useState(false);
  const [isBrowserStreamingAvailable, setIsBrowserStreamingAvailable] = useState(false);
  const [browserSessionId, setBrowserSessionId] = useState<string | undefined>(undefined);
  const [taskSummaries, setTaskSummaries] = useState<Record<string, string>>({});

  // True only for newly created conversations — permanent skip, not a transient resourceId gap.
  const isNewConversationSkip =
    isNewlyCreatedConversationRef.current === externalConversationId ||
    isNewlyCreatedConversationRef.current === _conversationId;
  const isNew = isNewlyCreatedConversationRef.current === _conversationId;
  const shouldSkipConversationFetch = !resourceId || !resourceType || !externalConversationId;

  const dispatch = useDispatch();

  const [createConversationV2Mutation, { isLoading: isCreatingConversationV2, error: createConversationV2Error }] =
    useCreateConversationV2Mutation();
  const [sendMessageV2Mutation, { isLoading: isSendingMessage, error: sendMessageV2Error }] =
    useSendMessageV2Mutation();
  const [triggerGetConversation] = useLazyGetConversationByIdQuery();
  const [stopConversationMutation] = useStopConversationMutation();

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
  const streamingState = useStreamingState(_conversationId);

  const isStreaming = useMemo(() => streamingState?.is_active ?? false, [streamingState?.is_active]);
  const isStreamingRef = useRef(isStreaming);
  isStreamingRef.current = isStreaming;

  const [isAnalysing, setIsAnalysing] = useState(false);
  const isAnalysingRef = useRef(isAnalysing);
  isAnalysingRef.current = isAnalysing;

  const hasStreamingContent = (streamingState?.message_content?.elements?.length ?? 0) > 0;

  useEffect(() => {
    if (hasStreamingContent) setIsAnalysing(false);
  }, [hasStreamingContent]);

  const streamingMessageId = useMemo(
    () => (conversationHistory ? getStreamingMessageId(conversationHistory) : null),
    [conversationHistory],
  );

  // isNewConversationSkip (not shouldSkipConversationFetch) avoids opening SSE while
  // resourceId is transiently empty during Redux hydration.
  const historyReady = isNew || isNewConversationSkip || isHistoryLoaded;
  const sseEnabled = Boolean(_conversationId) && Boolean(resourceId) && historyReady;

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
      refetchConversationHistory();

      clearStoppingTimer();
      setIsStopping(false);
    },
    [clearStoppingTimer, refetchConversationHistory],
  );

  const handlePerConvTitleUpdated = useCallback((title: string) => {
    setHeaderRef.current?.(title);
  }, []);

  const handleBrowserStreamingAvailable = useCallback((_convId: string, sessionId?: string) => {
    setIsBrowserStreamingAvailable(true);
    setBrowserSessionId(sessionId);
  }, []);

  const handleBrowserStreamingUnavailable = useCallback(() => {
    setIsBrowserStreamingAvailable(false);
    setBrowserSessionId(undefined);
  }, []);

  const handlePerConvTaskUpdate = useCallback((taskId: string, updatedFields: Record<string, unknown>) => {
    const status = updatedFields?.status as TaskStatus | undefined;
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

  // Handle input_required events arriving on the per-conversation SSE channel.
  // Clear the "new conversation" skip flag so the query can refetch with inputs_required.
  const handlePerConvInputRequired = useCallback(() => {
    if (_conversationId) {
      isNewlyCreatedConversationRef.current = null;
      dispatch(chatApi.util.invalidateTags([{ type: APITags.GET_CONVERSATION_BY_ID, id: _conversationId }]));
    }
  }, [_conversationId, dispatch]);

  const handlePerConvTaskSummary = useCallback((taskId: string, text: string) => {
    setTaskSummaries((prev) => {
      if (prev[taskId] === text) return prev;
      return { ...prev, [taskId]: text };
    });
  }, []);

  const handleMessagesPickedUp = useCallback((messageIds: string[]) => {
    const idSet = new Set(messageIds);
    setQueuedMessages((prev) => prev.filter((m) => !m.id || !idSet.has(m.id)));
  }, []);

  const perConvCallbacks = useRef<ConversationEventCallbacks>({
    onTitleUpdated: handlePerConvTitleUpdated,
    onMessageStop: handlePerConvMessageStop,
    onBrowserStreamingAvailable: handleBrowserStreamingAvailable,
    onBrowserStreamingUnavailable: handleBrowserStreamingUnavailable,
    onTaskUpdate: handlePerConvTaskUpdate,
    onTaskSummary: handlePerConvTaskSummary,
    onInputRequired: handlePerConvInputRequired,
    onMessagesPickedUp: handleMessagesPickedUp,
  });

  const setConversationId = useCallback(
    (id: string | null) => {
      conversationIdRef.current = id;
      _setConversationId(id);
      onConversationIdChange?.(id);
    },
    [onConversationIdChange],
  );

  const clearMessages = useCallback(() => {
    if (conversationIdRef.current) {
      streamingStateStore.delete(conversationIdRef.current);
    }
    setMessages([]);
    setQueuedMessages([]);
    setIsAnalysing(false);
    _setConversationId(null);
    conversationIdRef.current = null;
    isNewlyCreatedConversationRef.current = null;
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
      captureException(error instanceof Error ? error : new Error(String(error)));
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
        const existingElements = (messagePayload.message_content.elements || []).map((el) => ({
          ...el,
          order: el.order + 1,
        }));
        messagePayload.message_content.elements = [
          {
            id: 'element_file_refs',
            type: BLOCK_TYPE.FILE_REFERENCES,
            order: 0,
            payload: {
              file_references: messagePayload.message_content.file_references,
            },
          },
          ...existingElements,
        ];
      }

      setMessages([messagePayload]);
      setIsAnalysing(true);

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

        return response;
      } catch (error) {
        setMessages([]);
        setIsAnalysing(false);
        captureException(error instanceof Error ? error : new Error(String(error)));
        throw new Error('Failed to start conversation. Please try again.');
      }
    },
    [
      createConversationV2Mutation,
      apiConfig?.createConversation,
      apiConfig?.getConversationById,
      resourceId,
      resourceType,
      setConversationId,
      triggerGetConversation,
    ],
  );

  const sendMessage = useCallback(
    async (messagePayload: ChatMessage) => {
      if (!_conversationId) {
        throw new Error('Conversation ID is required to send messages');
      }

      const tempId = crypto.randomUUID();

      const baseMessage: ChatMessage = messagePayload?.message_content?.file_references?.length
        ? {
            ...messagePayload,
            message_content: {
              ...messagePayload.message_content,
              elements: [
                {
                  id: 'element_file_refs',
                  type: BLOCK_TYPE.FILE_REFERENCES,
                  order: 0,
                  payload: {
                    file_references: messagePayload.message_content.file_references,
                  },
                },
                ...(messagePayload.message_content.elements || []).map((el) => ({
                  ...el,
                  order: el.order + 1,
                })),
              ],
            },
          }
        : messagePayload;

      const shouldQueue = isStreamingRef.current || isAnalysingRef.current;

      if (shouldQueue) {
        const messageToQueue: ChatMessage = { ...baseMessage, id: tempId, state: MessageState.QUEUED };
        setQueuedMessages((prev) => [...prev, messageToQueue]);
      } else {
        setMessages((prev) => [...prev, baseMessage]);
        setIsAnalysing(true);
      }

      try {
        const response = await sendMessageV2Mutation({
          conversationId: _conversationId,
          body: messagePayload,
          url: apiConfig?.sendMessage,
        }).unwrap();

        // Patch queued message with the real DB message ID
        if (shouldQueue && response.message_id) {
          setQueuedMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, id: response.message_id } : m)));
        }

        return response;
      } catch (error) {
        if (shouldQueue) {
          setQueuedMessages((prev) => prev.filter((m) => m.id !== tempId));
        } else {
          setMessages((prev) => prev.filter((m) => m !== baseMessage));
          setIsAnalysing(false);
        }
        captureException(error instanceof Error ? error : new Error(String(error)));
        throw new Error('Failed to send message. Please try again.');
      }
    },
    [_conversationId, sendMessageV2Mutation, apiConfig?.sendMessage],
  );

  const isUninitializedRef = useRef(isUninitializedConversationHistory);
  useEffect(() => {
    isUninitializedRef.current = isUninitializedConversationHistory;
  }, [isUninitializedConversationHistory]);

  const safeRefetchConversationHistory = useCallback(() => {
    if (isUninitializedRef.current) return;
    refetchConversationHistory();
  }, [refetchConversationHistory]);

  const actionsValue: ConversationActions = useMemo(
    () => ({
      sendMessage,
      createConversationV2,
      stopConversation,
      clearMessages,
      setConversationId,
      refetchConversationHistory: safeRefetchConversationHistory,
    }),
    [
      sendMessage,
      createConversationV2,
      stopConversation,
      clearMessages,
      setConversationId,
      safeRefetchConversationHistory,
    ],
  );

  const stateValue: ConversationState = useMemo(
    () => ({
      messages,
      queuedMessages,
      hasMessages: messages.length > 0 || queuedMessages.length > 0,
      conversationId: _conversationId,
      isStreaming,
      isStopping,
      isLoadingConversationHistory,
      isFetchingConversationHistory,
      isCreatingConversationV2,
      isSendingMessage,
      isErrorConversationHistory,
      isUninitializedConversationHistory,
      isAnalysing,
      sendMessageError: null,
      sendMessageV2Error,
      createConversationV2Error,
      inputsRequired: conversationHistory?.inputs_required,
      isBrowserStreamingAvailable,
      browserSessionId,
      taskSummaries,
    }),
    [
      messages,
      queuedMessages,
      _conversationId,
      isStreaming,
      isStopping,
      isLoadingConversationHistory,
      isFetchingConversationHistory,
      isCreatingConversationV2,
      isSendingMessage,
      isErrorConversationHistory,
      isUninitializedConversationHistory,
      isAnalysing,
      sendMessageV2Error,
      createConversationV2Error,
      conversationHistory?.inputs_required,
      isBrowserStreamingAvailable,
      browserSessionId,
      taskSummaries,
    ],
  );

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    setHeaderRef.current = setHeader;
  }, [setHeader]);

  useEffect(() => {
    perConvCallbacks.current = {
      onTitleUpdated: handlePerConvTitleUpdated,
      onMessageStop: handlePerConvMessageStop,
      onBrowserStreamingAvailable: handleBrowserStreamingAvailable,
      onBrowserStreamingUnavailable: handleBrowserStreamingUnavailable,
      onTaskUpdate: handlePerConvTaskUpdate,
      onTaskSummary: handlePerConvTaskSummary,
      onInputRequired: handlePerConvInputRequired,
      onMessagesPickedUp: handleMessagesPickedUp,
    };
  }, [
    handlePerConvTitleUpdated,
    handlePerConvMessageStop,
    handleBrowserStreamingAvailable,
    handleBrowserStreamingUnavailable,
    handlePerConvTaskUpdate,
    handlePerConvTaskSummary,
    handlePerConvInputRequired,
    handleMessagesPickedUp,
  ]);

  useEffect(() => {
    const newId = externalConversationId || null;
    const prevId = conversationIdRef.current;
    conversationIdRef.current = newId;
    if (newId !== prevId) {
      _setConversationId(newId);
      setMessages([]);
      setQueuedMessages([]);
      setIsAnalysing(false);
      setTaskSummaries({});
      setIsBrowserStreamingAvailable(false);
      setIsHistoryLoaded(false);
      setMountRefetchDone(false);
      setIsStopping(false);
      isNewlyCreatedConversationRef.current = null;
      mountRefetchFiredRef.current = false;
    }
  }, [externalConversationId]);

  // Clear stale streaming state on mount, unless the registry has a live background
  // stream — in that case the store already has fresh in-progress content.
  useEffect(() => {
    if (externalConversationId) {
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
    return () => {
      if (stoppingTimerRef.current) clearTimeout(stoppingTimerRef.current);
    };
  }, []);

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
      .catch((error) => captureException(error instanceof Error ? error : new Error(String(error))))
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

  // Apply cached data immediately (isFetchingConversationHistory may be true during refetch).
  // This prevents a blank message list while a background-stream conversation is switching back —
  // the cache already has prior history; we don't need to wait for the fresh response.
  useEffect(() => {
    if (!conversationHistory) return;

    if (conversationHistory?.conversation?.title && !isNew) {
      setHeaderRef.current?.(conversationHistory.conversation.title);
    }

    if (conversationHistory?.messages?.length > 0) {
      const historyMessages: ChatMessage[] = getHistoryFormattedMessages(conversationHistory);
      const dbMessageIds = new Set(historyMessages.map((m) => m.id).filter(Boolean));

      // Remove queued messages that now appear in history (picked up by agent)
      setQueuedMessages((prev) => prev.filter((m) => !m.id || !dbMessageIds.has(m.id)));

      setMessages((prev) => {
        if (prev.length > 0) {
          const replayedMessages = prev.filter((m) => {
            if (!m.id || dbMessageIds.has(m.id)) return false;
            return m.sender_type === SenderType.USER;
          });

          if (replayedMessages.length > 0) {
            return [...historyMessages, ...replayedMessages];
          }
        }
        return historyMessages;
      });
    }
  }, [conversationHistory]);

  useEffect(() => {
    setTaskSummaries({});
  }, [_conversationId]);

  return (
    <ConversationActionsContext.Provider value={actionsValue}>
      <ConversationStateContext.Provider value={stateValue}>{children}</ConversationStateContext.Provider>
    </ConversationActionsContext.Provider>
  );
};
