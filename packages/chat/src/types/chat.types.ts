import { type Block, HITL_RESPONSE_TYPE, type InputRequiredPayload } from './block.types';

export interface PostMessagePayloadType {
  conversationId: string;
  body: ChatMessage;
}

export interface PostMessageResponseType {
  message: string;
}

export interface StopConversationPayloadType {
  conversationId: string;
}

export interface StopConversationResponseType {
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
  PROCESS_SOP = 'PROCESS_SOP',
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
  SOP = 'sop',
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
  OUTPUT_FILES = 'output_files',
  TITLE_UPDATED = 'title_updated',
  BROWSER_STREAMING_AVAILABLE = 'browser_streaming_available',
  BROWSER_STREAMING_UNAVAILABLE = 'browser_streaming_unavailable',
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
    file_references?: FileReferenceType[];
    /** @deprecated Use file_references instead. Kept for backward compatibility with S3 uploads. */
    attachments?: MessageAttachmentType[];
  };
  message_type: ChatMessageType;
  sender_type: SenderType;
  metadata: Record<string, unknown>;
  timestamp: string;
  sender_name?: string;
  id?: string;
  conversation_id?: string;
  llm_model?: string;
  state?: MessageState;
  pev_enabled?: boolean;
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

export interface FileReferenceType {
  path: string;
  name: string;
}

/**
 * @deprecated Use FileReferenceType instead. This type is kept for backward compatibility.
 */
export interface MessageAttachmentType {
  file_id: string;
  file_name?: string;
}

