export interface PostMessagePayloadType {
  conversationId: string;
  body: ChatMessage;
}

export interface PostMessageResponseType {
  message: string;
}

export const enum ResourceType {
  PROCESS = 'process',
  DATASET = 'dataset',
  DOCUMENT = 'document',
}

export const enum SenderType {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

export const enum AnnotationType {
  KB = 'KB',
  FEEDBACK = 'FEEDBACK',
}

export interface CreateConversationPayloadType {
  resource_id: string;
  resource_type: ResourceType;
  annotation_type: AnnotationType;
  message_content?: {
    message: string;
  };
}

export interface CreateConversationResponseType {
  conversation_id: string;
  status_message: string;
}

export const enum SSEEventType {
  MESSAGE = 'CHAT_MESSAGE',
  TYPING = 'typing',
  USER_JOIN = 'user_join',
  USER_LEAVE = 'user_leave',
  SYSTEM = 'system',
  ERROR = 'error',
}

export const enum ChatMessageType {
  TEXT = 'TEXT',
  SYSTEM = 'system',
  TYPING = 'typing',
  ERROR = 'error',
}

export interface SSEChatConfig {
  endpoint: string;
  chatId: string;
  userId: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface ChatMessage {
  resource_type: ResourceType;
  resource_id: string;
  message_content: {
    message: string;
  };
  message_type: ChatMessageType;
  sender_type: SenderType;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface ChatState {
  messages: ChatMessage[];
  typingUsers: string[];
  connectedUsers: ChatUser[];
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface ChatActions {
  sendMessage: (message: ChatMessage) => Promise<void>;
  connect: () => void;
  disconnect: () => void;
  markAsRead: (messageId: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
}

export type ChatFramework = ChatState & ChatActions;
