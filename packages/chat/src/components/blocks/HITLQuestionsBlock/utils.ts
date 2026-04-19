import type { Dispatch, SetStateAction } from 'react';

import { HITL_INPUT_TYPE, HITL_INPUT_TYPE_LEGACY, HITL_RESPONSE_TYPE } from '../../../types/block.types';
import type { HITLResponse, HITLResponseItem } from '../../../types/chat.types';
import type { ChatComposerFileRef } from './ChatComposerInput';
import { CUSTOM_OPTION_ID } from './constants';
import type { HITLQuestionWithEntity } from './types';

export type HITLAnswerValue = {
  optionIds: string[];
  customText?: string;
  isSkipped?: boolean;
};

export type HITLAnswersState = Record<string, HITLAnswerValue>;

interface HITLDraft {
  answers: HITLAnswersState;
  customInputs: Record<string, string>;
}

const HITL_DRAFT_KEY_PREFIX = 'hitl_draft_';

export const readHITLDraft = (sourceEntityId: string): HITLDraft | null => {
  try {
    const raw = sessionStorage.getItem(`${HITL_DRAFT_KEY_PREFIX}${sourceEntityId}`);
    return raw ? (JSON.parse(raw) as HITLDraft) : null;
  } catch {
    return null;
  }
};

export const writeHITLDraft = (sourceEntityId: string, draft: HITLDraft): void => {
  try {
    sessionStorage.setItem(`${HITL_DRAFT_KEY_PREFIX}${sourceEntityId}`, JSON.stringify(draft));
  } catch {
    // sessionStorage unavailable — silently ignore
  }
};

export const clearHITLDraft = (sourceEntityId: string): void => {
  try {
    sessionStorage.removeItem(`${HITL_DRAFT_KEY_PREFIX}${sourceEntityId}`);
  } catch {
    // ignore
  }
};

/**
 * @param question - The HITL question to check.
 * @returns `true` if the question allows selecting multiple options.
 */
export const isMultipleChoiceQuestion = (question: HITLQuestionWithEntity | undefined): boolean => {
  if (!question) return false;
  return (
    Boolean(question.is_multi_select) ||
    question.input_type === HITL_INPUT_TYPE.MULTIPLE_CHOICE ||
    question.input_type === HITL_INPUT_TYPE_LEGACY.MULTI_SELECT
  );
};

/**
 * @param question - The HITL question to check.
 * @returns `true` if the question expects a free-text answer.
 */
export const isTextQuestion = (question: HITLQuestionWithEntity | undefined): boolean => {
  return question?.input_type === HITL_INPUT_TYPE.TEXT;
};

/**
 * @param question - The HITL question to evaluate.
 * @returns Total number of focusable options, including the custom input slot.
 */
export const optionCountForQuestion = (question: HITLQuestionWithEntity): number => {
  if (isTextQuestion(question)) return 1;
  return (question.options ?? []).length + 1;
};

/**
 * @param question - The HITL question to evaluate.
 * @param answer - The current answer state for the question.
 * @returns `true` if the answer satisfies the completion criteria for the question.
 */
export const isQuestionAnswerComplete = (
  question: HITLQuestionWithEntity,
  answer: HITLAnswerValue | undefined,
): boolean => {
  if (answer?.isSkipped) return true;

  if (isTextQuestion(question)) {
    return (answer?.customText ?? '').trim().length > 0;
  }

  if (isMultipleChoiceQuestion(question)) {
    const realIds = (answer?.optionIds ?? []).filter((id) => id !== CUSTOM_OPTION_ID);
    return realIds.length > 0 || (answer?.customText ?? '').trim().length > 0;
  }

  const ids = answer?.optionIds ?? [];
  const hasCustom = ids.includes(CUSTOM_OPTION_ID);
  const customText = (answer?.customText ?? '').trim();
  const realIds = ids.filter((id) => id !== CUSTOM_OPTION_ID);

  if (hasCustom && customText.length > 0) return true;
  if (!hasCustom && realIds.length === 1) return true;
  return false;
};

/**
 * Appends a printable character to the custom text input for a question and
 * ensures the CUSTOM_OPTION_ID is selected in the answer state.
 *
 * @param question - The HITL question whose custom input is being updated.
 * @param char - The printable character to append.
 * @param setCustomInputs - State setter for the raw custom input strings map.
 * @param setAnswers - State setter for the full answers state map.
 */
