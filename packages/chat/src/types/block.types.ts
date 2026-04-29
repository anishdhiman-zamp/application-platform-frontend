export const enum BLOCK_TYPE {
  PLAIN_TEXT = 'plain_text',
  MARKDOWN = 'markdown',
  SINGLE_SELECT = 'single_select',
  BUTTON = 'button',
  QUESTION_GROUP = 'question_group',
  QUESTION = 'question',
  FILE_REFERENCES = 'file_references',
  REFERENCES = 'references',
  TEXT = 'text',
  TOOL_USE = 'tool_use',
  TOOL_RESULT = 'tool_result',
  THINKING = 'thinking',
  OUTPUT_FILES = 'output_files',
  TASK = 'task',
  AGENT = 'agent',
  TRIGGER = 'trigger',
  INSTRUCTIONS_UPDATED = 'instructions_updated',
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

/** Fields shared by every block in the {@link Block} union. */
export interface BlockBaseType {
  id: string;
  order: number;
  is_complete?: boolean;
}

export interface PlainTextBlockType extends BlockBaseType {
  type: BLOCK_TYPE.PLAIN_TEXT;
  payload: {
    text: string;
  };
}

export interface MarkdownBlockType extends BlockBaseType {
  type: BLOCK_TYPE.MARKDOWN;
  payload: {
    text: string;
  };
}

export interface SingleSelectBlockType extends BlockBaseType {
  type: BLOCK_TYPE.SINGLE_SELECT;
  payload: {
    options: SingleSelectOption[];
    initial_value?: string;
    action: BlockAction;
  };
}

export interface ButtonBlockType extends BlockBaseType {
  type: BLOCK_TYPE.BUTTON;
  payload: BlockPayload;
  action: BlockAction;
  interaction: BlockInteraction;
}

export interface QuestionBlockType extends BlockBaseType {
  type: BLOCK_TYPE.QUESTION;
  payload: {
    type: TextType;
    question: string;
  };
}

export interface QuestionGroupBlockType extends BlockBaseType {
  type: BLOCK_TYPE.QUESTION_GROUP;
  payload: {
    questions: QuestionBlockType[];
  };
}

export interface FileReferencesBlockType extends BlockBaseType {
  type: BLOCK_TYPE.FILE_REFERENCES;
  payload: {
    file_references: { path: string; name: string }[];
  };
}

/**
 * A single @-mention reference within a message's references block. Shared
 * between the block payload and renderers that consume individual refs.
 */
export interface ReferenceRef {
  kind: string;
  resource_id: string;
  display_label?: string;
  icon_hint?: string | null;
  provider_hints?: Record<string, unknown>;
  text_range?: [number, number] | null;
}

/**
 * Generic @-mention reference block. Backend ships history with this shape
 * once references migrate off the legacy `file_references` block.
 */
export interface ReferencesBlockType extends BlockBaseType {
  type: BLOCK_TYPE.REFERENCES;
  payload: {
    references: ReferenceRef[];
  };
}

export interface OutputFileType {
  filename: string;
  s3_path: string;
  file_type: string;
}

export interface OutputFilesBlockType extends BlockBaseType {
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

export interface TaskBlockType extends BlockBaseType {
  type: BLOCK_TYPE.TASK;
  payload: {
    id: string;
    title: string;
    task_id: string;
    status?: TaskStatus;
    summary?: {
      live_summary?: string;
      status?: string;
      index?: number;
      updated_at?: string;
    };
  };
}

export interface AgentBlockType extends BlockBaseType {
  type: BLOCK_TYPE.AGENT;
  payload: {
    agent_id: string;
    name: string;
    description: string;
    colour: string;
    avatar?: string;
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
  TEXT: 'text',
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
  TEXT: 'text',
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

export interface InputsRespondedText {
  type: typeof HITL_RESPONSE_TYPE.TEXT;
  text: string;
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
  | InputsRespondedText
  | InputsRespondedFreeText;

export interface InputsRespondedItemPayload {
  response: InputsRespondedAnswer;
  entity_id: string;
  entity_type: string;
  sender_name?: string;
  input_required: InputRequiredPayload;
  file_references?: { name: string; path: string }[];
}

export interface InputsRespondedBlockType extends BlockBaseType {
  type: BLOCK_TYPE.INPUTS_RESPONDED;
  payload: {
    responses: InputsRespondedItemPayload[];
  };
  action?: null;
  interaction?: null;
  metadata?: null;
}

export const TEXT_TYPE = {
  PLAIN_TEXT: 'plain_text',
  MARKDOWN: 'markdown',
} as const;

export type TextType = (typeof TEXT_TYPE)[keyof typeof TEXT_TYPE];

export type Block =
  | PlainTextBlockType
  | MarkdownBlockType
  | SingleSelectBlockType
  | ButtonBlockType
  | QuestionGroupBlockType
  | QuestionBlockType
  | FileReferencesBlockType
  | ReferencesBlockType
  | OutputFilesBlockType
  | TaskBlockType
  | AgentBlockType
  | InputsRespondedBlockType
  | ThinkingContentBlock
  | TextContentBlock
  | ToolUseContentBlock
  | ToolResultContentBlock
  | TaskContentBlock
  | AgentContentBlock
  | TriggerContentBlock
  | InstructionsUpdatedContentBlock;
export interface BlockMessage {
  block: Block[];
}

export interface UploadedFileType {
  id?: string;
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

/** THINKING / TEXT have no backend id, so id is optional here unlike the static {@link BlockBaseType}. */
export interface StreamingContentBlockBase extends Omit<BlockBaseType, 'id'> {
  id?: string;
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

/** Parsed shape of {@link ToolUseDisplayContent.json_block}. */
export interface ToolUseDisplayContentParsed {
  tool_name?: string;
  icon?: string;
  display_title?: string;
  tool_input?: Record<string, unknown>;
}

/** Normalised display metadata extracted from a {@link ToolUseContentBlock}. */
export interface ToolCallInfo {
  id: string;
  name: string;
  displayName: string;
  icon?: string;
  isComplete: boolean;
  block: ToolUseContentBlock;
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
    display_title?: string;
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

export interface AgentContentBlock extends StreamingContentBlockBase {
  type: BLOCK_TYPE.AGENT;
  payload: {
    agent_id: string;
    name: string;
    description: string;
    colour: string;
    avatar?: string;
  };
}

export interface TriggerContentBlock extends StreamingContentBlockBase {
  type: BLOCK_TYPE.TRIGGER;
  payload: {
    trigger_id: string;
    title: string;
    status: string;
    agent_id: string;
  };
}

export interface InstructionsUpdatedContentBlock extends StreamingContentBlockBase {
  type: BLOCK_TYPE.INSTRUCTIONS_UPDATED;
  payload: {
    agent_id: string;
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
    display_title?: string;
    // Agent block fields
    agent_id?: string;
    description?: string;
    colour?: string;
    avatar?: string;
    // Task block fields
    title?: string;
    task_id?: string;
    status?: TaskStatus;
    // Trigger block fields
    trigger_id?: string;
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
  display_name?: string;
  display_title?: string;
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
