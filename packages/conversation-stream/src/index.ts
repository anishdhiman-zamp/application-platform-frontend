// Types
export * from './types/conversation-sse.types';

// Provider
export type { ConversationActions } from './provider/ConversationActionsContext';
export { ConversationActionsContext } from './provider/ConversationActionsContext';
export type { ConversationProviderProps } from './provider/ConversationProvider';
export { ConversationProvider } from './provider/ConversationProvider';
export type { ConversationState } from './provider/ConversationStateContext';
export { ConversationStateContext } from './provider/ConversationStateContext';

// Hooks
export type { ChatInputActions, UseChatInputProps, UseChatInputReturn } from './hooks/useChatInput';
export { useChatInput } from './hooks/useChatInput';
export { useConversationActions } from './hooks/useConversationActions';
export type { UseConversationSSEConfig, UseConversationSSEReturn } from './hooks/useConversationSSE';
export { useConversationSSE } from './hooks/useConversationSSE';
export { useConversationState } from './hooks/useConversationState';
export { useTypewriter } from '@zamp-platform/chat';

// Components
export type { ConnectedChatInputProps } from './components/ConnectedChatInput';
export { ConnectedChatInput } from './components/ConnectedChatInput';

// Handlers
export type { ConversationEventCallbacks } from './handlers/conversationEventHandler';
export { handleConversationSSEEvent } from './handlers/conversationEventHandler';
export { handleContentBlockEvent } from './handlers/streamingBlockHandler';

// Registry
export { conversationSSERegistry } from './registry/conversationSSERegistry';
export { openSSEConnection } from './registry/openSSEConnection';
