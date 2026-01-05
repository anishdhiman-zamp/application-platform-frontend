# @zamp-platform/chat

A comprehensive chat package for building real-time conversational interfaces with support for rich message blocks, voice transcription, and file attachments.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Components](#core-components)
  - [ConnectedChatInput](#connectedchatinput)
  - [MessageContainer](#messagecontainer)
  - [Message](#message)
- [Core Hooks](#core-hooks)
  - [useChat](#usechat)
- [Types](#types)
- [Complete Usage Example](#complete-usage-example)
- [Additional Documentation](#additional-documentation)

## Overview

The `@zamp-platform/chat` package provides:

- **Real-time messaging** with SSE (Server-Sent Events) support
- **Rich message blocks** (plain text, markdown, buttons, single-select, question groups, attachments)
- **Voice transcription** with ElevenLabs and Deepgram integration
- **File attachments** with upload support
- **Conversation management** (create, send messages, history)

## Installation

The package is part of the monorepo and can be imported directly:

```typescript
import {
  ConnectedChatInput,
  MessageContainer,
  useChat,
  ResourceType,
  ScopeType,
  LocationType,
  SenderType,
} from '@zamp-platform/chat';
```

## Quick Start

Here's a minimal example to get started:

```typescript
'use client';
import { useChat, MessageContainer, ConnectedChatInput, ResourceType, ScopeType, LocationType } from '@zamp-platform/chat';

const SimpleChat = () => {
  const chat = useChat({
    resourceId: 'your-resource-id',
    resourceType: ResourceType.PROCESS,
    conversationId: 'your-conversation-id',
  });

  return (
    <div className="flex h-full flex-col">
      <MessageContainer
        messages={chat.messages}
        handleAction={() => {}}
        isAnalysing={false}
      />
      <ConnectedChatInput
        chat={chat}
        annotationLocation={{
          type: LocationType.PROCESS,
          data: { process_id: 'your-process-id' },
        }}
        scope={ScopeType.PROCESS}
        currentUserName="User"
        resourceId="your-resource-id"
        scopeId="your-scope-id"
        organizationId="your-org-id"
      />
    </div>
  );
};
```

## Core Components

### ConnectedChatInput

A fully-featured chat input component with voice recording, file attachments, and real-time messaging capabilities.

#### Props

| Prop                 | Type                         | Required | Default             | Description                   |
| -------------------- | ---------------------------- | -------- | ------------------- | ----------------------------- |
| `chat`               | `ReturnType<typeof useChat>` | ✅       | -                   | The chat hook instance        |
| `annotationLocation` | `LocationData`               | ✅       | -                   | Location context for messages |
| `conversationId`     | `string`                     | ❌       | -                   | Existing conversation ID      |
| `resourceType`       | `ResourceType`               | ❌       | `PROCESS`           | Type of resource              |
| `isDisabled`         | `boolean`                    | ❌       | `false`             | Disable input                 |
| `scope`              | `ScopeType`                  | ❌       | `ACTIVITY_RUN`      | Message scope                 |
| `autoFocus`          | `boolean`                    | ❌       | `false`             | Auto-focus on mount           |
| `placeholder`        | `string`                     | ❌       | `'Ask anything...'` | Input placeholder             |
| `currentUserName`    | `string`                     | ✅       | -                   | Current user's name           |
| `resourceId`         | `string`                     | ✅       | -                   | Resource identifier           |
| `scopeId`            | `string`                     | ✅       | -                   | Scope identifier              |
| `organizationId`     | `string`                     | ✅       | -                   | Organization identifier       |
| `acceptedFileTypes`  | `string`                     | ❌       | -                   | Allowed file MIME types       |
| `onError`            | `(error: unknown) => void`   | ❌       | -                   | Error callback                |
| `onSuccess`          | `(message: string) => void`  | ❌       | -                   | Success callback              |

#### Features

- **Text Input**: Auto-resizing textarea with keyboard submit (Enter)
- **Voice Recording**: Built-in microphone support with audio visualization
- **File Attachments**: Drag-and-drop or click to attach files
- **Loading States**: Visual feedback during message sending

#### Example

```typescript
import dynamic from 'next/dynamic';
import { ConnectedChatInputProps } from '@zamp-platform/chat';

// Dynamic import for SSR compatibility
const ConnectedChatInput = dynamic<ConnectedChatInputProps>(
  () => import('@zamp-platform/chat').then((mod) => mod.ConnectedChatInput),
  { ssr: false },
);

<ConnectedChatInput
  chat={chat}
  placeholder="Ask anything or give feedback..."
  annotationLocation={{
    type: LocationType.PROCESS,
    data: { process_id: 'abc-123' },
  }}
  conversationId="conv-456"
  isDisabled={isAnalysing}
  scope={ScopeType.PROCESS}
  autoFocus={true}
  currentUserName="John Doe"
  resourceId="resource-789"
  scopeId="scope-101"
  organizationId="org-202"
/>
```

### MessageContainer

Displays a scrollable list of chat messages with auto-scroll on new messages.

#### Props

| Prop           | Type                                                                      | Required | Description                      |
| -------------- | ------------------------------------------------------------------------- | -------- | -------------------------------- |
| `messages`     | `ChatMessage[]`                                                           | ✅       | Array of messages to display     |
| `handleAction` | `(blockConfig: ButtonBlockType, payload: Record<string, string>) => void` | ✅       | Handler for block button actions |
| `isAnalysing`  | `boolean`                                                                 | ✅       | Show loading indicator           |

#### Example

```typescript
import { MessageContainer, ButtonBlockType } from '@zamp-platform/chat';

const handleAction = (blockConfig: ButtonBlockType, payload: Record<string, string>) => {
  console.log('Action triggered:', blockConfig, payload);
  // Handle the action (e.g., make API call)
};

<MessageContainer
  messages={chat.messages}
  handleAction={handleAction}
  isAnalysing={isWaitingForResponse}
/>
```

### Message

Individual message component that renders different message types and block content.

```typescript
import { Message, ChatMessage, ButtonBlockType } from '@zamp-platform/chat';

<Message
  message={chatMessage}
  onAction={handleAction}
  assistantName="Pace"
  assistantAvatar={<PaceAvatar />}
  userAvatar={(senderName) => <Avatar name={senderName} />}
/>
```

## Core Hooks

### useChat

The main hook for managing chat state and operations.

#### Configuration

```typescript
interface ChatConfig {
  resourceId?: string;
  resourceType?: ResourceType;
  conversationId?: string;
  eventUrl?: string;
  onNewMessage?: (message: ChatMessage) => void;
  onTypingUpdate?: (users: string[]) => void;
  setHeader?: (header: string) => void;
  refetchConversationHistory?: boolean;
}
```

#### Return Value

```typescript
{
  messages: ChatMessage[];
  sendMessage: (payload: ChatMessage, useV2Api?: boolean) => Promise<Response>;
  clearMessages: () => void;
  isSendingMessage: boolean;
  createConversation: (payload: CreateConversationPayloadType) => Promise<string>;
  createConversationV2: (payload: CreateConversationPayloadTypeV2) => Promise<Response>;
  isCreatingConversation: boolean;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  isLoadingConversationHistory: boolean;
  conversationId: string | null;
  setConversationId: Dispatch<SetStateAction<string | null>>;
}
```

#### Example

```typescript
import { useChat, ResourceType, SenderType } from '@zamp-platform/chat';

const chat = useChat({
  resourceId: 'process-123',
  resourceType: ResourceType.PROCESS,
  conversationId: 'existing-conv-id', // Optional: omit to create new
  setHeader: (title) => setPageTitle(title),
  onNewMessage: (message) => {
    console.log('New message received:', message);
  },
});

// Check if waiting for assistant response
const isAnalysing = useMemo(() => {
  const lastMessage = chat.messages[chat.messages.length - 1];
  return lastMessage?.sender_type === SenderType.USER;
}, [chat.messages]);
```

## Types

### ResourceType

```typescript
enum ResourceType {
  PROCESS = 'process',
  DATASET = 'dataset',
  DOCUMENT = 'document',
}
```

### ScopeType

```typescript
enum ScopeType {
  ACTIVITY_RUN = 'activity_run',
  PROCESS = 'process',
}
```

### LocationType

```typescript
enum LocationType {
  DATASET_FIELD = 'dataset_field',
  LOG = 'log',
  ACTIVITY_RUN = 'activity_run',
  PROCESS = 'process',
}
```

### LocationData

```typescript
type LocationData =
  | { type: LocationType.DATASET_FIELD; data: DatasetFieldLocationData }
  | { type: LocationType.LOG; data: LogLocationData }
  | { type: LocationType.ACTIVITY_RUN; data: ActivityRunLocationData }
  | { type: LocationType.PROCESS; data: ProcessLocationData };
```

### SenderType

```typescript
enum SenderType {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}
```

### ChatMessage

```typescript
interface ChatMessage {
  resource_type: ResourceType;
  resource_id: string;
  message_content: {
    message?: string;
    elements?: Block[];
    text?: string;
    text_type?: string;
    attachments?: MessageAttachmentType[];
  };
  message_type: ChatMessageType;
  sender_type: SenderType;
  metadata: Record<string, unknown>;
  timestamp: string;
  sender_name?: string;
  id?: string;
  conversation_id?: string;
}
```

## Complete Usage Example

Here's a complete example based on the `KnowledgeBaseChat` component:

```typescript
'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  ButtonBlockType,
  ConnectedChatInputProps,
  LocationType,
  MessageContainer,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
} from '@zamp-platform/chat';
import { CirclePlus, EllipsisVertical } from 'lucide-react';
import dynamic from 'next/dynamic';
import { RootState } from '@/store';

// Dynamic import for SSR compatibility
const ConnectedChatInput = dynamic<ConnectedChatInputProps>(
  () => import('@zamp-platform/chat').then((mod) => mod.ConnectedChatInput),
  { ssr: false },
);

interface KnowledgeBaseChatProps {
  processId: string;
  conversationId: string;
  scopeId: string;
}

const KnowledgeBaseChat = ({ processId, conversationId, scopeId }: KnowledgeBaseChatProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Get user info from Redux store
  const currentUserName = useSelector((state: RootState) => state?.user?.user?.user_name);
  const organizationId = useSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id ?? '');

  // Initialize the chat hook
  const chat = useChat({
    resourceId: processId,
    resourceType: ResourceType.PROCESS,
    conversationId: conversationId,
    // Optional: Update page header when conversation title changes
    // setHeader: (title) => setPageTitle(title),
    // Optional: Refetch conversation history on mount
    // refetchConversationHistory: true,
  });

  // Determine if we're waiting for the assistant's response
  const isAnalysing = useMemo(() => {
    const lastMessage = chat?.messages[chat?.messages?.length - 1];
    return lastMessage?.sender_type === SenderType.USER;
  }, [chat?.messages?.length]);

  // Handle block button actions (e.g., from single-select + button combinations)
  const handleAction = (blockConfig: ButtonBlockType, payload: Record<string, string>) => {
    console.log('Block action:', blockConfig, payload);
    // Example: Make API call based on action type
    // if (blockConfig.action.type === ActionType.INTERNAL_API) {
    //   await submitChoice(payload);
    // }
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    if (chat?.messages?.length > 0) {
      scrollToBottom('smooth');
    }
  }, [chat?.messages?.length]);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="border-GRAY_400 flex w-full items-center gap-3 border-b px-3.5 py-3">
        <div className="f-14-500 text-GRAY_1000 flex-grow">
          Generated feedback title
        </div>
        <EllipsisVertical size={12} className="text-GRAY_700 cursor-pointer" />
        <CirclePlus size={12} className="text-GRAY_700 cursor-pointer" />
      </div>

      {/* Messages */}
      <MessageContainer
        messages={chat?.messages || []}
        handleAction={handleAction}
        isAnalysing={isAnalysing}
      />

      {/* Input */}
      <div className="border-GRAY_400 w-full border-t p-3">
        <div className="flex flex-shrink-0">
          <ConnectedChatInput
            chat={chat}
            placeholder="Ask anything or give feedback..."
            annotationLocation={{
              type: LocationType.PROCESS,
              data: {
                process_id: processId,
              },
            }}
            conversationId={conversationId}
            isDisabled={isAnalysing}
            scope={ScopeType.PROCESS}
            autoFocus={true}
            currentUserName={currentUserName || ''}
            resourceId={processId}
            scopeId={scopeId}
            organizationId={organizationId}
          />
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseChat;
```

## Additional Documentation

- [Block Renderer Documentation](./BLOCK_RENDERER.md) - Detailed guide on rendering rich message blocks
- [Implementation Guide](./IMPL.md) - Internal implementation details

## Exports

The package exports the following:

### Components

- `ConnectedChatInput` - Full-featured chat input
- `MessageContainer` - Message list container
- `Message` - Individual message component
- `BlockRenderer` - Rich block content renderer
- `AudioVisualizer` - Voice recording visualizer
- `SenderDetails` - Message sender info display

### Block Components

- `PlainTextBlock`
- `MarkdownBlock`
- `ButtonBlock`
- `RadioButtonBlock` (SingleSelect)
- `QuestionGroupBlock`
- `AttachmentsBlock`
- `Attachment`

### Hooks

- `useChat` - Main chat state management
- `useChatInput` - Input field logic
- `useChatAdapters` - API adapters
- `useTranscription` - Voice transcription
- `useMicrophoneRecorder` - Microphone access
- `useElevenlabsConnection` - ElevenLabs STT
- `useDeepgramConnection` - Deepgram STT

### Types

- `ChatMessage`, `ChatConfig`
- `ResourceType`, `ScopeType`, `LocationType`, `SenderType`
- `Block`, `BLOCK_TYPE`, `ActionType`
- `ButtonBlockType`, `PlainTextBlockType`, `MarkdownBlockType`
- `SingleSelectBlockType`, `QuestionGroupBlockType`, `AttachmentsBlockType`
- `LocationData`, `AnnotationData`
- And more...

### Utilities

- `fileUpload` - File upload utilities

## Dependencies

- `@zamp-platform/ui` - UI components
- `@zamp-platform/utils` - Shared utilities
- `@elevenlabs/react` - Voice transcription
- `react-markdown` - Markdown rendering
- `rehype-slug`, `remark-gfm` - Markdown plugins
