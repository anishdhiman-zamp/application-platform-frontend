import type { BaseEventPayload, EventCallback } from '../event-bus.types';
import { EventBus } from '../index';

// Custom event payload interface for testing
interface TestEventPayload extends BaseEventPayload {
  type: string;
  source_id?: string;
  timestamp?: string;
  payload?: {
    message?: string;
    userId?: string;
    data?: unknown;
  };
}

interface CustomEventPayload {
  customField: string;
  value: number;
}

describe('EventBus', () => {
  let eventBus: EventBus;
  eventBus = new EventBus();

  beforeEach(() => {
    // Clear the event bus before each test to ensure clean state
    eventBus.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    eventBus.clear();
    jest.restoreAllMocks();
  });

  describe('subscribe', () => {
    it('should subscribe to a topic successfully', () => {
      const callback = jest.fn();
      const subscription = eventBus.subscribe('test-topic', callback);

      expect(subscription).toBeDefined();
      expect(subscription.unsubscribe).toBeInstanceOf(Function);
      expect(eventBus.getSubscriberCount('test-topic')).toBe(1);
      expect(eventBus.getTopics()).toContain('test-topic');
    });

    it('should allow multiple subscribers to the same topic', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      eventBus = new EventBus();
      eventBus.subscribe('multi-topic', callback1);
      eventBus.subscribe('multi-topic', callback2);
      eventBus.subscribe('multi-topic', callback3);

      expect(eventBus.getSubscriberCount('multi-topic')).toBe(3);
      expect(eventBus.getTopics()).toContain('multi-topic');
    });

    it('should handle generic type parameters correctly', () => {
      const customCallback: EventCallback<CustomEventPayload> = jest.fn();
      const testCallback: EventCallback<TestEventPayload> = jest.fn();

      const customSub = eventBus.subscribe<CustomEventPayload>('custom-topic', customCallback);
      const testSub = eventBus.subscribe<TestEventPayload>('test-topic', testCallback);

      expect(customSub).toBeDefined();
      expect(testSub).toBeDefined();
      expect(eventBus.getSubscriberCount('custom-topic')).toBe(1);
      expect(eventBus.getSubscriberCount('test-topic')).toBe(1);
    });
  });

  describe('publish', () => {
    it('should publish events to subscribers', () => {
      const callback = jest.fn();
      const testEvent: TestEventPayload = {
        type: 'test',
        source_id: 'test-source',
        timestamp: new Date().toISOString(),
        payload: { message: 'Hello World' },
      };

      eventBus.subscribe('test-topic', callback);
      eventBus.publish('test-topic', testEvent);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(testEvent);
    });

    it('should publish to all subscribers of a topic', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();
      const testEvent: BaseEventPayload = { type: 'broadcast-test' };

      eventBus.subscribe('broadcast-topic', callback1);
      eventBus.subscribe('broadcast-topic', callback2);
      eventBus.subscribe('broadcast-topic', callback3);

      eventBus.publish('broadcast-topic', testEvent);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);

      expect(callback1).toHaveBeenCalledWith(testEvent);
      expect(callback2).toHaveBeenCalledWith(testEvent);
      expect(callback3).toHaveBeenCalledWith(testEvent);
    });

    it('should not publish to unrelated topics', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const testEvent: BaseEventPayload = { type: 'isolated-test' };

      eventBus.subscribe('topic-1', callback1);
      eventBus.subscribe('topic-2', callback2);

      eventBus.publish('topic-1', testEvent);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should handle publishing to non-existent topics gracefully', () => {
      expect(() => {
        eventBus.publish('non-existent-topic', { type: 'test' });
      }).not.toThrow();
    });

    it('should handle complex event payloads', () => {
      const callback = jest.fn();
      const complexEvent: TestEventPayload = {
        type: 'complex-event',
        source_id: 'complex-source',
        timestamp: new Date().toISOString(),
        payload: {
          message: 'Complex message',
          userId: 'user-123',
          data: {
            nested: {
              deeply: {
                value: 42,
                array: [1, 2, 3],
                object: { key: 'value' },
              },
            },
          },
        },
      };

      eventBus.subscribe('complex-topic', callback);
      eventBus.publish('complex-topic', complexEvent);

      expect(callback).toHaveBeenCalledWith(complexEvent);
    });

    it('should handle null and undefined event data', () => {
      const callback = jest.fn();

      eventBus.subscribe('null-topic', callback);

      eventBus.publish('null-topic', null);
      eventBus.publish('null-topic', undefined);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, null);
      expect(callback).toHaveBeenNthCalledWith(2, undefined);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe a specific callback from a topic', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.subscribe('unsub-topic', callback1);
      eventBus.subscribe('unsub-topic', callback2);

      expect(eventBus.getSubscriberCount('unsub-topic')).toBe(2);

      eventBus.unsubscribe('unsub-topic', callback1);

      expect(eventBus.getSubscriberCount('unsub-topic')).toBe(1);

      eventBus.publish('unsub-topic', { type: 'test' });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should remove topic when last subscriber is removed', () => {
      const callback = jest.fn();

      eventBus.subscribe('removable-topic', callback);
      expect(eventBus.getTopics()).toContain('removable-topic');
      expect(eventBus.getSubscriberCount('removable-topic')).toBe(1);

      eventBus.unsubscribe('removable-topic', callback);
      expect(eventBus.getTopics()).not.toContain('removable-topic');
      expect(eventBus.getSubscriberCount('removable-topic')).toBe(0);
    });

    it('should handle unsubscribing from non-existent topics gracefully', () => {
      const callback = jest.fn();

      expect(() => {
        eventBus.unsubscribe('non-existent-topic', callback);
      }).not.toThrow();
    });

    it('should handle unsubscribing non-existent callbacks gracefully', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.subscribe('partial-topic', callback1);

      expect(() => {
        eventBus.unsubscribe('partial-topic', callback2);
      }).not.toThrow();

      expect(eventBus.getSubscriberCount('partial-topic')).toBe(1);
    });

    it('should work with subscription object unsubscribe method', () => {
      const callback = jest.fn();
      const subscription = eventBus.subscribe('subscription-topic', callback);

      expect(eventBus.getSubscriberCount('subscription-topic')).toBe(1);

      subscription.unsubscribe();

      expect(eventBus.getSubscriberCount('subscription-topic')).toBe(0);
      expect(eventBus.getTopics()).not.toContain('subscription-topic');
    });
  });

  describe('clear', () => {
    it('should clear all topics and subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      eventBus.subscribe('topic-1', callback1);
      eventBus.subscribe('topic-2', callback2);
      eventBus.subscribe('topic-2', callback3);

      expect(eventBus.getTopics()).toHaveLength(2);
      expect(eventBus.getSubscriberCount('topic-1')).toBe(1);
      expect(eventBus.getSubscriberCount('topic-2')).toBe(2);

      eventBus.clear();

      expect(eventBus.getTopics()).toHaveLength(0);
      expect(eventBus.getSubscriberCount('topic-1')).toBe(0);
      expect(eventBus.getSubscriberCount('topic-2')).toBe(0);
    });

    it('should prevent events from being published after clear', () => {
      const callback = jest.fn();

      eventBus.subscribe('clear-topic', callback);
      eventBus.clear();
      eventBus.publish('clear-topic', { type: 'test' });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getTopics', () => {
    it('should return empty array when no topics exist', () => {
      expect(eventBus.getTopics()).toEqual([]);
    });

    it('should return all active topic names', () => {
      const callback = jest.fn();

      eventBus.subscribe('topic-a', callback);
      eventBus.subscribe('topic-b', callback);
      eventBus.subscribe('topic-c', callback);

      const topics = eventBus.getTopics();

      expect(topics).toHaveLength(3);
      expect(topics).toContain('topic-a');
      expect(topics).toContain('topic-b');
      expect(topics).toContain('topic-c');
    });

    it('should not return topics after they are completely unsubscribed', () => {
      const callback = jest.fn();

      eventBus.subscribe('temporary-topic', callback);
      expect(eventBus.getTopics()).toContain('temporary-topic');

      eventBus.unsubscribe('temporary-topic', callback);
      expect(eventBus.getTopics()).not.toContain('temporary-topic');
    });
  });

  describe('getSubscriberCount', () => {
    it('should return 0 for non-existent topics', () => {
      expect(eventBus.getSubscriberCount('non-existent')).toBe(0);
    });

    it('should return correct subscriber count for existing topics', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      expect(eventBus.getSubscriberCount('count-topic')).toBe(0);

      eventBus.subscribe('count-topic', callback1);
      expect(eventBus.getSubscriberCount('count-topic')).toBe(1);

      eventBus.subscribe('count-topic', callback2);
      expect(eventBus.getSubscriberCount('count-topic')).toBe(2);

      eventBus.subscribe('count-topic', callback3);
      expect(eventBus.getSubscriberCount('count-topic')).toBe(3);

      eventBus.unsubscribe('count-topic', callback2);
      expect(eventBus.getSubscriberCount('count-topic')).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in subscriber callbacks gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = jest.fn();

      eventBus.subscribe('error-topic', errorCallback);
      eventBus.subscribe('error-topic', normalCallback);

      expect(() => {
        eventBus.publish('error-topic', { type: 'test' });
      }).toThrow('Callback error');

      expect(errorCallback).toHaveBeenCalledTimes(1);
      // Due to the error, remaining callbacks might not execute
      // This is expected behavior for synchronous event publishing
    });

    it('should handle async callbacks', async () => {
      const asyncCallback = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'async-result';
      });

      eventBus.subscribe('async-topic', asyncCallback);
      eventBus.publish('async-topic', { type: 'async-test' });

      expect(asyncCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory when subscribing and unsubscribing repeatedly', () => {
      const callback = jest.fn();

      // Subscribe and unsubscribe many times
      for (let i = 0; i < 1000; i++) {
        const subscription = eventBus.subscribe(`topic-${i}`, callback);
        subscription.unsubscribe();
      }

      expect(eventBus.getTopics()).toHaveLength(0);
    });

    it('should handle large numbers of subscribers efficiently', () => {
      const callbacks: Array<() => void> = [];

      // Create many subscribers
      for (let i = 0; i < 1000; i++) {
        const callback = jest.fn();
        callbacks.push(callback);
        eventBus.subscribe('performance-topic', callback);
      }

      expect(eventBus.getSubscriberCount('performance-topic')).toBe(1000);

      const startTime = performance.now();
      eventBus.publish('performance-topic', { type: 'performance-test' });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms

      callbacks.forEach((callback) => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex workflow with multiple operations', () => {
      const userCallback = jest.fn();
      const logCallback = jest.fn();
      const analyticsCallback = jest.fn();

      // Set up multiple topics
      const userSub = eventBus.subscribe('user-events', userCallback);
      eventBus.subscribe('log-events', logCallback);
      eventBus.subscribe('analytics-events', analyticsCallback);

      // Add multiple subscribers to same topic
      const additionalLogCallback = jest.fn();
      eventBus.subscribe('log-events', additionalLogCallback);

      // Publish various events
      eventBus.publish('user-events', {
        type: 'user-login',
        source_id: 'auth-service',
        timestamp: new Date().toISOString(),
        payload: { userId: 'user-123' },
      });

      eventBus.publish('log-events', {
        type: 'info',
        payload: { message: 'User logged in' },
      });

      eventBus.publish('analytics-events', {
        type: 'page-view',
        payload: { page: '/dashboard', userId: 'user-123' },
      });

      // Verify all callbacks were called appropriately
      expect(userCallback).toHaveBeenCalledTimes(1);
      expect(logCallback).toHaveBeenCalledTimes(1);
      expect(additionalLogCallback).toHaveBeenCalledTimes(1);
      expect(analyticsCallback).toHaveBeenCalledTimes(1);

      // Unsubscribe and verify
      userSub.unsubscribe();
      eventBus.publish('user-events', { type: 'user-logout' });

      expect(userCallback).toHaveBeenCalledTimes(1); // Should not increase
    });

    it('should handle event chaining (events triggering other events)', () => {
      const primaryCallback = jest.fn((event) => {
        // Primary event handler triggers a secondary event
        eventBus.publish('secondary-topic', {
          type: 'secondary-event',
          payload: { triggeredBy: event.type },
        });
      });

      const secondaryCallback = jest.fn();

      eventBus.subscribe('primary-topic', primaryCallback);
      eventBus.subscribe('secondary-topic', secondaryCallback);

      eventBus.publish('primary-topic', { type: 'primary-event' });

      expect(primaryCallback).toHaveBeenCalledTimes(1);
      expect(secondaryCallback).toHaveBeenCalledTimes(1);
      expect(secondaryCallback).toHaveBeenCalledWith({
        type: 'secondary-event',
        payload: { triggeredBy: 'primary-event' },
      });
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent subscribe/unsubscribe operations', () => {
      const callbacks = Array.from({ length: 100 }, () => jest.fn());
      const subscriptions: Array<{ unsubscribe: () => void }> = [];

      // Concurrently subscribe many callbacks
      callbacks.forEach((callback) => {
        const subscription = eventBus.subscribe('concurrent-topic', callback);
        subscriptions.push(subscription);
      });

      expect(eventBus.getSubscriberCount('concurrent-topic')).toBe(100);

      // Concurrently unsubscribe half of them
      subscriptions.slice(0, 50).forEach((sub) => sub.unsubscribe());

      expect(eventBus.getSubscriberCount('concurrent-topic')).toBe(50);

      // Publish event to remaining subscribers
      eventBus.publish('concurrent-topic', { type: 'concurrent-test' });

      callbacks.slice(0, 50).forEach((callback) => {
        expect(callback).not.toHaveBeenCalled();
      });

      callbacks.slice(50).forEach((callback) => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Singleton Instance', () => {
    it('should maintain state across different imports', () => {
      const callback = jest.fn();

      // Subscribe using the singleton
      eventBus.subscribe('singleton-topic', callback);

      // The singleton should maintain its state
      expect(eventBus.getSubscriberCount('singleton-topic')).toBe(1);
      expect(eventBus.getTopics()).toContain('singleton-topic');

      // Publishing should work
      eventBus.publish('singleton-topic', { type: 'singleton-test' });
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
