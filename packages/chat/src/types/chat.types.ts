import { Block } from '../..';

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
  ORGANIZATION = 'organization',
}

export const enum SenderType {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

export const enum AnnotationType {
  KB = 'KB',
  FEEDBACK = 'FEEDBACK',
}

export const enum ScopeType {
  ACTIVITY_RUN = 'activity_run',
  PROCESS = 'process',
  ORGANIZATION = 'organization',
}

export const enum LocationType {
  DATASET_FIELD = 'dataset_field',
  LOG = 'log',
  ACTIVITY_RUN = 'activity_run',
  PROCESS = 'process',
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
  title: string;
}

export const enum SSEEventType {
  MESSAGE = 'CHAT_MESSAGE',
  TYPING = 'typing',
  USER_JOIN = 'user_join',
  USER_LEAVE = 'user_leave',
  SYSTEM = 'system',
  ERROR = 'error',
  NEW_CHAT_MESSAGE = 'new_chat_message',
  CONVERSATION_UPDATED = 'conversation_updated',
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

export interface MessageAttachmentType {
  file_id: string;
  file_name?: string;
}
export interface MessageContentType {
  text: string;
  text_type: string;
  elements?: Block[];
  attachments?: MessageAttachmentType[];
}

export interface DatasetFieldLocationData {
  process_id: string;
  activity_run_id: string;
  dataset_id: string;
  dataset_row_id: string;
  dataset_field_id: string;
}

export interface LogLocationData {
  process_id: string;
  activity_run_id: string;
  log_id: string;
}

export interface ActivityRunLocationData {
  process_id: string;
  activity_run_id: string;
}

export interface ProcessLocationData {
  process_id: string;
}

export type LocationData =
  | ({ type: LocationType.DATASET_FIELD } & { data: DatasetFieldLocationData })
  | ({ type: LocationType.LOG } & { data: LogLocationData })
  | ({ type: LocationType.ACTIVITY_RUN } & { data: ActivityRunLocationData })
  | ({ type: LocationType.PROCESS } & { data: ProcessLocationData });

export interface AnnotationData {
  location: LocationData;
}

export interface CreateConversationPayloadTypeV2 {
  resource_id: string;
  resource_type: ResourceType;
  scope_type: string;
  scope_id: string;
  annotation_data?: AnnotationData;
  message_content: MessageContentType;
  sender_name?: string;
}

export interface AnnotationLocationDataType {
  process_id: string;
  activity_run_id: string;
  dataset_id?: string;
  dataset_row_id?: string;
  dataset_field_id?: string;
  log_id?: string;
}

export interface ConversationType {
  id: string;
  organization_id: string;
  workflow_run_ids: string[];
  active_workflow_run_id: string;
  annotation_type: AnnotationType;
  conversation_configuration_id: string;
  initiator_id: string;
  initiator_type: SenderType;
  status: string;
  metadata: Record<string, unknown>;
  scope_type: ScopeType;
  scope_id: string;
  channel: string;
  resource_id: string;
  resource_type: ResourceType;
  title: string;
}

export interface ConversationMessageContentType {
  elements: Block[];
}
export interface ConversationMessageType {
  id: string;
  organization_id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: SenderType;
  sender_name: string;
  intent: string | null;
  content: ConversationMessageContentType;
  created_at: string;
  deleted_at: string | null;
}
export interface GetConversationByIdResponseType {
  conversation: ConversationType;
  messages: ConversationMessageType[];
}

export interface GetConversationByIdRequestType {
  conversationId: string;
  resourceId?: string;
  resourceType?: ResourceType;
  url?: string;
}

export interface GetFilesByIdsRequestType {
  ids: string[];
}

export interface GetFilesByIdsResponseType {
  file_uploads: FileUploadType[];
}

export interface FileUploadType {
  file_upload_id: string;
  organization_id: string;
  uploaded_by_user_id: string;
  name: string;
  file_type: string;
  storage_provider: string;
  storage_bucket: string;
  storage_file_path: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface GetFileDownloadUrlRequestType {
  file_upload_id: string;
}

export interface GetFileDownloadUrlResponseType {
  download_url: string;
  file_upload_id: string;
  file_name: string;
  expiry: string;
}

/**
 * File Upload API Types
 */
export interface SignedUrlResponseType {
  file_name: string;
  file_type: string;
  file_upload_id: string;
  key: string;
  upload_url: string;
}

export interface SignedUrlBodyType {
  path: string;
  payload: {
    file_name: string;
    file_type: string;
    organization_id: string;
  };
}

/**
 * Interaction API Types
 */
export interface DependentElementInteraction {
  element_id: string;
  payload: {
    selected_option_id: string;
  };
}

export interface MessageInteractionPayload {
  is_clicked?: boolean;
  dependent_elements_interactions?: DependentElementInteraction[];
}

export interface Interaction {
  element_id: string;
  payload: MessageInteractionPayload;
}

export interface PostInteractionPayloadType {
  conversationId: string;
  messageId: string;
  params: {
    resource_id: string;
    resource_type: string;
  };
  body: {
    interactions: Interaction[];
  };
}

export interface PostInteractionResponseType {
  success: boolean;
  message_id: string;
  conversation_id: string;
  status_message: string;
  message: {
    id: string;
    organization_id: string;
    conversation_id: string;
    sender_id: string;
    sender_type: SenderType;
    sender_name: string;
    intent: string;
    content: {
      elements: Block[];
    };
    created_at: string;
  };
}

export interface PostInteractionDisablePayloadType {
  conversationId: string;
  messageId: string;
  params: {
    resource_id: string;
    resource_type: string;
  };
}

/**
 * Voice Agent / Speech-to-Text API Types
 */
export interface GenerateSpeechToTextAccessTokenRequest {
  ttl_seconds?: number;
}

export interface GenerateSpeechToTextAccessTokenResponse {
  access_token: string;
  expires_in: number;
}

export const enum StreamingContentType {
  THINKING = 'thinking',
  TEXT = 'text',
  TOOL_USE = 'tool_use',
}

export interface ThinkingContentBlock {
  type: StreamingContentType.THINKING;
  index: number;
  content: string;
  startTimestamp?: string;
  stopTimestamp?: string;
  isComplete: boolean;
}

export interface TextContentBlock {
  type: StreamingContentType.TEXT;
  index: number;
  content: string;
  startTimestamp?: string;
  stopTimestamp?: string;
  isComplete: boolean;
}

export interface ToolUseDisplayContent {
  type: string;
  json_block: string;
}

export interface ToolUseContentBlock {
  type: StreamingContentType.TOOL_USE;
  index: number;
  id?: string;
  name?: string;
  partialJson: string;
  displayContent?: ToolUseDisplayContent;
  message?: string;
  startTimestamp?: string;
  stopTimestamp?: string;
  isComplete: boolean;
}

export type StreamingContentBlock = ThinkingContentBlock | TextContentBlock | ToolUseContentBlock;

export interface StreamingState {
  sourceId: string;
  contentBlocks: StreamingContentBlock[];
  isActive: boolean;
}

export type StreamEventType =
  | 'message_start'
  | 'content_block_start'
  | 'content_block_delta'
  | 'content_block_stop'
  | 'message_stop';

export interface StreamEventContentBlockStart {
  type: 'content_block_start';
  index: number;
  content_block: {
    type: StreamingContentType;
    id?: string;
    name?: string;
    start_timestamp?: string;
  };
}

export interface StreamEventThinkingDelta {
  type: 'thinking_delta';
  thinking: string;
}

export interface StreamEventTextDelta {
  type: 'text_delta';
  text: string;
}

export interface StreamEventInputJsonDelta {
  type: 'input_json_delta';
  partial_json: string;
}

export interface StreamEventToolUseUpdateDelta {
  type: 'tool_use_block_update_delta';
  message?: string;
  display_content?: ToolUseDisplayContent;
}

export type StreamEventDelta =
  | StreamEventThinkingDelta
  | StreamEventTextDelta
  | StreamEventInputJsonDelta
  | StreamEventToolUseUpdateDelta;

export interface StreamEventContentBlockDelta {
  type: 'content_block_delta';
  index: number;
  delta: StreamEventDelta;
}

export interface StreamEventContentBlockStop {
  type: 'content_block_stop';
  index: number;
  content_block: {
    type: StreamingContentType;
  };
  stop_timestamp?: string;
}

export interface StreamEventMessageStart {
  type: 'message_start';
}

export interface StreamEventMessageStop {
  type: 'message_stop';
}

export type StreamEventPayload =
  | StreamEventContentBlockStart
  | StreamEventContentBlockDelta
  | StreamEventContentBlockStop
  | StreamEventMessageStop;
