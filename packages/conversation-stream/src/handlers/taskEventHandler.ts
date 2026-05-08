import { captureException } from '@sentry/browser';
import {
  type ChatMessage,
  ChatMessageType,
  ResourceType,
  runningTasksStore,
  SenderType,
  type StreamingState,
  streamingStateStore,
  TASK_STATUS,
  type TaskStatus,
} from '@zamp-platform/chat';

const TERMINAL_TASK_STATUSES: ReadonlySet<TaskStatus> = new Set([
  TASK_STATUS.COMPLETED,
  TASK_STATUS.FAILED,
  TASK_STATUS.CANCELED,
]);

import type { BrowserStreamingAvailableEvent } from '../types/conversation-sse.types';
import { type TaskEventCallbacks, TaskSSEEventType } from '../types/task-sse.types';
import { handleContentBlockEvent } from './streamingBlockHandler';

type MapAny = Record<string, unknown>;
type AnyEvent = MapAny & { type: string };

// No-op callbacks used when no TaskProvider is mounted.
export const BACKGROUND_TASK_CALLBACKS: TaskEventCallbacks = {
  onMessageStop: () => {},
};

/**
 * Handles flat events from the per-task SSE channel.
 * Routes events to streamingStateStore and invokes callbacks for message-level events.
 *
 * Task SSE stays open for the lifetime of the tab — message_stop does NOT close the connection.
 */
export function handleTaskSSEEvent(taskId: string, event: AnyEvent, callbacks: TaskEventCallbacks): void {
  try {
    const eventType = (event.event_type as string) || event.type;

    switch (event.type) {
      case TaskSSEEventType.INIT_STREAM:
      case TaskSSEEventType.KEEPALIVE:
        break;

      case TaskSSEEventType.MESSAGE_START: {
        const msg = event.message as MapAny | undefined;

        const newState: StreamingState = {
          resource_type: ResourceType.ORGANIZATION,
          resource_id: ((msg?.organization_id as string) || event.organization_id || '') as string,
          conversation_id: taskId,
          id: ((msg?.id as string) || (event.message_id as string) || '') as string,
          message_content: { elements: [] },
          message_type: ChatMessageType.SYSTEM,
          sender_type: SenderType.ASSISTANT,
          sender_name: ((msg?.sender_name as string) || 'assistant') as string,
          timestamp: ((msg?.created_at as string) || new Date().toISOString()) as string,
          metadata: {},
          is_active: true,
        };

        streamingStateStore.set(taskId, newState);
        break;
      }

      case TaskSSEEventType.MESSAGE_STOP: {
        const prev = streamingStateStore.get(taskId);
        let finalMessage: ChatMessage | null = null;

        if (prev?.message_content?.elements && prev.message_content.elements.length > 0) {
          finalMessage = {
            resource_type: prev.resource_type,
            resource_id: prev.resource_id,
            id: prev.id,
            conversation_id: taskId,
            message_type: prev.message_type,
            metadata: prev.metadata || {},
            timestamp: prev.timestamp,
            sender_type: prev.sender_type,
            sender_name: prev.sender_name || 'assistant',
            message_content: {
              elements: prev.message_content.elements,
            },
          };
        }

        streamingStateStore.delete(taskId);
        // Do NOT close the SSE connection — it stays open while the task tab is active.
        callbacks.onMessageStop(finalMessage, taskId);
        break;
      }

      case TaskSSEEventType.CONTENT_BLOCK_START:
      case TaskSSEEventType.CONTENT_BLOCK_DELTA:
      case TaskSSEEventType.CONTENT_BLOCK_STOP:
        handleContentBlockEvent(taskId, event.type as string, event.index as number, event);
        break;

      case TaskSSEEventType.BROWSER_STREAMING_AVAILABLE:
        callbacks.onBrowserStreamingAvailable?.(
          taskId,
          (event as unknown as BrowserStreamingAvailableEvent).session_id,
        );
        break;

      case TaskSSEEventType.BROWSER_STREAMING_UNAVAILABLE:
        callbacks.onBrowserStreamingUnavailable?.(taskId);
        break;

      default:
        // Handle task-specific event_type field
        switch (eventType) {
          case TaskSSEEventType.TASK_UPDATE: {
            const updatedFields = (event.updated_fields as Record<string, unknown>) || {};
            const nextStatus = updatedFields.status as TaskStatus | undefined;
            if (nextStatus && TERMINAL_TASK_STATUSES.has(nextStatus)) {
              runningTasksStore.markFinishedByTaskId(taskId);
            }
            callbacks.onTaskUpdate?.(taskId, updatedFields);
            break;
          }
          case TaskSSEEventType.TASK_SUMMARY: {
            const text = event.text as string;
            if (typeof text === 'string') {
              callbacks.onTaskSummary?.(taskId, text);
            }
            break;
          }
          case TaskSSEEventType.INPUT_REQUIRED:
            callbacks.onInputRequired?.(taskId, event.input_required_data);
            break;
        }
        break;
    }
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)));
  }
}
