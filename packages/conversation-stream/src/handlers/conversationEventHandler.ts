import { captureException } from '@sentry/browser';
import {
  type ChatMessage,
  ChatMessageType,
  ResourceType,
  SenderType,
  type StreamingState,
  streamingStateStore,
  unreadStore,
} from '@zamp-platform/chat';

import { conversationSSERegistry } from '../registry/conversationSSERegistry';
import { ConversationEventType } from '../types/conversation-sse.types';
import { handleContentBlockEvent } from './streamingBlockHandler';

type MapAny = Record<string, unknown>;
type AnyEvent = MapAny & { type: string };

export interface ConversationEventCallbacks {
  onTitleUpdated: (title: string) => void;
  onMessageStop: (finalMessage: ChatMessage | null, conversationId: string) => void;
  onConversationCreated?: (conversationId: string) => void;
  /** Invoked when the SSE connection is lost and all retry attempts have been exhausted. */
  onDisconnected?: () => void;
  onBrowserStreamingAvailable?: (conversationId: string) => void;
  onBrowserStreamingUnavailable?: (conversationId: string) => void;
}

/**
 * Handles flat events from the per-conversation SSE channel.
 * Routes events to streamingStateStore and invokes callbacks for message-level events.
 */
export function handleConversationSSEEvent(
  conversationId: string,
  event: AnyEvent,
  callbacks: ConversationEventCallbacks,
): void {
  try {
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
        // Convert streaming state to final message
        const prev = streamingStateStore.get(conversationId);
        let finalMessage: ChatMessage | null = null;

        if (prev?.message_content?.elements && prev.message_content.elements.length > 0) {
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
              elements: prev.message_content.elements,
            },
          };
        }

        streamingStateStore.delete(conversationId);
        // Only mark unread + play sound when no provider is mounted (background).
        if (!conversationSSERegistry.hasProvider(conversationId)) {
          unreadStore.markUnread(conversationId);
          conversationSSERegistry.notifyBackgroundStop(conversationId);
        }
        // Close the background SSE connection — streaming is done.
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
        callbacks.onBrowserStreamingAvailable?.(conversationId);
        break;

      case ConversationEventType.BROWSER_STREAMING_UNAVAILABLE:
        callbacks.onBrowserStreamingUnavailable?.(conversationId);
        break;
    }
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)));
  }
}
