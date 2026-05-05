'use client';

import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { captureException } from '@sentry/browser';
import {
  APITags,
  BLOCK_TYPE,
  chatApi,
  type ChatMessage,
  chatMessageToConversationMessage,
  ChatMessageType,
  ConversationService,
  type CreateConversationPayloadTypeV2,
  getHistoryFormattedMessages,
  getStreamingMessageId,
  inputsRequiredStore,
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
import { extractTaskUpdateFields } from '@zamp-platform/utils';
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useEventBus } from '@/app/_providers/sse-provider';

import { type ConversationEventCallbacks } from '../handlers/conversationEventHandler';
import { conversationSSERegistry } from '../registry/conversationSSERegistry';
import { mergeHistoryWithSSEStatuses } from '../utils/mergeHistoryWithSSEStatuses';
import { type ConversationActions, ConversationActionsContext } from './ConversationActionsContext';
import {
  ConversationBrowserContext,
  type ConversationBrowserState,
  ConversationInputContext,
  type ConversationInputState,
  ConversationMessagesContext,
  type ConversationMessagesState,
  type ConversationState,
  ConversationStateContext,
  ConversationStatusContext,
  type ConversationStatusState,
} from './ConversationStateContext';

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
  const queuedMessagesRef = useRef<ChatMessage[]>([]);
  const conversationIdRef = useRef<string | null>(externalConversationId);
  const setHeaderRef = useRef(setHeader);
  const mountRefetchFiredRef = useRef(false);
  const hasSSEUpdatedStatusesRef = useRef(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [queuedMessages, setQueuedMessages] = useState<ChatMessage[]>([]);
  const [_conversationId, _setConversationId] = useState<string | null>(externalConversationId);
  const [isStopping, setIsStopping] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [mountRefetchDone, setMountRefetchDone] = useState(false);
  const [isBrowserStreamingAvailable, setIsBrowserStreamingAvailable] = useState(false);
  const [browserSessionId, setBrowserSessionId] = useState<string | undefined>(undefined);
  const [taskSummaries, setTaskSummaries] = useState<Record<string, string>>({});
  const [hasStoppedSinceLastUserSend, setHasStoppedSinceLastUserSend] = useState(false);

  const isNewConversationSkip =
    isNewlyCreatedConversationRef.current === externalConversationId ||
    isNewlyCreatedConversationRef.current === _conversationId;
  const isNew = isNewlyCreatedConversationRef.current === _conversationId;
  const shouldSkipConversationFetch = !resourceId || !resourceType || !externalConversationId;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = useDispatch<ThunkDispatch<any, unknown, UnknownAction>>();
  const { sseEventBus } = useEventBus();

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
    error: errorConversationHistory,
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

  const isUninitializedRef = useRef(isUninitializedConversationHistory);
  isUninitializedRef.current = isUninitializedConversationHistory;

  const streamingState = useStreamingState(_conversationId);

  const isStreaming = useMemo(() => streamingState?.is_active ?? false, [streamingState?.is_active]);
  const isStreamingRef = useRef(isStreaming);
  isStreamingRef.current = isStreaming;

  const isAnalysing = useMemo(
    () =>
      !hasStoppedSinceLastUserSend &&
      messages.length > 0 &&
      messages[messages.length - 1]?.sender_type === SenderType.USER,
    [messages, hasStoppedSinceLastUserSend],
  );
  const isAnalysingRef = useRef(isAnalysing);
  isAnalysingRef.current = isAnalysing;

  const streamingMessageId = useMemo(
    () => (conversationHistory ? getStreamingMessageId(conversationHistory) : null),
    [conversationHistory],
  );

  // Use isNewConversationSkip (not shouldSkipConversationFetch) so SSE doesn't open during Redux hydration.
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

        if (_conversationId && resourceId && resourceType && finalMessage.id) {
          const cacheArgs = {
            conversationId: _conversationId,
            resourceId,
            resourceType,
            url: apiConfig?.getConversationById,
          };
          dispatch(
            ConversationService.util.updateQueryData('getConversationById', cacheArgs, (draft) => {
              const finalEntry = chatMessageToConversationMessage(finalMessage, _conversationId);
              const existingIdx = draft.messages.findIndex((m) => m.id === finalMessage.id);
              if (existingIdx === -1) {
                draft.messages.push(finalEntry);
                return;
              }
              draft.messages[existingIdx] = finalEntry;
            }),
          );
        }
      }

      clearStoppingTimer();
      setIsStopping(false);
      setHasStoppedSinceLastUserSend(true);
    },
    [_conversationId, resourceId, resourceType, apiConfig?.getConversationById, dispatch, clearStoppingTimer],
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

    hasSSEUpdatedStatusesRef.current = true;

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

  // Clear "new conversation" skip so the query refetches with inputs_required.
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

  const handleMessagesPickedUp = useCallback(
    (messageIds: string[]) => {
      if (!messageIds?.length) return;
      const idSet = new Set(messageIds);

      const moved = queuedMessagesRef.current.filter((m) => m.id && idSet.has(m.id));
      if (moved.length === 0) return;

      const promoted = moved.map((m) => ({ ...m, state: MessageState.DONE }));

      setQueuedMessages((queued) => queued.filter((m) => !m.id || !idSet.has(m.id)));

      setMessages((prev) => {
        const existing = new Set(prev.map((m) => m.id).filter(Boolean));
        const toAppend = promoted.filter((m) => m.id && !existing.has(m.id));
        return toAppend.length > 0 ? [...prev, ...toAppend] : prev;
      });
      setHasStoppedSinceLastUserSend(false);

      if (_conversationId && resourceId && resourceType) {
        const cacheArgs = {
          conversationId: _conversationId,
          resourceId,
          resourceType,
          url: apiConfig?.getConversationById,
        };
        dispatch(
          ConversationService.util.updateQueryData('getConversationById', cacheArgs, (draft) => {
            const existingIds = new Set(draft.messages.map((m) => m.id));
            for (const m of promoted) {
              if (!m.id) continue;
              if (existingIds.has(m.id)) {
                const target = draft.messages.find((entry) => entry.id === m.id);
                if (target) target.state = MessageState.DONE;
              } else {
                draft.messages.push(chatMessageToConversationMessage(m, _conversationId));
              }
            }
          }),
        );
      }
    },
    [_conversationId, resourceId, resourceType, apiConfig?.getConversationById, dispatch],
  );

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
    setMessages([]);
    setQueuedMessages([]);
    _setConversationId(null);
    conversationIdRef.current = null;
    isNewlyCreatedConversationRef.current = null;
    setHasStoppedSinceLastUserSend(false);
  }, []);

  const clearQueuedMessages = useCallback(() => setQueuedMessages([]), []);

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
        id: conversationPayload.message_id,
      };

      if (messagePayload?.message_content?.references?.length) {
        // Markdown is already at element_2/order:2; prepend REFERENCES at element_1/order:1.
        messagePayload.message_content.elements = [
          {
            id: 'element_1',
            type: BLOCK_TYPE.REFERENCES,
            order: 1,
            payload: {
              references: messagePayload.message_content.references,
            },
          },
          ...(messagePayload.message_content.elements || []),
        ];
      }

      setMessages([messagePayload]);
      setHasStoppedSinceLastUserSend(false);

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

      // Mirror server emit: prepend REFERENCES at element_1/order:1 so optimistic ↔ DB keys match.
      const refs = messagePayload?.message_content?.references;
      const baseMessage: ChatMessage = refs?.length
        ? {
            ...messagePayload,
            message_content: {
              ...messagePayload.message_content,
              elements: [
                {
                  id: 'element_1',
                  type: BLOCK_TYPE.REFERENCES,
                  order: 1,
                  payload: { references: refs },
                },
                ...(messagePayload.message_content.elements ?? []),
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
        setHasStoppedSinceLastUserSend(false);
      }

      try {
        // Translate FE-only `id` → wire `message_id` (what AddMessagePayloadV4 expects).
        const { id: optimisticId, ...rest } = messagePayload;
        const sendBody: ChatMessage & { message_id?: string } = {
          ...rest,
          ...(optimisticId ? { message_id: optimisticId } : {}),
        };

        const response = await sendMessageV2Mutation({
          conversationId: _conversationId,
          body: sendBody,
          url: apiConfig?.sendMessage,
        }).unwrap();

        // Patch queued message with the real DB message ID
        if (shouldQueue && response.message_id) {
          setQueuedMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, id: response.message_id } : m)));
        }
        if (!shouldQueue && resourceId && resourceType) {
          const cacheArgs = {
            conversationId: _conversationId,
            resourceId,
            resourceType,
            url: apiConfig?.getConversationById,
          };
          dispatch(
            ConversationService.util.updateQueryData('getConversationById', cacheArgs, (draft) => {
              const messageId = response.message_id || optimisticId;
              if (!messageId) return;
              if (draft.messages.some((m) => m.id === messageId)) return;
              draft.messages.push(
                chatMessageToConversationMessage({ ...baseMessage, id: messageId }, _conversationId, MessageState.DONE),
              );
            }),
          );
        }

        return response;
      } catch (error) {
        if (shouldQueue) {
          setQueuedMessages((prev) => prev.filter((m) => m.id !== tempId));
        } else {
          setMessages((prev) => prev.filter((m) => m !== baseMessage));
        }
        captureException(error instanceof Error ? error : new Error(String(error)));
        throw new Error('Failed to send message. Please try again.');
      }
    },
    [
      _conversationId,
      sendMessageV2Mutation,
      apiConfig?.sendMessage,
      apiConfig?.getConversationById,
      resourceId,
      resourceType,
      dispatch,
    ],
  );

  const safeRefetchConversationHistory = useCallback(() => {
    if (isUninitializedRef.current) return;
    try {
      refetchConversationHistory();
    } catch {
      // refetch throws if the query has not been started yet (e.g. skip flag toggled between renders)
    }
  }, [refetchConversationHistory]);

  const actionsValue: ConversationActions = useMemo(
    () => ({
      sendMessage,
      createConversationV2,
      stopConversation,
      clearMessages,
      clearQueuedMessages,
      setConversationId,
      refetchConversationHistory: safeRefetchConversationHistory,
    }),
    [
      sendMessage,
      createConversationV2,
      stopConversation,
      clearMessages,
      clearQueuedMessages,
      setConversationId,
      safeRefetchConversationHistory,
    ],
  );

  const initiatedBy = conversationHistory?.conversation?.initiated_by ?? null;

  useEffect(() => {
    const loadedConversationId = conversationHistory?.conversation?.id;
    if (!loadedConversationId || loadedConversationId !== _conversationId) return;

    if ((conversationHistory?.inputs_required?.length ?? 0) > 0) {
      inputsRequiredStore.markPending(loadedConversationId);
    } else {
      inputsRequiredStore.markResolved(loadedConversationId);
    }
  }, [conversationHistory?.conversation?.id, conversationHistory?.inputs_required, _conversationId]);

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
      errorConversationHistory,
      isUninitializedConversationHistory,
      isAnalysing,
      sendMessageError: null,
      sendMessageV2Error,
      createConversationV2Error,
      inputsRequired: conversationHistory?.inputs_required,
      isBrowserStreamingAvailable,
      browserSessionId,
      taskSummaries,
      initiatedBy,
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
      errorConversationHistory,
      isUninitializedConversationHistory,
      isAnalysing,
      sendMessageV2Error,
      createConversationV2Error,
      conversationHistory?.inputs_required,
      isBrowserStreamingAvailable,
      browserSessionId,
      taskSummaries,
      initiatedBy,
    ],
  );

  const messagesValue: ConversationMessagesState = useMemo(
    () => ({
      messages,
      queuedMessages,
      hasMessages: messages.length > 0 || queuedMessages.length > 0,
    }),
    [messages, queuedMessages],
  );

  const statusValue: ConversationStatusState = useMemo(
    () => ({
      conversationId: _conversationId,
      isStreaming,
      isStopping,
      isLoadingConversationHistory,
      isFetchingConversationHistory,
      isCreatingConversationV2,
      isSendingMessage,
      isErrorConversationHistory,
      errorConversationHistory,
      isUninitializedConversationHistory,
      isAnalysing,
      sendMessageError: null,
      sendMessageV2Error,
      createConversationV2Error,
    }),
    [
      _conversationId,
      isStreaming,
      isStopping,
      isLoadingConversationHistory,
      isFetchingConversationHistory,
      isCreatingConversationV2,
      isSendingMessage,
      isErrorConversationHistory,
      errorConversationHistory,
      isUninitializedConversationHistory,
      isAnalysing,
      sendMessageV2Error,
      createConversationV2Error,
    ],
  );

  const inputValue: ConversationInputState = useMemo(
    () => ({
      inputsRequired: conversationHistory?.inputs_required,
      initiatedBy,
    }),
    [conversationHistory?.inputs_required, initiatedBy],
  );

  const browserValue: ConversationBrowserState = useMemo(
    () => ({
      isBrowserStreamingAvailable,
      browserSessionId,
      taskSummaries,
    }),
    [isBrowserStreamingAvailable, browserSessionId, taskSummaries],
  );

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    queuedMessagesRef.current = queuedMessages;
  }, [queuedMessages]);

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

  // Keeps task blocks fresh after the per-conversation SSE channel closes on message_stop.
  const handleGlobalConvTaskUpdate = useCallback(
    (data: BaseEventPayload) => {
      const { taskId, status: rawStatus, sourceId } = extractTaskUpdateFields(data);
      const status = rawStatus as TaskStatus | undefined;

      if (!taskId || !status) return;
      if (sourceId && sourceId !== _conversationId) return;

      handlePerConvTaskUpdate(taskId, { status });
    },
    [handlePerConvTaskUpdate, _conversationId],
  );

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.TASK_UPDATE, handleGlobalConvTaskUpdate);

    return () => sub.unsubscribe();
  }, [sseEventBus, handleGlobalConvTaskUpdate]);

  useEffect(() => {
    const newId = externalConversationId || null;
    const prevId = conversationIdRef.current;
    conversationIdRef.current = newId;
    if (newId !== prevId) {
      _setConversationId(newId);
      setMessages([]);
      setQueuedMessages([]);
      setTaskSummaries({});
      setIsBrowserStreamingAvailable(false);
      setIsHistoryLoaded(false);
      setMountRefetchDone(false);
      setIsStopping(false);
      setHasStoppedSinceLastUserSend(false);
      isNewlyCreatedConversationRef.current = null;
      mountRefetchFiredRef.current = false;
    }
  }, [externalConversationId]);

  // Clear stale streaming state on mount, unless a live background stream is in progress.
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

  // Warm the cache when a background stream completes so navigating back has no loading flash.
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

  // Fetch history before SSE connects so streamingMessageId is accurate. Skipped for new conversations
  // and when a background stream is already live.
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

  // Open the SSE gate once history is loaded — ensures streamingMessageId is set before the URL is built.
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

  // Registry keeps the SSE connection alive across remounts while streaming is active.
  useEffect(() => {
    if (!sseEnabled || !_conversationId) return;

    const callbacks = perConvCallbacks.current;
    conversationSSERegistry.register(_conversationId, resourceId, isNew, streamingMessageId, callbacks);

    return () => {
      conversationSSERegistry.deregister(_conversationId, callbacks);
    };
    // streamingMessageId excluded: connection is already open after mount.
  }, [sseEnabled, _conversationId]);

  // Apply cached data immediately so background-stream switches don't show a blank list.
  useEffect(() => {
    if (!conversationHistory) return;

    if (conversationHistory?.conversation?.title && !isNew) {
      setHeaderRef.current?.(conversationHistory.conversation.title);
    }

    if (conversationHistory?.messages?.length > 0) {
      const allHistoryMessages: ChatMessage[] = getHistoryFormattedMessages(conversationHistory);
      const historyMessages = allHistoryMessages.filter((msg) => msg.state !== MessageState.QUEUED);
      const historyQueuedMessages = allHistoryMessages.filter((msg) => msg.state === MessageState.QUEUED);
      const dbMessageIds = new Set(historyMessages.map((msg) => msg.id).filter(Boolean));
      const dbQueuedMessageIds = new Set(historyQueuedMessages.map((msg) => msg.id).filter(Boolean));

      setQueuedMessages((prev) => {
        const kept = prev.filter((msg) => !msg.id || (!dbMessageIds.has(msg.id) && !dbQueuedMessageIds.has(msg.id)));
        return [...historyQueuedMessages, ...kept];
      });

      setMessages((prev) => {
        const merged = mergeHistoryWithSSEStatuses(prev, historyMessages, hasSSEUpdatedStatusesRef.current);

        hasSSEUpdatedStatusesRef.current = false;

        return merged;
      });
    }
  }, [conversationHistory]);

  useEffect(() => {
    setTaskSummaries({});
  }, [_conversationId]);

  return (
    <ConversationActionsContext.Provider value={actionsValue}>
      <ConversationMessagesContext.Provider value={messagesValue}>
        <ConversationStatusContext.Provider value={statusValue}>
          <ConversationInputContext.Provider value={inputValue}>
            <ConversationBrowserContext.Provider value={browserValue}>
              <ConversationStateContext.Provider value={stateValue}>{children}</ConversationStateContext.Provider>
            </ConversationBrowserContext.Provider>
          </ConversationInputContext.Provider>
        </ConversationStatusContext.Provider>
      </ConversationMessagesContext.Provider>
    </ConversationActionsContext.Provider>
  );
};
