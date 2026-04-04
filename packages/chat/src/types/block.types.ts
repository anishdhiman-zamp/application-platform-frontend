export const enum BLOCK_TYPE {
  PLAIN_TEXT = 'plain_text',
  MARKDOWN = 'markdown',
  SINGLE_SELECT = 'single_select',
  BUTTON = 'button',
  QUESTION_GROUP = 'question_group',
  QUESTION = 'question',
  FILE_REFERENCES = 'file_references',
  TEXT = 'text',
  TOOL_USE = 'tool_use',
  TOOL_RESULT = 'tool_result',
  THINKING = 'thinking',
  OUTPUT_FILES = 'output_files',
  TASK = 'task',
  INPUTS_RESPONDED = 'inputs_responded',
}

export const enum ActionType {
  STATE_UPDATE = 'state_update',
  INTERNAL_API = 'internal_api',
  INTERNAL_REDIRECT = 'internal_redirect',
}

export const enum DisplayLayerActionType {
  SEND_BUTTON_TEXT_AS_NEW_MESSAGE = 'send_button_text_as_new_message',
  SEND_BUTTON_TEXT_WITH_SELECTED_OPTION = 'send_button_text_with_selected_option',
  SEND_BUTTON_TEXT_WITH_STOP_PROCESSING = 'send_button_text_with_stop_processing',
}

export interface SingleSelectOption {
  id: string;
  type: 'plain_text' | 'markdown';
  label: string;
  value: string;
}

export interface BlockAction {
  type: ActionType;
  dependent_elements?: string[];
  action_id: string;
  url?: string;
  display_layer_action?: DisplayLayerActionType;
}

export interface BlockInteraction {
  interacted_by_id: string;
  interacted_by_name: string;
  interacted_at: string;
  payload: {
    is_clicked: boolean;
    dependent_elements_interactions: Record<string, string>;
  };
}

export interface BlockPayload {
  id: string;
  is_disabled: boolean;
  label: string;
  value: string;
  is_display?: boolean;
}

export interface PlainTextBlockType {
  id: string;
  type: BLOCK_TYPE.PLAIN_TEXT;
  order: number;
  payload: {
    text: string;
  };
}

export interface MarkdownBlockType {
  id: string;
  type: BLOCK_TYPE.MARKDOWN;
  order: number;
  payload: {
    text: string;
  };
}

export interface SingleSelectBlockType {
  id: string;
  type: BLOCK_TYPE.SINGLE_SELECT;
  order: number;
  payload: {
    options: SingleSelectOption[];
    initial_value?: string;
    action: BlockAction;
  };
}

export interface ButtonBlockType {
  id: string;
  type: BLOCK_TYPE.BUTTON;
  order: number;
  payload: BlockPayload;
  action: BlockAction;
  interaction: BlockInteraction;
}

export interface QuestionBlockType {
  id: string;
  type: BLOCK_TYPE.QUESTION;
  order: number;
  payload: {
    type: TEXT_TYPE;
    question: string;
  };
}

export interface QuestionGroupBlockType {
  id: string;
  type: BLOCK_TYPE.QUESTION_GROUP;
  order: number;
  payload: {
    questions: QuestionBlockType[];
  };
}

export interface FileReferencesBlockType {
  id: string;
  order: number;
  type: BLOCK_TYPE.FILE_REFERENCES;
  payload: {
    file_references: { path: string; name: string }[];
  };
}

export interface OutputFileType {
  filename: string;
  s3_path: string;
  file_type: string;
}

export interface OutputFilesBlockType {
  id: string;
  order: number;
  type: BLOCK_TYPE.OUTPUT_FILES;
  payload: {
    output_files: OutputFileType[];
  };
}

