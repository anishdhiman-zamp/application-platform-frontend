# @zamp-platform/chat Implementation Guide

## Overview

The `@zamp-platform/chat` package provides a comprehensive chat framework for real-time messaging with Server-Sent Events (SSE) support. It's designed to be used anywhere in the application where chat functionality is needed, with support for different resource types and annotation contexts.

## Architecture

The chat framework consists of several key components:

- **Core Hook**: `useChat` - Main hook for chat functionality
- **API Layer**: RTK Query mutations for conversation and message management
- **Types**: Comprehensive TypeScript interfaces and enums
- **Utilities**: Helper functions for message formatting and processing
- **SSE Integration**: Real-time event handling via `@zamp-platform/utils`

## Core API Interface

### useChat Hook

The main hook that provides chat functionality:

```typescript
import { useChat } from '@zamp-platform/chat';

const chat = useChat({
  conversationId?: string;
  eventUrl?: string;
  reconnectIntervalMs?: number;
  maxReconnectAttempts?: number;
  onNewMessage?: (message: ChatMessage) => void;
  onTypingUpdate?: (users: string[]) => void;
  onUserJoin?: (user: { id: string; name: string }) => void;
  onUserLeave?: (userId: string) => void;
});
```

#### Return Value

```typescript
{
  // SSE Connection State
  state: {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
  };

  // Connection Methods
  connect: (url: string) => void;
  disconnect: () => void;

  // Chat State
  messages: ChatMessage[];

  // Chat Actions
  sendMessage: (message: ChatMessage) => Promise<void>;
  createConversation: (payload: CreateConversationPayloadType) => Promise<string>;

  // Loading States
  isSendingMessage: boolean;
  isCreatingConversation: boolean;

  // Error States
  sendMessageError: any;
  createConversationError: any;
}
```

## Type Definitions

### Message Interface

```typescript
interface ChatMessage {
  resource_type: ResourceType;
  resource_id: string;
  message_content: {
    message: string;
  };
  message_type: ChatMessageType;
  sender_type: SenderType;
  metadata: Record<string, unknown>;
}
```

### Conversation Payload

```typescript
interface CreateConversationPayloadType {
  resource_id: string;
  resource_type: ResourceType;
  annotation_type: AnnotationType;
  message_content?: {
    message: string;
  };
}
```

## API Endpoints

The package uses RTK Query for API management with the following endpoints:

### Create Conversation

- **URL**: `/conversations/`
- **Method**: `POST`
- **Payload**: `CreateConversationPayloadType`
- **Response**: `{ conversation_id: string; status_message: string }`

### Post Message

- **URL**: `/conversations/{{conversationId}}/messages`
- **Method**: `POST`
- **Payload**: `{ conversationId: string; body: ChatMessage }`
- **Response**: `{ message: string }`

## Usage Patterns

### Basic Chat Implementation

```typescript
import React, { useEffect, useState } from 'react';
import { useChat, ResourceType, AnnotationType, ChatMessageType, SenderType } from '@zamp-platform/chat';

const ChatComponent = ({ resourceId, resourceType }) => {
  const [inputValue, setInputValue] = useState('');

  const chat = useChat({
    reconnectIntervalMs: 30000,
    maxReconnectAttempts: 5,
    onNewMessage: (message) => {
      console.log('New message:', message);
    },
  });

  useEffect(() => {
    const initChat = async () => {
      // Create conversation
      const conversationId = await chat.createConversation({
        resource_id: resourceId,
        resource_type: resourceType,
        annotation_type: AnnotationType.KB,
        message_content: {
          message: 'Hello, how are you?',
        },
      });

      // Connect to SSE events
      chat.connect(`/conversations/events?conversation_id=${conversationId}`);
    };

    initChat();
    return () => chat.disconnect();
  }, [resourceId, resourceType, chat.createConversation, chat.connect, chat.disconnect]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const messagePayload = {
      resource_id: resourceId,
      resource_type: resourceType,
      message_content: {
        message: inputValue,
      },
      message_type: ChatMessageType.TEXT,
      sender_type: SenderType.USER,
      metadata: {},
    };

    try {
      await chat.sendMessage(messagePayload);
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="chat-component">
      {/* Messages Display */}
      <div className="messages-container">
        {chat.messages.map((message, idx) => (
       <div key={message.id || `${message.resource_id}-${message.timestamp}`} className="message">
            <div className="message-header">
              <strong>{message.sender_type}</strong>
            </div>
            <div className="message-content">
              {message.message_content.message}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="input-area">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          disabled={!chat.state.isConnected}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || !chat.state.isConnected}
        >
          Send
        </button>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        Status: {chat.state.isConnected ? 'Connected' : 'Disconnected'}
        {chat.state.error && <span>Error: {chat.state.error}</span>}
      </div>
    </div>
  );
};
```

### Knowledge Base Chat

```typescript
const KnowledgeBaseChat = ({ documentId }) => {
  const chat = useChat({
    onNewMessage: (message) => {
      if (message.sender_type === SenderType.ASSISTANT) {
        // Handle AI assistant responses
        displayAssistantMessage(message);
      }
    },
  });

  useEffect(() => {
    const initKB = async () => {
      const conversationId = await chat.createConversation({
        resource_id: documentId,
        resource_type: ResourceType.DOCUMENT,
        annotation_type: AnnotationType.KB,
      });

      chat.connect(`/conversations/events?conversation_id=${conversationId}`);
    };

    initKB();
  }, [documentId]);

  // Component implementation...
};
```

