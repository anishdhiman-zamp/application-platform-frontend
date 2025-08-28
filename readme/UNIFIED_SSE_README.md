# Unified SSE Architecture

This document describes the unified Server-Sent Events (SSE) architecture implemented in the application platform frontend. This new system replaces individual SSE channels with a single unified SSE connection and event bus pattern for better resource management and centralized event handling.

## Overview

The unified SSE architecture introduces:

1. **Single SSE Connection**: One unified SSE connection instead of multiple individual channels
2. **Event Bus Pattern**: Centralized event distribution system for decoupled communication
3. **Context Provider**: React context for managing SSE connection state across the application
4. **Type-Safe Events**: Strongly typed event system with predefined event types

## Architecture Components

### 1. Event Bus (`packages/utils/event-bus/`)

The event bus is a generic pub/sub system that supports any type of event communication:

```typescript
import { eventBus } from '@zamp-platform/utils';

// Subscribe to events
const subscription = eventBus.subscribe('activity_log', (event) => {
  console.log('Received activity log event:', event);
});

// Publish events
eventBus.publish('activity_log', { type: 'activity_log', data: {...} });

// Unsubscribe
subscription.unsubscribe();
```

#### Event Types

Predefined event types are available in `EVENT_TYPES` enum:

```typescript
export enum EVENT_TYPES {
  ACTIVITY_LOG = 'activity_log',
  CONVERSATION = 'conversation',
  WEBHOOK = 'webhook',
  COMPONENT = 'component',
}
```

### 2. SSE Context Provider (`apps/application-dashboard/src/contexts/SSEContext.tsx`)

The SSE context manages the unified SSE connection and integrates with the event bus:

```typescript
import { useSSEContext } from '@/contexts/SSEContext';

function MyComponent() {
  const { state, connect, disconnect } = useSSEContext();

  // Check connection status
  if (state.isConnected) {
    // SSE is connected
  }

  return <div>SSE Status: {state.isConnected ? 'Connected' : 'Disconnected'}</div>;
}
```

The provider automatically:

- Connects to the unified SSE endpoint (`/events`)
- Parses incoming SSE messages
- Publishes events to the event bus based on message type
- Handles reconnection logic (30s intervals, max 5 attempts)
- Provides connection state to components

### 3. Provider Integration

The SSE provider is integrated at the application level in `apps/application-dashboard/src/app/_providers/providers.tsx`:

```typescript
<SSEProvider>
  <RouteGuard>{children}</RouteGuard>
</SSEProvider>
```

This ensures the unified SSE connection is available throughout the application.

## Usage Patterns

### Subscribing to Activity Log Events

```typescript
import { useCallback, useEffect } from 'react';
import { eventBus } from '@zamp-platform/utils';

export function useActivitySSE({ activityId, processId }) {
  const handleUpdate = useCallback(
    (event: MessageEvent) => {
      // Handle activity update
      const data = event?.data;
      if (!data) return;

      // Refresh activity data
      getActivityLogs({ processId, activityRunId: activityId });
    },
    [processId, activityId],
  );

  useEffect(() => {
    const sub = eventBus.subscribe('activity_log', (evt: MessageEvent) => {
      const data = JSON.parse(evt.data);

      // Filter events by source_id
      if (data.source_id === activityId) {
        handleUpdate(evt);
      }
    });

    return sub.unsubscribe;
  }, [activityId, handleUpdate]);
}
```

### Chat Integration

```typescript
import { eventBus } from '@zamp-platform/utils';
import { EVENT_TYPES } from '@zamp-platform/utils/event-bus/event-bus.types';

export const useChat = (config) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const sub = eventBus.subscribe(EVENT_TYPES.CONVERSATION, (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      // Filter by conversation ID
      if (data.source_id === conversationId) {
        handleMessage(data);
      }
    });

    return () => sub.unsubscribe();
  }, [conversationId]);
};
```

### Component with SSE Status

```typescript
import { useSSEContext } from '@/contexts/SSEContext';

export const ChatComponent = () => {
  const sseContext = useSSEContext();

  return (
    <div>
      <input
        disabled={!sseContext?.state?.isConnected}
        placeholder="Type a message..."
      />
      <div className="status-bar">
        Status: {sseContext?.state?.isConnected ? 'Connected' : 'Disconnected'}
        {sseContext?.state?.error && (
          <span>Error: {sseContext?.state?.error}</span>
        )}
      </div>
    </div>
  );
};
```

## Event Payload Structure

All events follow the `BaseEventPayload` interface:

```typescript
interface BaseEventPayload {
  type: string; // Event type (e.g., 'activity_log', 'conversation')
  source_id?: string; // Source identifier for filtering
  timestamp?: string; // Event timestamp
  payload?: Record<string, unknown>; // Event-specific data
}
```

Example SSE message:

```json
{
  "type": "activity_log",
  "source_id": "activity_123",
  "timestamp": "2025-08-28T10:30:00Z",
  "payload": {
    "status": "completed",
    "result": "success"
  }
}
```

## Migration Guide

### Before: Individual SSE Connections

