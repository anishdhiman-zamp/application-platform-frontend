import type {
  StreamEventContentBlockDelta,
  StreamEventContentBlockStart,
  StreamEventContentBlockStop,
} from '@zamp-platform/chat';

/**
 * Event types for the per-conversation SSE channel.
 * Events are FLAT — type at root level, no envelope wrapper,
 * no source_id, no streaming_id.
 */
export const enum ConversationEventType {
  INIT_STREAM = 'init-stream',
  KEEPALIVE = 'keepalive',
  CONVERSATION_CREATED = 'conversation_created',
  CONVERSATION_TITLE_UPDATED = 'conversation_title_updated',
  MESSAGE_START = 'message_start',
  MESSAGE_STOP = 'message_stop',
  CONTENT_BLOCK_START = 'content_block_start',
  CONTENT_BLOCK_DELTA = 'content_block_delta',
  CONTENT_BLOCK_STOP = 'content_block_stop',
  BROWSER_STREAMING_AVAILABLE = 'browser_streaming_available',
  BROWSER_STREAMING_UNAVAILABLE = 'browser_streaming_unavailable',
}

export interface ConversationCreatedEvent {
  type: ConversationEventType.CONVERSATION_CREATED;
  conversation: {
    id: string;
    title: string;
    created_by: string;
    organization_id: string;
  };
}

export interface ConversationTitleUpdatedEvent {
  type: ConversationEventType.CONVERSATION_TITLE_UPDATED;
  conversation_id: string;
  title: string;
}

export interface MessageStartEvent {
  type: ConversationEventType.MESSAGE_START;
  conversation_id: string;
  message: {
    id: string;
    organization_id: string;
    conversation_id: string;
    message_content: { elements: [] };
    sender_id: string;
    sender_type: string;
    sender_name: string;
    intent: string | null;
    created_at: string;
    deleted_at: string | null;
  };
}

export interface MessageStopEvent {
  type: ConversationEventType.MESSAGE_STOP;
  conversation_id: string;
  message: {
    id: string;
    stop_reason: string;
    error?: string;
  };
}

/** Content block events — same inner structure as before, just no wrapper envelope */
export type ContentBlockStartEvent = StreamEventContentBlockStart & {
  type: ConversationEventType.CONTENT_BLOCK_START;
};

export type ContentBlockDeltaEvent = StreamEventContentBlockDelta & {
  type: ConversationEventType.CONTENT_BLOCK_DELTA;
};

export type ContentBlockStopEvent = StreamEventContentBlockStop & {
  type: ConversationEventType.CONTENT_BLOCK_STOP;
};

export interface BrowserStreamingAvailableEvent {
  type: ConversationEventType.BROWSER_STREAMING_AVAILABLE;
  conversation_id: string;
  session_id?: string;
}

export interface BrowserStreamingUnavailableEvent {
  type: ConversationEventType.BROWSER_STREAMING_UNAVAILABLE;
  conversation_id: string;
}

/** Union of all flat events on the per-conversation SSE channel */
export type ConversationSSEEvent =
  | { type: ConversationEventType.INIT_STREAM }
  | { type: ConversationEventType.KEEPALIVE }
  | ConversationCreatedEvent
  | ConversationTitleUpdatedEvent
  | MessageStartEvent
  | MessageStopEvent
  | ContentBlockStartEvent
  | ContentBlockDeltaEvent
  | ContentBlockStopEvent
  | BrowserStreamingAvailableEvent
  | BrowserStreamingUnavailableEvent;

/** SSE event with an id field (Redis stream ID) for Last-Event-Id tracking */
export interface SSEEventWithId {
  id?: string;
  data: ConversationSSEEvent;
}
