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
  MESSAGE_START = 'message_start',
  MESSAGE_STOP = 'message_stop',
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
    content_blocks?: StreamingContentBlock[];
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
  content_blocks?: StreamingContentBlock[];
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

/**
 * Streaming content block types
 */

export const enum StreamingContentType {
  THINKING = 'thinking',
  TEXT = 'text',
  TOOL_USE = 'tool_use',
}

export const enum StreamingContentBlockType {
  CONTENT_BLOCK_START = 'content_block_start',
  CONTENT_BLOCK_DELTA = 'content_block_delta',
  CONTENT_BLOCK_STOP = 'content_block_stop',
}

export const enum StreamingContentBlockDeltaType {
  THINKING_DELTA = 'thinking_delta',
  TEXT_DELTA = 'text_delta',
  INPUT_JSON_DELTA = 'input_json_delta',
  TOOL_USE_BLOCK_UPDATE_DELTA = 'tool_use_block_update_delta',
}

export interface StreamingContentBlockBase {
  id?: string;
  index: number;
  name?: string;
  start_timestamp?: string;
  stop_timestamp?: string;
  is_complete: boolean;
}

export interface ThinkingContentBlock extends StreamingContentBlockBase {
  type: StreamingContentType.THINKING;
  content: string;
}

export interface TextContentBlock extends StreamingContentBlockBase {
  type: StreamingContentType.TEXT;
  content: string;
}

export interface ToolUseDisplayContent {
  type: string;
  json_block: string;
}

export interface ToolUseContentBlock extends StreamingContentBlockBase {
  type: StreamingContentType.TOOL_USE;
  input_json?: string;
  content?: string;
  message?: string;
  partial_json?: string;
  display_content?: ToolUseDisplayContent;
}

export type StreamingContentBlock = ThinkingContentBlock | TextContentBlock | ToolUseContentBlock;

export interface StreamingState extends ChatMessage {
  is_active: boolean;
}

export interface StreamEventContentBlockStart {
  type: StreamingContentBlockType.CONTENT_BLOCK_START;
  index: number;
  content_block: {
    type: StreamingContentType;
    id?: string;
    name?: string;
    start_timestamp?: string;
  };
}

export interface StreamEventThinkingDelta {
  type: StreamingContentBlockDeltaType.THINKING_DELTA;
  thinking: string;
}

export interface StreamEventTextDelta {
  type: StreamingContentBlockDeltaType.TEXT_DELTA;
  text: string;
}

export interface StreamEventInputJsonDelta {
  type: StreamingContentBlockDeltaType.INPUT_JSON_DELTA;
  partial_json: string;
}

export interface StreamEventToolUseUpdateDelta {
  type: StreamingContentBlockDeltaType.TOOL_USE_BLOCK_UPDATE_DELTA;
  message?: string;
  display_content?: ToolUseDisplayContent;
}

export type StreamEventDelta =
  | StreamEventThinkingDelta
  | StreamEventTextDelta
  | StreamEventInputJsonDelta
  | StreamEventToolUseUpdateDelta;

export interface StreamEventContentBlockDelta {
  type: StreamingContentBlockType.CONTENT_BLOCK_DELTA;
  index: number;
  delta: StreamEventDelta;
}

export interface StreamEventContentBlockStop {
  type: StreamingContentBlockType.CONTENT_BLOCK_STOP;
  index: number;
  content_block: {
    type: StreamingContentType;
  };
  stop_timestamp?: string;
}

export type StreamEventPayload =
  | StreamEventContentBlockStart
  | StreamEventContentBlockDelta
  | StreamEventContentBlockStop;
