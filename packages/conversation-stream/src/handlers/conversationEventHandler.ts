import { captureException, captureMessage } from '@sentry/browser';
import {
  type ChatMessage,
  ChatMessageType,
  inputsRequiredStore,
  ResourceType,
  SenderType,
  type StreamingState,
  streamingStateStore,
  unreadStore,
} from '@zamp-platform/chat';

import { conversationSSERegistry } from '../registry/conversationSSERegistry';
import { type BrowserStreamingAvailableEvent, ConversationEventType } from '../types/conversation-sse.types';
import { TaskSSEEventType } from '../types/task-sse.types';
import { handleContentBlockEvent } from './streamingBlockHandler';

type MapAny = Record<string, unknown>;
type AnyEvent = MapAny & { type: string };

// De-dupe Sentry reports for new event types per session.
const reportedUnknownEventTypes = new Set<string>();

export interface ConversationEventCallbacks {
  onTitleUpdated: (title: string) => void;
  onMessageStop: (finalMessage: ChatMessage | null, conversationId: string) => void;
  onConversationCreated?: (conversationId: string) => void;
  /** Fires after SSE retries are exhausted. */
  onDisconnected?: () => void;
  onBrowserStreamingAvailable?: (conversationId: string, sessionId?: string) => void;
  onBrowserStreamingUnavailable?: (conversationId: string) => void;
  onTaskMessageStart?: (taskId: string, messageId: string) => void;
  onTaskMessageStop?: (taskId: string, messageId: string) => void;
  onTaskUpdate?: (taskId: string, updatedFields: Record<string, unknown>) => void;
  onTaskSummary?: (taskId: string, text: string) => void;
  onInputRequired?: (entityId: string, entityType: string, data: unknown) => void;
  onMessagesPickedUp?: (messageIds: string[]) => void;
}

/** Routes per-conversation SSE events to streamingStateStore and callbacks. */
export function handleConversationSSEEvent(
  conversationId: string,
  event: AnyEvent,
  callbacks: ConversationEventCallbacks,
): void {
  try {
    const eventType = event.event_type as string | undefined;

    switch (eventType) {
      case TaskSSEEventType.TASK: {
        const taskId = event.task_id as string;
        const messageId = event.message_id as string;
        if (event.type === ConversationEventType.MESSAGE_START) {
          callbacks.onTaskMessageStart?.(taskId, messageId);
        } else if (event.type === ConversationEventType.MESSAGE_STOP) {
          callbacks.onTaskMessageStop?.(taskId, messageId);
        }
        return;
      }

      case TaskSSEEventType.TASK_UPDATE: {
        const taskId = event.task_id as string;
        const updatedFields = (event.updated_fields as Record<string, unknown>) || {};
        callbacks.onTaskUpdate?.(taskId, updatedFields);
        return;
      }

      case TaskSSEEventType.INPUT_REQUIRED: {
        const entityId = event.entity_id as string;
        const entityType = event.entity_type as string;
        inputsRequiredStore.markPending(conversationId);
        callbacks.onInputRequired?.(entityId, entityType, event.input_required_data);
        return;
      }
    }

    if (eventType === TaskSSEEventType.TASK_SUMMARY) {
      const taskId = (event.task_id as string) || (event.streaming_id as string);
      const text = event.text as string;
      if (taskId && typeof text === 'string') {
        callbacks.onTaskSummary?.(taskId, text);
      }
      return;
    }

    switch (event.type) {
      case ConversationEventType.INIT_STREAM:
      case ConversationEventType.KEEPALIVE:
        break;

      case ConversationEventType.CONVERSATION_CREATED:
        callbacks.onConversationCreated?.((event.conversation as MapAny)?.id as string);
        break;

      case ConversationEventType.CONVERSATION_TITLE_UPDATED:
        callbacks.onTitleUpdated(event.title as string);
        break;

      case ConversationEventType.MESSAGE_START: {
        const msg = event.message as MapAny;
        inputsRequiredStore.markResolved(conversationId);

        const newState: StreamingState = {
          resource_type: ResourceType.ORGANIZATION,
          resource_id: (msg.organization_id as string) || '',
          conversation_id: conversationId,
          id: msg.id as string,
          message_content: { elements: [] },
          message_type: ChatMessageType.SYSTEM,
          sender_type: msg.sender_type === 'ASSISTANT' ? SenderType.ASSISTANT : SenderType.USER,
          sender_name: (msg.sender_name as string) || 'assistant',
          timestamp: (msg.created_at as string) || new Date().toISOString(),
          metadata: {},
          is_active: true,
        };

        streamingStateStore.set(conversationId, newState);
        break;
      }

      case ConversationEventType.MESSAGE_STOP: {
        const prev = streamingStateStore.get(conversationId);
        let finalMessage: ChatMessage | null = null;

        if (prev?.message_content?.elements && prev.message_content.elements.length > 0) {
          // Force-complete blocks in case message_stop arrives before content_block_stop.
          const finalizedElements = prev.message_content.elements.map((block) =>
            block.is_complete ? block : { ...block, is_complete: true },
          );

          finalMessage = {
            resource_type: prev.resource_type,
            resource_id: prev.resource_id,
            id: prev.id,
            conversation_id: conversationId,
            message_type: prev.message_type,
            metadata: prev.metadata || {},
            timestamp: prev.timestamp,
            sender_type: prev.sender_type,
            sender_name: prev.sender_name || 'assistant',
            message_content: {
              elements: finalizedElements,
            },
          };
        }

        streamingStateStore.delete(conversationId);
        // Only mark unread when no provider is mounted (background stream).
        if (!conversationSSERegistry.hasProvider(conversationId)) {
          unreadStore.markUnread(conversationId);
          conversationSSERegistry.notifyBackgroundStop(conversationId);
        }
        conversationSSERegistry.closeConnection(conversationId);
        callbacks.onMessageStop(finalMessage, conversationId);
        break;
      }

      case ConversationEventType.CONTENT_BLOCK_START:
      case ConversationEventType.CONTENT_BLOCK_DELTA:
      case ConversationEventType.CONTENT_BLOCK_STOP:
        handleContentBlockEvent(conversationId, event.type as string, event.index as number, event);
        break;

      case ConversationEventType.BROWSER_STREAMING_AVAILABLE:
        callbacks.onBrowserStreamingAvailable?.(
          conversationId,
          (event as unknown as BrowserStreamingAvailableEvent).session_id,
        );
        break;

      case ConversationEventType.BROWSER_STREAMING_UNAVAILABLE:
        callbacks.onBrowserStreamingUnavailable?.(conversationId);
        break;

      case ConversationEventType.MESSAGES_PICKED_UP:
        callbacks.onMessagesPickedUp?.(event.message_ids as string[]);
        break;

      default: {
        const unknownType = event.type ?? '<missing>';
        if (!reportedUnknownEventTypes.has(unknownType)) {
          reportedUnknownEventTypes.add(unknownType);
          captureMessage('chat.streaming.unknown_event_type', {
            level: 'warning',
            tags: { area: 'sse', eventType: unknownType, conversationId },
            extra: { eventType: unknownType, eventSubType: eventType, conversationId },
          });
        }
        break;
      }
    }
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)));
  }
}
