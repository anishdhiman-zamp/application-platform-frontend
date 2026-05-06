'use client';

import { captureException } from '@sentry/browser';
import {
  APITags,
  BLOCK_TYPE,
  chatApi,
  type ChatMessage,
  getHistoryFormattedMessages,
  getStreamingMessageId,
  type ResourceType,
  streamingStateStore,
  type TaskStatus,
  useGetConversationByIdQuery,
  useStreamingState,
} from '@zamp-platform/chat';
import { extractTaskUpdateFields } from '@zamp-platform/utils';
import { type BaseEventPayload, EVENT_TYPE, useEventBus } from '@zamp-platform/utils/event-bus';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { taskSSERegistry } from '../registry/taskSSERegistry';
import { type TaskEventCallbacks } from '../types/task-sse.types';
import { mergeHistoryWithSSEStatuses } from '../utils/mergeHistoryWithSSEStatuses';
import { type TaskActions, TaskActionsContext } from './TaskActionsContext';
import { type TaskState, TaskStateContext } from './TaskStateContext';

export interface TaskProviderProps {
  children: ReactNode;
  taskId: string;
  organizationId: string;
  resourceType: ResourceType;
  apiConfig?: {
    getTaskMessages?: string;
  };
}

export const TaskProvider = ({ children, taskId, organizationId, resourceType, apiConfig }: TaskProviderProps) => {
  const dispatch = useDispatch();
  const { sseEventBus } = useEventBus();

  const mountRefetchFiredRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  const hasSSEUpdatedStatusesRef = useRef(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [taskSummaryText, setTaskSummaryText] = useState<string | null>(null);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [mountRefetchDone, setMountRefetchDone] = useState(false);
  const [isBrowserStreamingAvailable, setIsBrowserStreamingAvailable] = useState(false);
  const [browserSessionId, setBrowserSessionId] = useState<string | undefined>(undefined);

  const {
    data: taskHistory,
    isLoading: isLoadingHistory,
    isFetching: isFetchingHistory,
    isUninitialized: isUninitializedHistory,
    isError: isErrorHistory,
    error: errorHistory,
    refetch: refetchHistory,
  } = useGetConversationByIdQuery(
    {
      conversationId: taskId,
      resourceId: organizationId,
      resourceType,
      url: apiConfig?.getTaskMessages,
    },
    { skip: !taskId || !organizationId, refetchOnMountOrArgChange: false },
  );

  const streamingState = useStreamingState(taskId);
  const isStreaming = useMemo(() => streamingState?.is_active ?? false, [streamingState?.is_active]);
  const streamingMessageId = useMemo(() => (taskHistory ? getStreamingMessageId(taskHistory) : null), [taskHistory]);
  const sseEnabled = Boolean(taskId) && Boolean(organizationId) && isHistoryLoaded;
  const actionsValue: TaskActions = useMemo(() => ({ refetchHistory }), [refetchHistory]);
  const stateValue: TaskState = useMemo(
    () => ({
      messages,
      taskId,
      isStreaming,
      isLoadingHistory,
      isFetchingHistory,
      isErrorHistory,
      errorHistory,
      conversationData: taskHistory?.conversation,
      inputsRequired: taskHistory?.inputs_required,
      taskSummaryText,
      isBrowserStreamingAvailable,
      browserSessionId,
    }),
    [
      messages,
      taskId,
      isStreaming,
      isLoadingHistory,
      isFetchingHistory,
      isErrorHistory,
      errorHistory,
      taskHistory,
      taskSummaryText,
      isBrowserStreamingAvailable,
      browserSessionId,
    ],
  );

  const handleMessageStop = useCallback(
    (finalMessage: ChatMessage | null, stoppedTaskId: string) => {
      if (finalMessage) {
        setMessages((prev) => {
          if (finalMessage.id && prev.some((msg) => msg.id === finalMessage.id)) return prev;
          return [...prev, finalMessage];
        });
      }
      dispatch(chatApi.util.invalidateTags([{ type: APITags.GET_CONVERSATION_BY_ID, id: stoppedTaskId }]));
    },
    [dispatch],
  );

  const handleTaskUpdate = useCallback(() => {
    dispatch(chatApi.util.invalidateTags([{ type: APITags.GET_CONVERSATION_BY_ID, id: taskId }]));
  }, [dispatch, taskId]);

  const handleInputRequired = useCallback(() => {
    dispatch(chatApi.util.invalidateTags([{ type: APITags.GET_CONVERSATION_BY_ID, id: taskId }]));
  }, [dispatch, taskId]);

  const handleTaskSummary = useCallback((_taskId: string, text: string) => {
    setTaskSummaryText((prev) => (prev === text ? prev : text));
  }, []);

  const handleBrowserStreamingAvailable = useCallback((_taskId: string, sessionId?: string) => {
    setIsBrowserStreamingAvailable(true);
    setBrowserSessionId(sessionId);
  }, []);

  const handleBrowserStreamingUnavailable = useCallback(() => {
    setIsBrowserStreamingAvailable(false);
    setBrowserSessionId(undefined);
  }, []);

  const perTaskCallbacks = useRef<TaskEventCallbacks>({
    onMessageStop: handleMessageStop,
    onTaskUpdate: handleTaskUpdate,
    onTaskSummary: handleTaskSummary,
    onInputRequired: handleInputRequired,
    onBrowserStreamingAvailable: handleBrowserStreamingAvailable,
    onBrowserStreamingUnavailable: handleBrowserStreamingUnavailable,
  });

  const handleClearStaleStreamingState = useCallback(() => {
    if (!taskId) return;
    const hasLiveConnection =
      taskSSERegistry.isConnected(taskId) && streamingStateStore.get(taskId)?.is_active === true;
    if (!hasLiveConnection) {
      streamingStateStore.delete(taskId);
    }
  }, [taskId]);

  const handleMountRefetch = useCallback(() => {
    if (mountRefetchFiredRef.current) return;
    if (!organizationId || !taskId) return;

    mountRefetchFiredRef.current = true;

    const hasLiveConnection =
      taskSSERegistry.isConnected(taskId) && streamingStateStore.get(taskId)?.is_active === true;
    if (hasLiveConnection) {
      setMountRefetchDone(true);
      return;
    }

    refetchHistory()
      .catch((error) => captureException(error instanceof Error ? error : new Error(String(error))))
      .finally(() => {
        setMountRefetchDone(true);
      });
  }, [organizationId, taskId, refetchHistory]);

  const handleOpenSSEGate = useCallback(() => {
    if (!mountRefetchDone) return;
    if (!isFetchingHistory && !isUninitializedHistory && taskHistory !== undefined) {
      setIsHistoryLoaded(true);
    }
  }, [mountRefetchDone, isFetchingHistory, isUninitializedHistory, taskHistory]);

  const handleGlobalTaskUpdate = useCallback(
    (data: BaseEventPayload) => {
      const { taskId: updatedTaskId, status: rawStatus, sourceId } = extractTaskUpdateFields(data);

      // When source_id is present, only process if it matches the current task.
      if (sourceId !== undefined && sourceId !== taskId) return;
      const status = rawStatus as TaskStatus | undefined;
      if (!updatedTaskId || !status) return;

      hasSSEUpdatedStatusesRef.current = true;

      setMessages((prev) =>
        prev.map((msg) => {
          const elements = msg.message_content?.elements;
          if (!elements?.length) return msg;

          let hasUpdate = false;
          const updatedElements = elements.map((el) => {
            if (el.type === BLOCK_TYPE.TASK && el.payload.task_id === updatedTaskId) {
              hasUpdate = true;
              return { ...el, payload: { ...el.payload, status } };
            }
            return el;
          });

          if (!hasUpdate) return msg;
          return { ...msg, message_content: { ...msg.message_content, elements: updatedElements } };
        }),
      );
    },
    [taskId],
  );

  useEffect(() => {
    handleOpenSSEGate();
    handleMountRefetch();
  }, [handleOpenSSEGate, handleMountRefetch]);

  useEffect(() => {
    perTaskCallbacks.current = {
      onMessageStop: handleMessageStop,
      onTaskUpdate: handleTaskUpdate,
      onTaskSummary: handleTaskSummary,
      onInputRequired: handleInputRequired,
      onBrowserStreamingAvailable: handleBrowserStreamingAvailable,
      onBrowserStreamingUnavailable: handleBrowserStreamingUnavailable,
    };
  }, [
    handleMessageStop,
    handleTaskUpdate,
    handleTaskSummary,
    handleInputRequired,
    handleBrowserStreamingAvailable,
    handleBrowserStreamingUnavailable,
  ]);

  useEffect(() => {
    handleClearStaleStreamingState();
  }, []);

  useEffect(() => {
    if (!sseEnabled || !taskId) return;

    const callbacks = perTaskCallbacks.current;
    taskSSERegistry.register(taskId, organizationId, streamingMessageId, callbacks);

    return () => {
      taskSSERegistry.deregister(taskId, callbacks);
    };
  }, [sseEnabled, taskId, organizationId, streamingMessageId]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.TASK_UPDATE, handleGlobalTaskUpdate);
    return () => sub.unsubscribe();
  }, [sseEventBus, handleGlobalTaskUpdate]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!taskHistory) return;

    if (!taskSummaryText && taskHistory?.conversation?.summary?.live_summary) {
      setTaskSummaryText(taskHistory?.conversation?.summary?.live_summary);
    }

    if (taskHistory?.messages?.length > 0) {
      const historyMessages: ChatMessage[] = getHistoryFormattedMessages(taskHistory);

      setMessages((prev) => {
        const merged = mergeHistoryWithSSEStatuses(prev, historyMessages, hasSSEUpdatedStatusesRef.current);

        hasSSEUpdatedStatusesRef.current = false;

        return merged;
      });
    }
  }, [taskHistory]);

  return (
    <TaskActionsContext.Provider value={actionsValue}>
      <TaskStateContext.Provider value={stateValue}>{children}</TaskStateContext.Provider>
    </TaskActionsContext.Provider>
  );
};
