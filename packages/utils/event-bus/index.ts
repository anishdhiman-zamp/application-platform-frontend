'use client';

import type { BaseEventPayload, EventBusInterface, EventBusSubscription, EventCallback } from './event-bus.types';

/**
 * Generic event bus implementation for decoupled communication.
 * This event bus supports any type of event communication including:
 * - Component-to-component communication
 * - Webhook event handling.
 * - Custom application events.
 * - Any other pub/sub pattern needs.
 */

class EventBus implements EventBusInterface {
  /** Map of topic names to their subscriber callbacks */
  private topics: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to a topic with a callback function.
   * @param topic - The topic name to subscribe to
   * @param callback - Function to call when events are published to this topic
   * @returns Subscription object with unsubscribe method
   */
  subscribe<T = BaseEventPayload>(topic: string, callback: EventCallback<T>): EventBusSubscription {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, new Set());
    }

    this.topics.get(topic)?.add(callback as EventCallback);

    console.log(`[EventBus] Subscribed to topic "${topic}". Subscribers: ${this.getSubscriberCount(topic)}`);

    return {
      unsubscribe: () => this.unsubscribe(topic, callback as EventCallback),
    };
  }

  /**
   * Unsubscribe a specific callback from a topic.
   * @param topic - The topic name to unsubscribe from
   * @param callback - The callback function to remove
   */
  unsubscribe(topic: string, callback: EventCallback): void {
    const callbacks = this.topics.get(topic);
    if (callbacks) {
      callbacks.delete(callback);
      console.log(`[EventBus] Unsubscribed from topic "${topic}". Remaining subscribers: ${callbacks.size}`);
      if (callbacks.size === 0) {
        this.topics.delete(topic);
        console.log(`[EventBus] Removed empty topic "${topic}"`);
      }
    }
  }

  /**
   * Publish an event to all subscribers of a topic.
   * @param topic - The topic name to publish to
   * @param event - The event data to send to subscribers
   */
  publish<T = BaseEventPayload>(topic: string, event: T): void {
    const callbacks = this.topics.get(topic);
    if (callbacks) {
      console.log(`[EventBus] Publishing to topic "${topic}" with ${callbacks.size} subscribers`);
      callbacks.forEach((callback) => callback(event as BaseEventPayload));
    }
  }

  /**
   * Clear all subscriptions from all topics.
   * Useful for cleanup during testing or application shutdown.
   */
  clear(): void {
    this.topics.clear();
  }

  /**
   * Get all active topic names.
   * @returns Array of topic names that have active subscriptions
   */
  getTopics(): string[] {
    return Array.from(this.topics.keys());
  }

  /**
   * Get the number of subscribers for a specific topic.
   * @param topic - The topic name to check
   * @returns Number of active subscribers for the topic
   */
  getSubscriberCount(topic: string): number {
    return this.topics.get(topic)?.size ?? 0;
  }
}

export const eventBus = new EventBus();
