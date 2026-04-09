// Types
export * from './types/conversation-sse.types';
export type { TaskEventCallbacks } from './types/task-sse.types';

// Provider — Conversation
export type { ConversationActions } from './provider/ConversationActionsContext';
export { ConversationActionsContext, createConversationActions } from './provider/ConversationActionsContext';
export type { ConversationProviderProps } from './provider/ConversationProvider';
export { ConversationProvider } from './provider/ConversationProvider';
export type { ConversationState } from './provider/ConversationStateContext';
export { ConversationStateContext } from './provider/ConversationStateContext';

// Provider — Task
export type { TaskActions } from './provider/TaskActionsContext';
export { TaskActionsContext } from './provider/TaskActionsContext';
export type { TaskProviderProps } from './provider/TaskProvider';
export { TaskProvider } from './provider/TaskProvider';
export type { TaskState } from './provider/TaskStateContext';
export { TaskStateContext } from './provider/TaskStateContext';

// Hooks — Conversation
export type { ChatInputActions, UseChatInputProps, UseChatInputReturn } from './hooks/useChatInput';
export { useChatInput } from './hooks/useChatInput';
export { useConversationActions } from './hooks/useConversationActions';
export type { UseConversationSSEConfig, UseConversationSSEReturn } from './hooks/useConversationSSE';
export { useConversationSSE } from './hooks/useConversationSSE';
export { useConversationState } from './hooks/useConversationState';
export { useTypewriter } from '@zamp-platform/chat';

// Hooks — Task
export { useTaskActions } from './hooks/useTaskActions';
export { useTaskState } from './hooks/useTaskState';

// Components
export type { ConnectedChatInputProps } from './components/ConnectedChatInput';
export { ConnectedChatInput } from './components/ConnectedChatInput';

// Handlers
export type { ConversationEventCallbacks } from './handlers/conversationEventHandler';
export { handleConversationSSEEvent } from './handlers/conversationEventHandler';
export { handleContentBlockEvent } from './handlers/streamingBlockHandler';
export { handleTaskSSEEvent } from './handlers/taskEventHandler';

// Registry
export { conversationSSERegistry } from './registry/conversationSSERegistry';
export type { SSESourceType } from './registry/openSSEConnection';
export { openSSEConnection } from './registry/openSSEConnection';
export { taskSSERegistry } from './registry/taskSSERegistry';
