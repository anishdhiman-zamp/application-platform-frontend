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
  SenderType,
  streamingStateStore,
  type TaskStatus,
  useGetConversationByIdQuery,
  useStreamingState,
} from '@zamp-platform/chat';
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useEventBus } from '@/app/_providers/sse-provider';
import type { MapAny } from '@/types/commonTypes';

import { taskSSERegistry } from '../registry/taskSSERegistry';
import { type TaskEventCallbacks } from '../types/task-sse.types';
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

export const TaskProvider: React.FC<TaskProviderProps> = ({
  children,
  taskId,
  organizationId,
  resourceType,
  apiConfig,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [mountRefetchDone, setMountRefetchDone] = useState(false);
  const mountRefetchFiredRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  const dispatch = useDispatch();
  const { sseEventBus } = useEventBus();

  const {
    data: taskHistory,
    isLoading: isLoadingHistory,
    isFetching: isFetchingHistory,
    isUninitialized: isUninitializedHistory,
    isError: isErrorHistory,
    refetch: refetchHistory,
  } = useGetConversationByIdQuery(
    {
      conversationId: taskId,
      resourceId: organizationId,
      resourceType,
      url: apiConfig?.getTaskMessages,
    },
    { skip: !taskId || !organizationId },
  );

  const streamingState = useStreamingState(taskId);
  const isStreaming = useMemo(() => streamingState?.is_active ?? false, [streamingState?.is_active]);

  const streamingMessageId = useMemo(() => (taskHistory ? getStreamingMessageId(taskHistory) : null), [taskHistory]);

  const sseEnabled = Boolean(taskId) && Boolean(organizationId) && isHistoryLoaded;

  // --- SSE Callbacks ---
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

  const perTaskCallbacks = useRef<TaskEventCallbacks>({
    onMessageStop: handleMessageStop,
    onTaskUpdate: handleTaskUpdate,
    onInputRequired: handleInputRequired,
  });

  useEffect(() => {
    perTaskCallbacks.current = {
      onMessageStop: handleMessageStop,
      onTaskUpdate: handleTaskUpdate,
      onInputRequired: handleInputRequired,
    };
  }, [handleMessageStop, handleTaskUpdate, handleInputRequired]);

  // --- Clear stale streaming state on mount ---
  useEffect(() => {
    if (taskId) {
      const hasLiveConnection =
        taskSSERegistry.isConnected(taskId) && streamingStateStore.get(taskId)?.is_active === true;
      if (!hasLiveConnection) {
        streamingStateStore.delete(taskId);
      }
    }
  }, []);

  // --- Fetch fresh history on mount ---
  useEffect(() => {
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
  }, [organizationId, taskId]);

  // --- Open SSE gate once history is loaded ---
  useEffect(() => {
    if (!mountRefetchDone) return;
    if (!isFetchingHistory && !isUninitializedHistory && taskHistory !== undefined) {
      setIsHistoryLoaded(true);
    }
  }, [mountRefetchDone, isFetchingHistory, isUninitializedHistory, taskHistory]);

  // --- Register with task SSE registry ---
  useEffect(() => {
    if (!sseEnabled || !taskId) return;

    const callbacks = perTaskCallbacks.current;
    taskSSERegistry.register(taskId, organizationId, streamingMessageId, callbacks);

    return () => {
      taskSSERegistry.deregister(taskId, callbacks);
    };
  }, [sseEnabled, taskId]);

  // --- Handle global TASK_UPDATE events for task block status updates in messages ---
  const handleGlobalTaskUpdate = useCallback(
    (data: BaseEventPayload) => {
      if (data.source_id !== taskId) return;

      const payload = data.payload as MapAny;
      const updatedTaskId = payload?.task_id as string;
      const status = (payload?.updated_fields as MapAny)?.status as TaskStatus | undefined;

      if (!updatedTaskId || !status) return;

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
    const sub = sseEventBus.subscribe(EVENT_TYPE.TASK_UPDATE, handleGlobalTaskUpdate);
    return () => sub.unsubscribe();
  }, [sseEventBus, handleGlobalTaskUpdate]);

  // --- Sync messages ref ---
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // --- Apply history data ---
  useEffect(() => {
    if (!taskHistory) return;

    if (taskHistory?.messages?.length > 0) {
      const historyMessages: ChatMessage[] = getHistoryFormattedMessages(taskHistory);

      setMessages((prev) => {
        if (prev.length > 0) {
          const dbMessageIds = new Set(historyMessages.map((m) => m.id).filter(Boolean));
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
  }, [taskHistory]);

  // --- Context values ---
  const actionsValue: TaskActions = useMemo(() => ({ refetchHistory }), [refetchHistory]);

  const stateValue: TaskState = useMemo(
    () => ({
      messages,
      taskId,
      isStreaming,
      isLoadingHistory,
      isFetchingHistory,
      isErrorHistory,
      conversationData: taskHistory?.conversation,
      inputsRequired: taskHistory?.inputs_required,
    }),
    [messages, taskId, isStreaming, isLoadingHistory, isFetchingHistory, isErrorHistory, taskHistory],
  );

  return (
    <TaskActionsContext.Provider value={actionsValue}>
      <TaskStateContext.Provider value={stateValue}>{children}</TaskStateContext.Provider>
    </TaskActionsContext.Provider>
  );
};
