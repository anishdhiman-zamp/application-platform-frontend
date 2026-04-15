import type { Dispatch, SetStateAction } from 'react';

import { HITL_INPUT_TYPE, HITL_INPUT_TYPE_LEGACY } from '../../../types/block.types';
import { CUSTOM_OPTION_ID, HITL_APPROVAL_NO, HITL_APPROVAL_YES } from './constants';
import type { HITLQuestionWithEntity } from './types';

export type HITLAnswerValue = {
  optionIds: string[];
  customText?: string;
  isSkipped?: boolean;
};

export type HITLAnswersState = Record<string, HITLAnswerValue>;

export const appendPrintableToCustomInput = (
  question: HITLQuestionWithEntity,
  char: string,
  setCustomInputs: Dispatch<SetStateAction<Record<string, string>>>,
  setAnswers: Dispatch<SetStateAction<HITLAnswersState>>,
): void => {
  const questionId = question.id;
  const isMulti = isMultipleChoiceQuestion(question);
  setCustomInputs((prev) => {
    const newText = (prev[questionId] || '') + char;
    setAnswers((answersPrev) => {
      const currentAns = answersPrev[questionId] || { optionIds: [], customText: '' };
      const baseOptionIds = isMulti ? currentAns.optionIds : [];
      const optionIds = baseOptionIds.includes(CUSTOM_OPTION_ID) ? baseOptionIds : [...baseOptionIds, CUSTOM_OPTION_ID];
      return { ...answersPrev, [questionId]: { optionIds, customText: newText, isSkipped: false } };
    });
    return { ...prev, [questionId]: newText };
  });
};

export const isApprovalQuestion = (question: HITLQuestionWithEntity | undefined): boolean => {
  return question?.input_type === HITL_INPUT_TYPE.APPROVAL;
};

export const isMultipleChoiceQuestion = (question: HITLQuestionWithEntity | undefined): boolean => {
  if (!question) return false;
  return (
    Boolean(question.is_multi_select) ||
    question.input_type === HITL_INPUT_TYPE.MULTIPLE_CHOICE ||
    question.input_type === HITL_INPUT_TYPE_LEGACY.MULTI_SELECT
  );
};

export const isTextQuestion = (question: HITLQuestionWithEntity | undefined): boolean => {
  return question?.input_type === HITL_INPUT_TYPE.TEXT;
};

export const isQuestionAnswerComplete = (
  question: HITLQuestionWithEntity,
  answer: HITLAnswerValue | undefined,
): boolean => {
  if (answer?.isSkipped) return true;

  if (isTextQuestion(question)) {
    return (answer?.customText ?? '').trim().length > 0;
  }

  if (isApprovalQuestion(question)) {
    const ids = answer?.optionIds ?? [];
    return ids.includes(HITL_APPROVAL_YES) || ids.includes(HITL_APPROVAL_NO);
  }

  if (isMultipleChoiceQuestion(question)) {
    const realIds = (answer?.optionIds ?? []).filter((id) => id !== CUSTOM_OPTION_ID);
    const customText = (answer?.customText ?? '').trim();
    return realIds.length > 0 || customText.length > 0;
  }

  const ids = answer?.optionIds ?? [];
  const hasCustom = ids.includes(CUSTOM_OPTION_ID);
  const customText = (answer?.customText ?? '').trim();
  const realIds = ids.filter((id) => id !== CUSTOM_OPTION_ID);

  if (hasCustom && customText.length > 0) return true;
  if (!hasCustom && realIds.length === 1) return true;
  return false;
};

export const optionCountForQuestion = (question: HITLQuestionWithEntity): number => {
  if (isTextQuestion(question)) return 1;
  if (isApprovalQuestion(question)) return 2;
  const opts = question.options ?? [];
  return opts.length + 1;
};

export const lastOptionFocusIndex = (question: HITLQuestionWithEntity): number => {
  return optionCountForQuestion(question) - 1;
};
