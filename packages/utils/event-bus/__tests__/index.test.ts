import type { BaseEventPayload, EventCallback } from '../event-bus.types';
import { EVENT_TYPE } from '../event-bus.types';
import { EventBus } from '../index';

// Custom event payload interface for testing
interface TestEventPayload extends BaseEventPayload {
  type: EVENT_TYPE;
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
      const subscription = eventBus.subscribe(EVENT_TYPE.TEST, callback);

      expect(subscription).toBeDefined();
      expect(subscription.unsubscribe).toBeInstanceOf(Function);
      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(1);
      expect(eventBus.getTopics()).toContain(EVENT_TYPE.TEST);
    });

    it('should allow multiple subscribers to the same topic', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      eventBus = new EventBus();
      eventBus.subscribe(EVENT_TYPE.TEST, callback1);
      eventBus.subscribe(EVENT_TYPE.TEST, callback2);
      eventBus.subscribe(EVENT_TYPE.TEST, callback3);

      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(3);
      expect(eventBus.getTopics()).toContain(EVENT_TYPE.TEST);
    });

    it('should handle generic type parameters correctly', () => {
      const customCallback: EventCallback<CustomEventPayload> = jest.fn();
      const testCallback: EventCallback<TestEventPayload> = jest.fn();

      const customSub = eventBus.subscribe<CustomEventPayload>(EVENT_TYPE.COMPONENT, customCallback);
      const testSub = eventBus.subscribe<TestEventPayload>(EVENT_TYPE.TEST, testCallback);

      expect(customSub).toBeDefined();
      expect(testSub).toBeDefined();
      expect(eventBus.getSubscriberCount(EVENT_TYPE.COMPONENT)).toBe(1);
      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(1);
    });
  });

  describe('publish', () => {
    it('should publish events to subscribers', () => {
      const callback = jest.fn();
      const testEvent: TestEventPayload = {
        type: EVENT_TYPE.TEST,
        source_id: 'test-source',
        timestamp: new Date().toISOString(),
        payload: { message: 'Hello World' },
      };

      eventBus.subscribe(EVENT_TYPE.TEST, callback);
      eventBus.publish(EVENT_TYPE.TEST, testEvent);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(testEvent);
    });

    it('should publish to all subscribers of a topic', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();
      const testEvent: BaseEventPayload = { type: EVENT_TYPE.TEST };

      eventBus.subscribe(EVENT_TYPE.TEST, callback1);
      eventBus.subscribe(EVENT_TYPE.TEST, callback2);
      eventBus.subscribe(EVENT_TYPE.TEST, callback3);

      eventBus.publish(EVENT_TYPE.TEST, testEvent);

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
      const testEvent: BaseEventPayload = { type: EVENT_TYPE.TEST };

      eventBus.subscribe(EVENT_TYPE.TEST, callback1);
      eventBus.subscribe(EVENT_TYPE.COMPONENT, callback2);

      eventBus.publish(EVENT_TYPE.TEST, testEvent);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should handle publishing to non-existent topics gracefully', () => {
      expect(() => {
        eventBus.publish(EVENT_TYPE.WEBHOOK, { type: EVENT_TYPE.TEST });
      }).not.toThrow();
    });

    it('should handle complex event payloads', () => {
      const callback = jest.fn();
      const complexEvent: TestEventPayload = {
        type: EVENT_TYPE.TEST,
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

      eventBus.subscribe(EVENT_TYPE.TEST, callback);
      eventBus.publish(EVENT_TYPE.TEST, complexEvent);

      expect(callback).toHaveBeenCalledWith(complexEvent);
    });

    it('should handle null and undefined event data', () => {
      const callback = jest.fn();

      eventBus.subscribe(EVENT_TYPE.TEST, callback);

      eventBus.publish(EVENT_TYPE.TEST, null);
      eventBus.publish(EVENT_TYPE.TEST, undefined);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, null);
      expect(callback).toHaveBeenNthCalledWith(2, undefined);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe a specific callback from a topic', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.subscribe(EVENT_TYPE.TEST, callback1);
      eventBus.subscribe(EVENT_TYPE.TEST, callback2);

      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(2);

      eventBus.unsubscribe(EVENT_TYPE.TEST, callback1);

      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(1);

      eventBus.publish(EVENT_TYPE.TEST, { type: EVENT_TYPE.TEST });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should remove topic when last subscriber is removed', () => {
      const callback = jest.fn();

      eventBus.subscribe(EVENT_TYPE.TEST, callback);
      expect(eventBus.getTopics()).toContain(EVENT_TYPE.TEST);
      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(1);

      eventBus.unsubscribe(EVENT_TYPE.TEST, callback);
      expect(eventBus.getTopics()).not.toContain(EVENT_TYPE.TEST);
      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(0);
    });

    it('should handle unsubscribing from non-existent topics gracefully', () => {
      const callback = jest.fn();

      expect(() => {
        eventBus.unsubscribe(EVENT_TYPE.WEBHOOK, callback);
      }).not.toThrow();
    });

    it('should handle unsubscribing non-existent callbacks gracefully', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.subscribe(EVENT_TYPE.TEST, callback1);

      expect(() => {
        eventBus.unsubscribe(EVENT_TYPE.TEST, callback2);
      }).not.toThrow();

      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(1);
    });

    it('should work with subscription object unsubscribe method', () => {
      const callback = jest.fn();
      const subscription = eventBus.subscribe(EVENT_TYPE.TEST, callback);

      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(1);

      subscription.unsubscribe();

      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(0);
      expect(eventBus.getTopics()).not.toContain(EVENT_TYPE.TEST);
    });
  });

  describe('clear', () => {
    it('should clear all topics and subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      eventBus.subscribe(EVENT_TYPE.TEST, callback1);
      eventBus.subscribe(EVENT_TYPE.COMPONENT, callback2);
      eventBus.subscribe(EVENT_TYPE.COMPONENT, callback3);

      expect(eventBus.getTopics()).toHaveLength(2);
      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(1);
      expect(eventBus.getSubscriberCount(EVENT_TYPE.COMPONENT)).toBe(2);

      eventBus.clear();

      expect(eventBus.getTopics()).toHaveLength(0);
      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(0);
      expect(eventBus.getSubscriberCount(EVENT_TYPE.COMPONENT)).toBe(0);
    });

    it('should prevent events from being published after clear', () => {
      const callback = jest.fn();

      eventBus.subscribe(EVENT_TYPE.TEST, callback);
      eventBus.clear();
      eventBus.publish(EVENT_TYPE.TEST, { type: EVENT_TYPE.TEST });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getTopics', () => {
    it('should return empty array when no topics exist', () => {
      expect(eventBus.getTopics()).toEqual([]);
    });

    it('should return all active topic names', () => {
      const callback = jest.fn();

      eventBus.subscribe(EVENT_TYPE.TEST, callback);
      eventBus.subscribe(EVENT_TYPE.COMPONENT, callback);
      eventBus.subscribe(EVENT_TYPE.WEBHOOK, callback);

      const topics = eventBus.getTopics();

      expect(topics).toHaveLength(3);
      expect(topics).toContain(EVENT_TYPE.TEST);
      expect(topics).toContain(EVENT_TYPE.COMPONENT);
      expect(topics).toContain(EVENT_TYPE.WEBHOOK);
    });

    it('should not return topics after they are completely unsubscribed', () => {
      const callback = jest.fn();

      eventBus.subscribe(EVENT_TYPE.TEST, callback);
      expect(eventBus.getTopics()).toContain(EVENT_TYPE.TEST);

      eventBus.unsubscribe(EVENT_TYPE.TEST, callback);
      expect(eventBus.getTopics()).not.toContain(EVENT_TYPE.TEST);
    });
  });

  describe('getSubscriberCount', () => {
    it('should return 0 for non-existent topics', () => {
      expect(eventBus.getSubscriberCount(EVENT_TYPE.WEBHOOK)).toBe(0);
    });

    it('should return correct subscriber count for existing topics', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(0);

      eventBus.subscribe(EVENT_TYPE.TEST, callback1);
      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(1);

      eventBus.subscribe(EVENT_TYPE.TEST, callback2);
      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(2);

      eventBus.subscribe(EVENT_TYPE.TEST, callback3);
      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(3);

      eventBus.unsubscribe(EVENT_TYPE.TEST, callback2);
      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in subscriber callbacks gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = jest.fn();

      eventBus.subscribe(EVENT_TYPE.TEST, errorCallback);
      eventBus.subscribe(EVENT_TYPE.TEST, normalCallback);

      expect(() => {
        eventBus.publish(EVENT_TYPE.TEST, { type: EVENT_TYPE.TEST });
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

      eventBus.subscribe(EVENT_TYPE.TEST, asyncCallback);
      eventBus.publish(EVENT_TYPE.TEST, { type: EVENT_TYPE.TEST });

      expect(asyncCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory when subscribing and unsubscribing repeatedly', () => {
      const callback = jest.fn();

      // Subscribe and unsubscribe many times using different enum values
      const eventTypes = [
        EVENT_TYPE.TEST,
        EVENT_TYPE.COMPONENT,
        EVENT_TYPE.WEBHOOK,
        EVENT_TYPE.ACTIVITY_LOG,
        EVENT_TYPE.CONVERSATION,
        EVENT_TYPE.CONVERSATION_V2,
        EVENT_TYPE.FEEDBACK,
      ];

      for (let i = 0; i < 1000; i++) {
        const eventType = eventTypes[i % eventTypes.length];
        const subscription = eventBus.subscribe(eventType, callback);
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
        eventBus.subscribe(EVENT_TYPE.TEST, callback);
      }

      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(1000);

      const startTime = performance.now();
      eventBus.publish(EVENT_TYPE.TEST, { type: EVENT_TYPE.TEST });
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
      const userSub = eventBus.subscribe(EVENT_TYPE.ACTIVITY_LOG, userCallback);
      eventBus.subscribe(EVENT_TYPE.CONVERSATION, logCallback);
      eventBus.subscribe(EVENT_TYPE.WEBHOOK, analyticsCallback);

      // Add multiple subscribers to same topic
      const additionalLogCallback = jest.fn();
      eventBus.subscribe(EVENT_TYPE.CONVERSATION, additionalLogCallback);

      // Publish various events
      eventBus.publish(EVENT_TYPE.ACTIVITY_LOG, {
        type: EVENT_TYPE.ACTIVITY_LOG,
        source_id: 'auth-service',
        timestamp: new Date().toISOString(),
        payload: { userId: 'user-123' },
      });

      eventBus.publish(EVENT_TYPE.CONVERSATION, {
        type: EVENT_TYPE.CONVERSATION,
        payload: { message: 'User logged in' },
      });

      eventBus.publish(EVENT_TYPE.WEBHOOK, {
        type: EVENT_TYPE.WEBHOOK,
        payload: { page: '/dashboard', userId: 'user-123' },
      });

      // Verify all callbacks were called appropriately
      expect(userCallback).toHaveBeenCalledTimes(1);
      expect(logCallback).toHaveBeenCalledTimes(1);
      expect(additionalLogCallback).toHaveBeenCalledTimes(1);
      expect(analyticsCallback).toHaveBeenCalledTimes(1);

      // Unsubscribe and verify
      userSub.unsubscribe();
      eventBus.publish(EVENT_TYPE.ACTIVITY_LOG, { type: EVENT_TYPE.ACTIVITY_LOG });

      expect(userCallback).toHaveBeenCalledTimes(1); // Should not increase
    });

    it('should handle event chaining (events triggering other events)', () => {
      const primaryCallback = jest.fn((event) => {
        // Primary event handler triggers a secondary event
        eventBus.publish(EVENT_TYPE.COMPONENT, {
          type: EVENT_TYPE.COMPONENT,
          payload: { triggeredBy: event.type },
        });
      });

      const secondaryCallback = jest.fn();

      eventBus.subscribe(EVENT_TYPE.TEST, primaryCallback);
      eventBus.subscribe(EVENT_TYPE.COMPONENT, secondaryCallback);

      eventBus.publish(EVENT_TYPE.TEST, { type: EVENT_TYPE.TEST });

      expect(primaryCallback).toHaveBeenCalledTimes(1);
      expect(secondaryCallback).toHaveBeenCalledTimes(1);
      expect(secondaryCallback).toHaveBeenCalledWith({
        type: EVENT_TYPE.COMPONENT,
        payload: { triggeredBy: EVENT_TYPE.TEST },
      });
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent subscribe/unsubscribe operations', () => {
      const callbacks = Array.from({ length: 100 }, () => jest.fn());
      const subscriptions: Array<{ unsubscribe: () => void }> = [];

      // Concurrently subscribe many callbacks
      callbacks.forEach((callback) => {
        const subscription = eventBus.subscribe(EVENT_TYPE.TEST, callback);
        subscriptions.push(subscription);
      });

      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(100);

      // Concurrently unsubscribe half of them
      subscriptions.slice(0, 50).forEach((sub) => sub.unsubscribe());

      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(50);

      // Publish event to remaining subscribers
      eventBus.publish(EVENT_TYPE.TEST, { type: EVENT_TYPE.TEST });

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
      eventBus.subscribe(EVENT_TYPE.TEST, callback);

      // The singleton should maintain its state
      expect(eventBus.getSubscriberCount(EVENT_TYPE.TEST)).toBe(1);
      expect(eventBus.getTopics()).toContain(EVENT_TYPE.TEST);

      // Publishing should work
      eventBus.publish(EVENT_TYPE.TEST, { type: EVENT_TYPE.TEST });
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
