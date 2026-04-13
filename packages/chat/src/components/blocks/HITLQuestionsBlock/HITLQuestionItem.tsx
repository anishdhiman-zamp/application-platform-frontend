'use client';

import React from 'react';

import { MarkdownBlock } from '../../../..';
import { HITL_INPUT_TYPE } from '../../../types/block.types';
import { APPROVAL_ACTION, ApprovalQuestionBody } from './ApprovalQuestionBody';
import { SelectQuestionBody } from './SelectQuestionBody';
import type { HITLQuestionWithEntity } from './types';
import { type HITLAnswerValue, optionCountForQuestion } from './utils';

export type { HITLAnswerValue as AnswerState };

export interface HITLQuestionItemProps {
  question: HITLQuestionWithEntity;
  qIndex: number;
  questionsLength: number;
  currentQuestionIndex: number;
  focusedOptionIndex: number;
  answers: Record<string, HITLAnswerValue>;
  customInputs: Record<string, string>;
  customInputRef: React.RefObject<HTMLTextAreaElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setQuestionEl: (el: HTMLDivElement | null) => void;
  setCurrentQuestionIndex: (i: number) => void;
  setFocusedOptionIndex: (i: number | ((p: number) => number)) => void;
  selectApprovalAnswer: (questionId: string, qIndex: number, approved: boolean) => void;
  selectAnswer: (questionId: string, qIndex: number, optionId: string, customText?: string) => void;
  onCustomInputChange: (value: string) => void;
  approvalAction?: APPROVAL_ACTION | null;
}

export const HITLQuestionItem = ({
  question,
  qIndex,
  questionsLength,
  currentQuestionIndex,
  focusedOptionIndex,
  answers,
  customInputs,
  customInputRef,
  containerRef,
  setQuestionEl,
  setCurrentQuestionIndex,
  setFocusedOptionIndex,
  selectApprovalAnswer,
  selectAnswer,
  onCustomInputChange,
  approvalAction,
}: HITLQuestionItemProps) => {
  const isFocused = qIndex === currentQuestionIndex;
  const selectedOptionIds = answers[question.id]?.optionIds ?? [];

  const focusContainer = () => containerRef.current?.focus();

  const renderQuestionBody = () => {
    switch (question.input_type) {
      case HITL_INPUT_TYPE.APPROVAL:
        return (
          <ApprovalQuestionBody
            isFocused={isFocused}
            focusedOptionIndex={focusedOptionIndex}
            approvalAction={approvalAction}
            onApprove={() => {
              selectApprovalAnswer(question.id, qIndex, true);
              focusContainer();
            }}
            onReject={() => {
              selectApprovalAnswer(question.id, qIndex, false);
              focusContainer();
            }}
          />
        );

      case HITL_INPUT_TYPE.SELECT_ONE:
      case HITL_INPUT_TYPE.MULTIPLE_CHOICE:
      default:
        return (
          <SelectQuestionBody
            question={question}
            isFocused={isFocused}
            focusedOptionIndex={focusedOptionIndex}
            selectedOptionIds={selectedOptionIds}
            customInputValue={customInputs[question.id] || ''}
            customInputRef={customInputRef}
            onOptionClick={(optionId, optIndex) => {
              setFocusedOptionIndex(optIndex);
              selectAnswer(question.id, qIndex, optionId);
              focusContainer();
            }}
            onCustomInputClick={() => {
              setCurrentQuestionIndex(qIndex);
              setFocusedOptionIndex(optionCountForQuestion(question) - 1);
              customInputRef.current?.focus({ preventScroll: true });
            }}
            onCustomInputChange={onCustomInputChange}
          />
        );
    }
  };

  return (
    <div ref={setQuestionEl} className='relative w-full shrink-0'>
      <div className='flex w-full items-center justify-center'>
        <div className='flex w-full items-center justify-center px-4 pt-4.5 pb-2.5'>
          <div className='text-GRAY_1000 flex flex-1 gap-2 text-sm leading-normal font-[450]'>
            {questionsLength > 1 && <span className='shrink-0'>{qIndex + 1}.</span>}
            <MarkdownBlock
              fontClassName='text-GRAY_1000 font-[450]'
              payload={{ text: question?.question || question?.text || '' }}
            />
          </div>
        </div>
      </div>

      <div className='w-full px-1'>{renderQuestionBody()}</div>
      {qIndex < questionsLength - 1 && (
        <div aria-hidden='true' className='border-GRAY_200 pointer-events-none absolute inset-0 border-b' />
      )}
    </div>
  );
};