export interface MessageContentType {
  text: string;
  text_type: string;
  elements?: Block[];
  file_references?: FileReferenceType[];
  /** @deprecated Use file_references instead. Kept for backward compatibility with S3 uploads. */
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
  | ({ type: LocationType.PROCESS } & { data: ProcessLocationData })
  | ({ type: LocationType.SOP } & { data: ProcessLocationData });

export interface AnnotationData {
  location: LocationData;
}

export interface CreateConversationPayloadTypeV2 {
  resource_id: string;
  resource_type: ResourceType;
  scope_type: string;
  scope_id: string;
  annotation_type?: AnnotationType;
  annotation_data?: AnnotationData;
  message_content: MessageContentType;
  sender_name?: string;
  llm_model?: string;
  metadata?: Record<string, unknown>;
  pev_enabled?: boolean;
}

export interface AnnotationLocationDataType {
  process_id: string;
  activity_run_id: string;
  dataset_id?: string;
  dataset_row_id?: string;
  dataset_field_id?: string;
  log_id?: string;
}

export enum SummaryStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

/** One grouped step summary for a slice of message elements (HITL / task summary `step_groups`). */
export interface ConversationSummaryStepGroup {
  summary: string;
  element_ids: string[];
}

export interface ConversationSummary {
  status: SummaryStatus;
  content?: string;
  live_lines?: string[];
  generated_at?: string;
  updated_at?: string;
  /**
   * Step groups keyed by assistant message id. Each value lists groups for that message only.
   * Legacy shape: a flat array (all groups, any message) — see `resolveStepGroups` in the app.
   */
  step_groups?: Record<string, ConversationSummaryStepGroup[]> | ConversationSummaryStepGroup[];
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
  summary?: ConversationSummary | null;
}

export interface ConversationMessageContentType {
  elements: Block[];
}

export const enum MessageState {
  STREAMING = 'STREAMING',
  DONE = 'DONE',
}

export interface ConversationMessageType {
  id: string;
  organization_id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: SenderType;
  sender_name: string;
  state: MessageState;
  intent: string | null;
  content: ConversationMessageContentType;
  created_at: string;
  deleted_at: string | null;
}
export interface GetConversationByIdResponseType {
  conversation: ConversationType;
  messages: ConversationMessageType[];
  /** Pending input gates (e.g. select_one) keyed per entity; from GET conversation API */
  inputs_required?: ConversationInputRequiredItem[];
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

export interface GetOutputFileDownloadRequestType {
  conversationId: string;
  filename: string;
}

export interface GetBrowserStreamingNovncRequestType {
  conversationId: string;
  sessionId: string;
}

export interface BrowserStreamingNovncResponseType {
  novnc_url: string;
  /** Same-origin Pantheon proxy for iframes; falls back to novnc_url if absent. */
  proxy_iframe_url?: string | null;
  expires_in_seconds: number;
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

export interface StreamingState extends ChatMessage {
  is_active: boolean;
}

/**
 * Chat Feedback API Types
 */
export const enum ChatFeedbackCategory {
  HELPFUL = 'HELPFUL',
  UI_BUG = 'UI_BUG',
  OVERACTIVE_REFUSAL = 'OVERACTIVE_REFUSAL',
  DID_NOT_FOLLOW_REQUEST = 'DID_NOT_FOLLOW_REQUEST',
  NOT_FACTUALLY_CORRECT = 'NOT_FACTUALLY_CORRECT',
  INCOMPLETE_RESPONSE = 'INCOMPLETE_RESPONSE',
  SHOULD_HAVE_SEARCHED_WEB = 'SHOULD_HAVE_SEARCHED_WEB',
  MEMORY_NOT_APPLIED = 'MEMORY_NOT_APPLIED',
  KNOW_BETTER_APPROACH = 'KNOW_BETTER_APPROACH',
  REPORT_CONTENT = 'REPORT_CONTENT',
  OTHER = 'OTHER',
}

export const enum FeedbackSentiment {
  THUMBS_UP = 'thumbs_up',
  THUMBS_DOWN = 'thumbs_down',
}

export interface SubmitChatFeedbackRequestType {
  conversationId: string;
  messageId: string;
  body: {
    category: ChatFeedbackCategory;
    description: string;
    file_upload_ids?: string[];
    sentiment?: FeedbackSentiment;
  };
}

export interface SubmitChatFeedbackResponseType {
  success: boolean;
  message: string;
}

/** Breadcrumb entry for parent-child task navigation */
export interface TaskBreadcrumb {
  id: string;
  title: string;
  status?: string;
}

/** Sibling task entry for subtask pagination */
export interface SiblingTask {
  id: string;
  title: string;
  status: string;
}

export enum HITLEntityType {
  CONVERSATION = 'CONVERSATION',
  TASK = 'TASK',
}

/** Shape of `input_required_data` on GET conversation `inputs_required[]` items */
export type ConversationInputRequiredData = Omit<InputRequiredPayload, 'entity_id' | 'entity_type'>;

export interface ConversationInputRequiredItem {
  entity_id: string;
  entity_type: HITLEntityType;
  input_required_data: ConversationInputRequiredData;
  input_id?: string;
}

export interface HITLSourceEntity {
  entity_type: HITLEntityType;
  entity_id: string;
}

export interface HITLResponseSelectOne {
  type: typeof HITL_RESPONSE_TYPE.SELECT_ONE;
  selected_option: string | null;
  custom_input?: string | null;
  is_skipped?: boolean;
}

export interface HITLResponseMultipleChoice {
  type: typeof HITL_RESPONSE_TYPE.MULTIPLE_CHOICE;
  selected_options: string[];
  custom_input?: string | null;
  is_skipped?: boolean;
}

export interface HITLResponseApproval {
  type: typeof HITL_RESPONSE_TYPE.APPROVAL;
  approved: boolean;
  is_skipped?: boolean;
}

export interface HITLResponseText {
  type: typeof HITL_RESPONSE_TYPE.TEXT;
  text: string;
  is_skipped?: boolean;
}

export type HITLResponse = HITLResponseSelectOne | HITLResponseMultipleChoice | HITLResponseApproval | HITLResponseText;

export interface HITLResponseItem {
  entity_type: string;
  entity_id: string;
  response: HITLResponse;
  input_id?: string;
}

export interface HITLRespondPayloadType {
  source_entity: HITLSourceEntity;
  responses: HITLResponseItem[];
}