export const appendPrintableToCustomInput = (
  question: HITLQuestionWithEntity,
  char: string,
  setCustomInputs: Dispatch<SetStateAction<Record<string, string>>>,
  setAnswers: Dispatch<SetStateAction<HITLAnswersState>>,
): void => {
  const questionId = question.id;
  const isMulti = isMultipleChoiceQuestion(question);

  setAnswers((prev) => {
    const current = prev[questionId] ?? { optionIds: [], customText: '' };
    const newText = (current.customText ?? '') + char;
    const baseOptionIds = isMulti ? current.optionIds : [];
    const optionIds = baseOptionIds.includes(CUSTOM_OPTION_ID) ? baseOptionIds : [...baseOptionIds, CUSTOM_OPTION_ID];
    return { ...prev, [questionId]: { optionIds, customText: newText, isSkipped: false } };
  });

  setCustomInputs((prev) => ({ ...prev, [questionId]: (prev[questionId] ?? '') + char }));
};

/**
 * @param questions - List of HITL questions to mark as skipped.
 * @param prev - The existing answers state to merge into.
 * @returns A new answers state with all questions marked as skipped.
 */
export const buildSkippedAnswers = (questions: HITLQuestionWithEntity[], prev: HITLAnswersState): HITLAnswersState => {
  const skipped: HITLAnswersState = { ...prev };
  for (const q of questions) {
    skipped[q.id] = { optionIds: [], customText: '', isSkipped: true };
  }
  return skipped;
};

const buildSkippedResponse = (question: HITLQuestionWithEntity): HITLResponse => {
  if (isTextQuestion(question)) {
    return { type: HITL_RESPONSE_TYPE.TEXT, text: '', is_skipped: true };
  }
  if (isMultipleChoiceQuestion(question)) {
    return { type: HITL_RESPONSE_TYPE.MULTIPLE_CHOICE, selected_options: [], is_skipped: true };
  }
  return { type: HITL_RESPONSE_TYPE.SELECT_ONE, selected_option: null, custom_input: null, is_skipped: true };
};

/**
 * @param question - The HITL question to build a response for.
 * @param answer - The current answer state for the question.
 * @param sourceEntityType - Fallback entity type when the question has none.
 * @param fileRefs - Optional file attachments to include in the response.
 * @returns The API response payload for the question.
 */
export const buildResponseForQuestion = (
  question: HITLQuestionWithEntity,
  answer: HITLAnswerValue | undefined,
  sourceEntityType: string,
  fileRefs: ChatComposerFileRef[] | undefined,
): HITLResponseItem => {
  const entity_type = question.entity_type ?? sourceEntityType;
  const entity_id = question.entity_id ?? question.id;
  const input_id = question.input_id;
  const file_references = fileRefs?.length ? fileRefs : undefined;

  if (answer?.isSkipped) {
    return { entity_type, entity_id, input_id, response: buildSkippedResponse(question), file_references };
  }

  if (isTextQuestion(question)) {
    return {
      entity_type,
      entity_id,
      input_id,
      response: { type: HITL_RESPONSE_TYPE.TEXT, text: answer?.customText?.trim() ?? '', is_skipped: false },
      file_references,
    };
  }

  if (isMultipleChoiceQuestion(question)) {
    const selected_options = (answer?.optionIds ?? []).filter((id) => id !== CUSTOM_OPTION_ID);
    const customTrimmed = (answer?.customText ?? '').trim();
    const response: HITLResponse = { type: HITL_RESPONSE_TYPE.MULTIPLE_CHOICE, selected_options };
    if (customTrimmed) response.custom_input = customTrimmed;
    return { entity_type, entity_id, input_id, response, file_references };
  }

  const isCustom = answer?.optionIds.includes(CUSTOM_OPTION_ID);
  if (isCustom) {
    return {
      entity_type,
      entity_id,
      input_id,
      response: {
        type: HITL_RESPONSE_TYPE.SELECT_ONE,
        selected_option: null,
        custom_input: answer?.customText?.trim() ?? '',
      },
      file_references,
    };
  }

  return {
    entity_type,
    entity_id,
    input_id,
    response: {
      type: HITL_RESPONSE_TYPE.SELECT_ONE,
      selected_option: answer?.optionIds[0] ?? null,
      custom_input: null,
    },
    file_references,
  };
};
