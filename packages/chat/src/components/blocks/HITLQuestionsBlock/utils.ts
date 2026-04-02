import { HITL_INPUT_TYPE } from '../../../types/block.types';
import type { HITLQuestionWithEntity } from './types';

export function isApprovalQuestion(question: HITLQuestionWithEntity | undefined): boolean {
  return question?.input_type === HITL_INPUT_TYPE.APPROVAL;
}

export function optionCountForQuestion(question: HITLQuestionWithEntity): number {
  if (isApprovalQuestion(question)) return 2;
  const opts = question.options ?? [];
  const allowCustom = question.allow_custom_input ?? false;
  return opts.length + (allowCustom ? 1 : 0);
}

export function lastOptionFocusIndex(question: HITLQuestionWithEntity): number {
  return optionCountForQuestion(question) - 1;
}