export const TASK_STATUS = {
  COMPLETED: 'COMPLETED',
  IN_PROGRESS: 'IN_PROGRESS',
  FAILED: 'FAILED',
  NEEDS_INPUT: 'NEEDS_INPUT',
  CANCELED: 'CANCELED',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export interface TaskBlockType {
  id: string;
  order: number;
  type: BLOCK_TYPE.TASK;
  payload: {
    id: string;
    title: string;
    task_id: string;
    status?: TaskStatus;
  };
}

export interface HITLOption {
  id: string;
  label: string;
  title?: string;
  description: string;
}

/** `input_type` on `input_required` / HITL question payloads (API contract). */
export const HITL_INPUT_TYPE = {
  SELECT_ONE: 'select_one',
  MULTIPLE_CHOICE: 'multiple_choice',
  APPROVAL: 'approval',
} as const;

/** Legacy `input_type` from older APIs; treat as {@link HITL_INPUT_TYPE.MULTIPLE_CHOICE}. */
export const HITL_INPUT_TYPE_LEGACY = {
  MULTI_SELECT: 'multi-select',
} as const;

export type HITLInputType =
  | (typeof HITL_INPUT_TYPE)[keyof typeof HITL_INPUT_TYPE]
  | (typeof HITL_INPUT_TYPE_LEGACY)[keyof typeof HITL_INPUT_TYPE_LEGACY];

export interface HITLQuestion {
  id: string;
  text?: string;
  question?: string;
  /** Null/empty when `input_type` is {@link HITL_INPUT_TYPE.APPROVAL}. */
  options: HITLOption[] | null;
  is_multi_select?: boolean;
  input_type?: HITLInputType;
  allow_custom_input?: boolean;
}

/** Discriminator strings for HITL `/hitl/respond` and `inputs_responded` payloads (API contract). */
export const HITL_RESPONSE_TYPE = {
  SELECT_ONE: 'select_one',
  MULTIPLE_CHOICE: 'multiple_choice',
  APPROVAL: 'approval',
  /** Legacy `inputs_responded` rows only; do not send on `/hitl/respond`. */
  FREE_TEXT: 'free_text',
} as const;

export interface InputRequiredPayload {
  question: string;
  /** Null when `input_type` is {@link HITL_INPUT_TYPE.APPROVAL}. */
  options: HITLOption[] | null;
  input_type: HITLInputType;
  allow_custom_input: boolean;
  entity_id?: string;
  entity_type?: string;
}

/** Answer shape for a single row inside `inputs_responded` (mirrors HITL respond payload). */
export interface InputsRespondedSelectOne {
  type: typeof HITL_RESPONSE_TYPE.SELECT_ONE;
  selected_option: string | null;
  custom_input?: string | null;
  is_skipped?: boolean;
}

export interface InputsRespondedMultipleChoice {
  type: typeof HITL_RESPONSE_TYPE.MULTIPLE_CHOICE;
  selected_options: string[];
  custom_input?: string | null;
  is_skipped?: boolean;
}

export interface InputsRespondedApproval {
  type: typeof HITL_RESPONSE_TYPE.APPROVAL;
  approved: boolean;
  is_skipped?: boolean;
}

/** Legacy `inputs_responded` rows from older APIs. */
export interface InputsRespondedFreeText {
  type: typeof HITL_RESPONSE_TYPE.FREE_TEXT;
  free_text: string;
}

export type InputsRespondedAnswer =
  | InputsRespondedSelectOne
  | InputsRespondedMultipleChoice
  | InputsRespondedApproval
  | InputsRespondedFreeText;

export interface InputsRespondedItemPayload {
  response: InputsRespondedAnswer;
  entity_id: string;
  entity_type: string;
  sender_name?: string;
  input_required: InputRequiredPayload;
}

export interface InputsRespondedBlockType {
  id: string;
  type: BLOCK_TYPE.INPUTS_RESPONDED;
  order: number;
  payload: {
    responses: InputsRespondedItemPayload[];
  };
  action?: null;
  interaction?: null;
  metadata?: null;
}

export enum TEXT_TYPE {
  PLAIN_TEXT = 'plain_text',
  MARKDOWN = 'markdown',
}

export type Block =
  | PlainTextBlockType
  | MarkdownBlockType
  | SingleSelectBlockType
  | ButtonBlockType
  | QuestionGroupBlockType
  | QuestionBlockType
  | FileReferencesBlockType
  | OutputFilesBlockType
  | TaskBlockType
  | InputsRespondedBlockType
  | ThinkingContentBlock
  | TextContentBlock
  | ToolUseContentBlock
  | ToolResultContentBlock
  | TaskContentBlock;
export interface BlockMessage {
  block: Block[];
}

export interface UploadedFileType {
  path: string;
  name: string;
  file_type?: string;
  file?: File;
}

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
  TOOL_RESULT_DELTA = 'tool_result_delta',
  TASK_DELTA = 'task_delta',
}

export interface StreamingContentBlockBase {
  id?: string;
  order: number;
  name?: string;
  start_timestamp?: string;
  stop_timestamp?: string;
  is_complete: boolean;
}

export interface ThinkingContentBlock extends StreamingContentBlockBase {
  type: BLOCK_TYPE.THINKING;
  payload: {
    thinking: string;
  };
}

export interface TextContentBlock extends StreamingContentBlockBase {
  type: BLOCK_TYPE.TEXT;
  payload: {
    text: string;
  };
}

export interface ToolUseDisplayContent {
  type: string;
  json_block: string;
}

export interface ToolUseContentBlock extends StreamingContentBlockBase {
  type: BLOCK_TYPE.TOOL_USE;
  payload: {
    input_json?: string;
    message?: string;
    partial_json?: string;
    display_content?: ToolUseDisplayContent;
    name?: string;
    tool_call_id?: string;
    display_name?: string;
    icon?: string;
  };
}

export interface ToolResultContentBlock extends StreamingContentBlockBase {
  type: BLOCK_TYPE.TOOL_RESULT;
  payload: {
    content: string;
    is_error: boolean;
    tool_call_id?: string;
  };
}

export interface TaskContentBlock extends StreamingContentBlockBase {
  type: BLOCK_TYPE.TASK;
  payload: {
    id: string;
    title: string;
    task_id: string;
    status?: TaskStatus;
  };
}

export interface StreamEventContentBlockStart {
  type: StreamingContentBlockType.CONTENT_BLOCK_START;
  index: number;
  content_block: {
    type: BLOCK_TYPE;
    id?: string;
    name?: string;
    start_timestamp?: string;
    tool_call_id?: string;
    display_name?: string;
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

export interface StreamEventToolResultDelta {
  type: StreamingContentBlockDeltaType.TOOL_RESULT_DELTA;
  content: string;
  is_error: boolean;
  tool_call_id?: string;
}

export interface StreamEventTaskDelta {
  type: StreamingContentBlockDeltaType.TASK_DELTA;
  title?: string;
  status?: TaskStatus;
}

export type StreamEventDelta =
  | StreamEventThinkingDelta
  | StreamEventTextDelta
  | StreamEventInputJsonDelta
  | StreamEventToolUseUpdateDelta
  | StreamEventToolResultDelta
  | StreamEventTaskDelta;

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
