import type { Dispatch, SetStateAction } from 'react';

import { HITL_INPUT_TYPE } from '../../../types/block.types';
import { CUSTOM_OPTION_ID } from './constants';
import type { HITLQuestionWithEntity } from './types';

export type HITLAnswersState = Record<string, { optionIds: string[]; customText?: string }>;

export const appendPrintableToCustomInput = (
  questionId: string,
  char: string,
  setCustomInputs: Dispatch<SetStateAction<Record<string, string>>>,
  setAnswers: Dispatch<SetStateAction<HITLAnswersState>>,
): void => {
  setCustomInputs((prev) => {
    const newText = (prev[questionId] || '') + char;
    setAnswers((answersPrev) => {
      const currentAns = answersPrev[questionId] || { optionIds: [], customText: '' };
      const optionIds = currentAns.optionIds.includes(CUSTOM_OPTION_ID)
        ? currentAns.optionIds
        : [...currentAns.optionIds, CUSTOM_OPTION_ID];
      return { ...answersPrev, [questionId]: { optionIds, customText: newText } };
    });
    return { ...prev, [questionId]: newText };
  });
};

export const isApprovalQuestion = (question: HITLQuestionWithEntity | undefined): boolean => {
  return question?.input_type === HITL_INPUT_TYPE.APPROVAL;
};

export const optionCountForQuestion = (question: HITLQuestionWithEntity): number => {
  if (isApprovalQuestion(question)) return 2;
  const opts = question.options ?? [];
  const allowCustom = question.allow_custom_input ?? false;
  return opts.length + (allowCustom ? 1 : 0);
};

export const lastOptionFocusIndex = (question: HITLQuestionWithEntity): number => {
  return optionCountForQuestion(question) - 1;
};