### Process Feedback Chat

```typescript
const ProcessFeedbackChat = ({ processId }) => {
  const chat = useChat({
    onNewMessage: (message) => {
      // Handle feedback messages
      if (message.sender_type === SenderType.USER) {
        updateFeedbackCount();
      }
    },
  });

  useEffect(() => {
    const initFeedback = async () => {
      const conversationId = await chat.createConversation({
        resource_id: processId,
        resource_type: ResourceType.PROCESS,
        annotation_type: AnnotationType.FEEDBACK,
      });

      chat.connect(`/conversations/events?conversation_id=${conversationId}`);
    };

    initFeedback();
  }, [processId]);

  // Component implementation...
};
```

## Utility Functions

### Message Formatting

```typescript
import { formatMessageTime, groupMessagesByDate } from '@zamp-platform/chat';

// Format timestamp
const timeStr = formatMessageTime(message.timestamp); // "5m ago"

// Group messages by date
const grouped = groupMessagesByDate(messages);
```

### Message Processing

```typescript
import { sanitizeMessage, parseMessageMentions } from '@zamp-platform/chat';

// Sanitize user input
const safe = sanitizeMessage(userInput);

// Parse mentions
const { content, mentions } = parseMessageMentions('@john Hello there!');
```

## Integration with Redux

The chat framework integrates with the existing Redux Toolkit setup:

```typescript
import { useAppSelector } from 'hooks/toolkit';
import { useChat } from '@zamp-platform/chat';

const MyChatComponent = () => {
  const user = useAppSelector((state) => state.user.user);

  const chat = useChat({
    // Configuration...
  });

  // Component implementation using user data from Redux
};
```

## Error Handling

### Connection Errors

```typescript
const chat = useChat({
  onError: (error) => {
    console.error('Chat connection error:', error);
    // Handle connection errors
  },
});

// Check connection status
if (chat.state.error) {
  console.log('Connection error:', chat.state.error);
}
```

### Message Send Errors

```typescript
const handleSendMessage = async () => {
  try {
    await chat.sendMessage(messagePayload);
  } catch (error) {
    console.error('Failed to send message:', error);
    // Show user-friendly error message
    showErrorMessage('Failed to send message. Please try again.');
  }
};
```

### Loading States

```typescript
// Check if message is being sent
if (chat.isSendingMessage) {
  return <div>Sending message...</div>;
}

// Check if conversation is being created
if (chat.isCreatingConversation) {
  return <div>Initializing chat...</div>;
}
```

## Best Practices

### 1. Resource Management

Always clean up connections when components unmount:

```typescript
useEffect(() => {
  // Initialize chat
  return () => {
    chat.disconnect();
  };
}, []);
```

### 2. Error Boundaries

Wrap chat components in error boundaries:

```typescript
class ChatErrorBoundary extends React.Component {
  // Error boundary implementation
}

<ChatErrorBoundary>
  <ChatComponent />
</ChatErrorBoundary>
```

### 3. Performance Optimization

Use React.memo for chat components to prevent unnecessary re-renders:

```typescript
const ChatComponent = React.memo(({ resourceId, resourceType }) => {
  // Component implementation
});
```

### 4. Message Validation

Validate messages before sending:

```typescript
const validateMessage = (message: string) => {
  if (!message.trim()) return false;
  if (message.length > 1000) return false;
  return true;
};

const handleSendMessage = async () => {
  if (!validateMessage(inputValue)) {
    showErrorMessage('Invalid message');
    return;
  }
  // Send message
};
```

## Testing

### Unit Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useChat } from '@zamp-platform/chat';

describe('useChat', () => {
  it('should create conversation', async () => {
    const { result } = renderHook(() => useChat({}));

    await act(async () => {
      const conversationId = await result.current.createConversation({
        resource_id: 'test-id',
        resource_type: ResourceType.DOCUMENT,
        annotation_type: AnnotationType.KB,
      });

      expect(conversationId).toBeDefined();
    });
  });
});
```

### Integration Tests

```typescript
describe('ChatComponent Integration', () => {
  it('should send and receive messages', async () => {
    // Test implementation
  });
});
```

## Browser Support

- Modern browsers with EventSource support
- Automatic reconnection with exponential backoff
- Works with all major browsers (Chrome, Firefox, Safari, Edge)

## Dependencies

- `@zamp-platform/utils` - For SSE functionality
- `@zamp-platform/api` - For base API configuration
- `react` - For React hooks

## Migration Guide

### From Legacy Chat Implementation

1. Replace direct API calls with `useChat` hook
2. Update message structure to use new interfaces
3. Implement SSE connection for real-time updates
4. Update error handling to use new error states

### Breaking Changes

- Message structure has changed to include `resource_type` and `resource_id`
- SSE connection is now required for real-time functionality
- Error handling has been standardized across the framework

## Troubleshooting

### Common Issues

1. **Connection not established**: Check if `eventUrl` is correctly configured
2. **Messages not sending**: Verify `conversationId` is set before sending
3. **SSE events not received**: Ensure server supports SSE and CORS is configured
4. **Memory leaks**: Always call `disconnect()` in cleanup functions

### Debug Mode

Enable debug logging:

```typescript
const chat = useChat({
  // Enable debug mode
  debug: true,
});
```

## Future Enhancements

- Typing indicators
- Message reactions
- File attachments
- Message threading
- Read receipts
- User presence indicators
