import { MessageAttachmentType } from '../..';

export const enum BLOCK_TYPE {
  PLAIN_TEXT = 'plain_text',
  MARKDOWN = 'markdown',
  SINGLE_SELECT = 'single_select',
  BUTTON = 'button',
  QUESTION_GROUP = 'question_group',
  QUESTION = 'question',
  ATTACHMENTS = 'attachments',
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

export interface AttachmentsBlockType {
  id: string;
  order: number;
  type: BLOCK_TYPE.ATTACHMENTS;
  payload: {
    attachments: MessageAttachmentType[];
  };
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
  | AttachmentsBlockType;

export interface BlockMessage {
  block: Block[];
}

export interface UploadedFileType {
  file_id: string;
  file_name: string;
  file_type?: string;
  file?: File;
}
