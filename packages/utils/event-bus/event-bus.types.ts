import type { MapAny } from '@/types/commonTypes';

/**
 * Base interface for all event payloads in the generic event bus system.
 * This serves as the foundation for all event types including SSE, webhooks, and component events.
 */
export interface BaseEventPayload {
  type: EVENT_TYPE;
  source_id?: string;
  timestamp?: string;
  payload?: string | MapAny;
  /**
   * Indicates if this event is from history replay (e.g., after page refresh).
   * When true, the event was fetched from Redis stream history, not received in real-time.
   * Frontend should render these events immediately without streaming animations.
   */
  is_history?: boolean;
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
  unsubscribe: () => void;
}

/**
 * Generic event bus interface for managing event subscriptions and publishing.
 * Supports any type of event communication pattern.
 */
export interface EventBusInterface {
  subscribe<T = BaseEventPayload>(topic: EVENT_TYPE, callback: EventCallback<T>): EventBusSubscription;
  unsubscribe(topic: EVENT_TYPE, callback: EventCallback): void;
  publish<T = BaseEventPayload>(topic: EVENT_TYPE, event: T): void;
  clear(): void;
  getTopics(): EVENT_TYPE[];
  getSubscriberCount(topic: EVENT_TYPE): number;
}

/**
 * Predefined event types for common use cases.
 * These constants ensure consistency across the application.
 */
export const enum EVENT_TYPE {
  ACTIVITY_LOG = 'activity_log',
  CONVERSATION = 'conversation',
  CONVERSATION_V2 = 'conversation_v2',
  FEEDBACK = 'feedback',
  AGENT_STREAMS = 'agent_streams',
  TEST = 'test',
  COMPONENT = 'component',
  WEBHOOK = 'webhook',
  KNOWLEDGE_BASE = 'knowledge_base',
  DATASET = 'dataset',
  PROCESS = 'process',
}
