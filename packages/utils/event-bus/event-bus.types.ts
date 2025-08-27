/**
 * Base interface for all event payloads in the generic event bus system.
 * This serves as the foundation for all event types including SSE, webhooks, and component events.
 */
export interface BaseEventPayload {
  /** The type of event (e.g., 'activity_log', 'webhook', 'component') */
  type: string;
  /** Optional identifier for the source of the event */
  source_id?: string;
  /** Optional timestamp when the event was created */
  timestamp?: string;
  /** Event-specific data payload */
  payload?: Record<string, unknown>;
}

/**
 * Server-Sent Events payload structure.
 * Extends BaseEventPayload with required fields for SSE communication.
 */
export interface SSEEventPayload extends BaseEventPayload {
  /** Required source identifier for SSE events */
  source_id: string;
  /** Required timestamp for SSE events */
  timestamp: string;
  /** Required payload data for SSE events */
  payload: Record<string, unknown>;
}

/**
 * Activity log event payload for process activity updates.
 * Used by the Activity Logs feature to receive real-time updates.
 */
export interface ActivityLogEventPayload extends SSEEventPayload {
  type: 'activity_log';
  payload: {
    /** Unique identifier for the log group */
    log_group_id: string;
  };
}

/**
 * Conversation event payload for chat and messaging updates.
 * Used by the Chat feature to receive real-time conversation updates.
 */
export interface ConversationEventPayload extends SSEEventPayload {
  type: 'conversation';
  payload: {
    /** Type of conversation event */
    type: 'CHAT_MESSAGE' | 'CONVERSATION_STATUS';
    /** Unique identifier for the conversation */
    conversation_id: string;
    /** Optional message data for chat messages */
    message?: Record<string, unknown>;
    /** Optional status for conversation status updates */
    status?: string;
  };
}

/**
 * Webhook event payload for external webhook notifications.
 * Used for handling incoming webhook events from external services.
 */
export interface WebhookEventPayload extends BaseEventPayload {
  type: 'webhook';
  payload: {
    /** Unique identifier for the webhook */
    webhook_id: string;
    /** Type of webhook event (e.g., 'payment.completed', 'user.created') */
    event_type: string;
    /** Webhook-specific data */
    data: Record<string, unknown>;
  };
}

/**
 * Component event payload for inter-component communication.
 * Used for decoupled communication between React components.
 */
export interface ComponentEventPayload extends BaseEventPayload {
  type: 'component';
  payload: {
    /** Unique identifier for the component */
    component_id: string;
    /** Action performed by the component (e.g., 'click', 'submit', 'change') */
    action: string;
    /** Optional additional data for the action */
    data?: Record<string, unknown>;
  };
}

/**
 * Callback function type for event handlers.
 * @template T - The type of event payload the callback expects
 */
export type EventCallback<T = BaseEventPayload> = (event: T) => void;

/**
 * Subscription object returned when subscribing to events.
 * Provides a method to unsubscribe from the event.
 */
export interface EventBusSubscription {
  /** Unsubscribe from the event topic */
  unsubscribe: () => void;
}

/**
 * Generic event bus interface for managing event subscriptions and publishing.
 * Supports any type of event communication pattern.
 */
export interface EventBusInterface {
  /** Subscribe to a topic with a callback function */
  subscribe<T = BaseEventPayload>(topic: string, callback: EventCallback<T>): EventBusSubscription;
  /** Unsubscribe a specific callback from a topic */
  unsubscribe(topic: string, callback: EventCallback): void;
  /** Publish an event to all subscribers of a topic */
  publish<T = BaseEventPayload>(topic: string, event: T): void;
  /** Clear all subscriptions from all topics */
  clear(): void;
  /** Get all active topic names */
  getTopics(): string[];
  /** Get the number of subscribers for a specific topic */
  getSubscriberCount(topic: string): number;
}

/**
 * Server-Sent Events specific event bus interface.
 * Extends the generic event bus with SSE connection management capabilities.
 */
export interface SSEEventBusInterface extends EventBusInterface {
  /** Connect to the SSE endpoint */
  connect(url?: string): void;
  /** Disconnect from the SSE endpoint */
  disconnect(): void;
  /** Check if currently connected to the SSE endpoint */
  isConnected: boolean;
}

/**
 * Predefined event types for common use cases.
 * These constants ensure consistency across the application.
 */
export const EVENT_TYPES = {
  /** Activity log events for process monitoring */
  ACTIVITY_LOG: 'activity_log',
  /** Conversation events for chat functionality */
  CONVERSATION: 'conversation',
  /** Webhook events for external integrations */
  WEBHOOK: 'webhook',
  /** Component events for inter-component communication */
  COMPONENT: 'component',
} as const;
