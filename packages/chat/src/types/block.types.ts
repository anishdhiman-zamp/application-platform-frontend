export const enum BlockType {
  PLAIN_TEXT = 'plain_text',
  MARKDOWN = 'markdown',
  SINGLE_SELECT = 'single_select',
  BUTTON = 'button',
  QUESTION_GROUP = 'question_group',
  QUESTION = 'question',
}

export const enum ActionType {
  STATE_UPDATE = 'state_update',
  INTERNAL_API = 'internal-api',
  REDIRECT = 'redirect',
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
}

export interface PlainTextBlockType {
  id: string;
  type: BlockType.PLAIN_TEXT;
  order: number;
  payload: {
    text: string;
  };
}

export interface MarkdownBlockType {
  id: string;
  type: BlockType.MARKDOWN;
  order: number;
  payload: {
    text: string;
  };
}

export interface SingleSelectBlockType {
  id: string;
  type: BlockType.SINGLE_SELECT;
  order: number;
  payload: {
    options: SingleSelectOption[];
    initial_value?: string;
    action: BlockAction;
  };
}

export interface ButtonBlockType {
  id: string;
  type: BlockType.BUTTON;
  order: number;
  payload: {
    is_disabled: boolean;
    label: string;
    value: string;
    action: BlockAction;
  };
}

export interface QuestionBlockType {
  id: string;
  type: BlockType.QUESTION;
  order: number;
  payload: {
    type: TEXT_TYPE;
    question: string;
  };
}

export interface QuestionGroupBlockType {
  id: string;
  type: BlockType.QUESTION_GROUP;
  order: number;
  payload: {
    questions: QuestionBlockType[];
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
  | QuestionBlockType;

export interface BlockMessage {
  block: Block[];
}
