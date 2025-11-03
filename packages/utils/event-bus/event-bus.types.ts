import type { MapAny } from '@/types/commonTypes';

/**
 * Base interface for all event payloads in the generic event bus system.
 * This serves as the foundation for all event types including SSE, webhooks, and component events.
 */
export interface BaseEventPayload {
  type: string;
  source_id?: string;
  timestamp?: string;
  payload?: string | MapAny;
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
  subscribe<T = BaseEventPayload>(topic: string, callback: EventCallback<T>): EventBusSubscription;
  unsubscribe(topic: string, callback: EventCallback): void;
  publish<T = BaseEventPayload>(topic: string, event: T): void;
  clear(): void;
  getTopics(): string[];
  getSubscriberCount(topic: string): number;
}

/**
 * Predefined event types for common use cases.
 * These constants ensure consistency across the application.
 */
export const enum EventType {
  ACTIVITY_LOG = 'activity_log',
  CONVERSATION = 'conversation',
  WEBHOOK = 'webhook',
  COMPONENT = 'component',
  FEEDBACK = 'feedback',
}