```typescript
// Old approach - multiple SSE connections
const useActivitySSE = (activityId) => {
  const [eventSource, setEventSource] = useState(null);

  useEffect(() => {
    const es = new EventSource(`/api/activity/${activityId}/events`);
    es.onmessage = (event) => {
      // Handle event
    };
    setEventSource(es);

    return () => es.close();
  }, [activityId]);
};

const useChatSSE = (conversationId) => {
  const [eventSource, setEventSource] = useState(null);

  useEffect(() => {
    const es = new EventSource(`/api/chat/${conversationId}/events`);
    es.onmessage = (event) => {
      // Handle event
    };
    setEventSource(es);

    return () => es.close();
  }, [conversationId]);
};
```

### After: Unified SSE with Event Bus

```typescript
// New approach - single SSE connection with event bus
const useActivitySSE = (activityId) => {
  useEffect(() => {
    const sub = eventBus.subscribe('activity_log', (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.source_id === activityId) {
        // Handle event
      }
    });

    return sub.unsubscribe;
  }, [activityId]);
};

const useChatSSE = (conversationId) => {
  useEffect(() => {
    const sub = eventBus.subscribe(EVENT_TYPES.CONVERSATION, (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.source_id === conversationId) {
        // Handle event
      }
    });

    return sub.unsubscribe;
  }, [conversationId]);
};
```

## Benefits

### Resource Efficiency

- **Single Connection**: One SSE connection instead of multiple reduces server load and client resource usage
- **Automatic Reconnection**: Built-in reconnection logic with exponential backoff
- **Connection Pooling**: Shared connection across all components

### Better Architecture

- **Decoupled Components**: Event bus enables loose coupling between SSE events and components
- **Type Safety**: Strongly typed event system prevents runtime errors
- **Centralized Management**: Single point of control for all SSE-related functionality

### Developer Experience

- **Consistent API**: Uniform interface for all SSE event handling
- **Easy Testing**: Event bus can be easily mocked for testing
- **Debugging**: Centralized event logging and monitoring

## Best Practices

### 1. Event Filtering

Always filter events by `source_id` to ensure components only process relevant events:

```typescript
const sub = eventBus.subscribe('activity_log', (event: MessageEvent) => {
  const data = JSON.parse(event.data);
  if (data.source_id === targetId) {
    // Process event
  }
});
```

### 2. Cleanup Subscriptions

Always unsubscribe from events to prevent memory leaks:

```typescript
useEffect(() => {
  const sub = eventBus.subscribe('event_type', handler);
  return sub.unsubscribe; // Cleanup on unmount
}, []);
```

### 3. Error Handling

Handle JSON parsing errors when processing SSE events:

```typescript
const sub = eventBus.subscribe('event_type', (event: MessageEvent) => {
  try {
    const data = JSON.parse(event.data);
    // Process data
  } catch (error) {
    console.error('Failed to parse SSE event:', error);
  }
});
```

### 4. Connection Status Checks

Check SSE connection status before enabling interactive features:

```typescript
const sseContext = useSSEContext();

<button
  disabled={!sseContext?.state?.isConnected}
  onClick={handleAction}
>
  Send Message
</button>
```

## Adding New Event Types

To add a new event type:

1. **Add to EVENT_TYPES enum** in `packages/utils/event-bus/event-bus.types.ts`:

```typescript
export enum EVENT_TYPES {
  ACTIVITY_LOG = 'activity_log',
  CONVERSATION = 'conversation',
  WEBHOOK = 'webhook',
  COMPONENT = 'component',
  NEW_EVENT_TYPE = 'new_event_type', // Add here
}
```

2. **Create typed interface** for the event payload:

```typescript
interface NewEventPayload extends BaseEventPayload {
  type: 'new_event_type';
  payload: {
    // Define specific payload structure
    customField: string;
  };
}
```

3. **Subscribe to the new event type**:

```typescript
const sub = eventBus.subscribe(EVENT_TYPES.NEW_EVENT_TYPE, (event: MessageEvent) => {
  const data = JSON.parse(event.data) as NewEventPayload;
  // Handle new event type
});
```

## API Endpoint

The unified SSE system connects to a single endpoint:

- **Endpoint**: `/events` (defined as `UNIFIED_SSE` in `API_ENDPOINTS`)
- **URL**: `${API_DOMAIN}/events`
- **Protocol**: Server-Sent Events (SSE)

## Troubleshooting

### Connection Issues

- Check network connectivity
- Verify the SSE endpoint is accessible
- Monitor browser developer tools for SSE connection errors

### Event Not Received

- Verify event type matches subscription
- Check `source_id` filtering logic
- Ensure event bus subscription is active

### Memory Leaks

- Confirm all subscriptions are properly cleaned up
- Use React DevTools to monitor component unmounting
- Check for lingering event listeners

## Technical Implementation Details

### SSE Hook Configuration

```typescript
const sseHook = useSSE({
  reconnectIntervalMs: 30000, // 30 second reconnection interval
  maxReconnectAttempts: 5, // Maximum 5 reconnection attempts
  url: `${API_DOMAIN}/${API_ENDPOINTS.UNIFIED_SSE}`,
  eventListeners: {
    update: handleSSEEvent, // Handle 'update' events
    message: handleSSEEvent, // Handle 'message' events
  },
});
```

### Event Processing Flow

1. SSE message received from server
2. `handleSSEEvent` parses JSON data
3. Event published to event bus using `data.type` as topic
4. Subscribed components receive and filter events
5. Components process relevant events based on `source_id`

This unified architecture provides a robust, scalable foundation for real-time event handling across the application platform frontend.
