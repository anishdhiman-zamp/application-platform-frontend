'use client';

import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import React from 'react';

import { CUSTOM_OPTION_ID } from './constants';
import { CustomInputRow } from './CustomInputRow';
import { OptionRow } from './OptionRow';
import type { HITLQuestionWithEntity } from './types';
import { type HITLAnswerValue, isApprovalQuestion, isMultipleChoiceQuestion, optionCountForQuestion } from './utils';

export type { HITLAnswerValue as AnswerState };

export interface HITLQuestionItemProps {
  question: HITLQuestionWithEntity;
  qIndex: number;
  questionsLength: number;
  currentQuestionIndex: number;
  focusedOptionIndex: number;
  answers: Record<string, HITLAnswerValue>;
  customInputs: Record<string, string>;
  customInputRef: React.RefObject<HTMLInputElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setQuestionEl: (el: HTMLDivElement | null) => void;
  setCurrentQuestionIndex: (i: number) => void;
  setFocusedOptionIndex: (i: number | ((p: number) => number)) => void;
  selectApprovalAnswer: (questionId: string, qIndex: number, approved: boolean) => void;
  selectAnswer: (questionId: string, qIndex: number, optionId: string, customText?: string) => void;
  onCustomInputChange: (value: string) => void;
}

const getSingleSelectOptionBadge = (index: number): string =>
  index < 26 ? String.fromCharCode(65 + index) : String(index + 1);

interface SelectOptionsProps {
  question: HITLQuestionWithEntity;
  qIndex: number;
  currentQuestionIndex: number;
  focusedOptionIndex: number;
  answers: Record<string, HITLAnswerValue>;
  customInputs: Record<string, string>;
  customInputRef: React.RefObject<HTMLInputElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setCurrentQuestionIndex: (i: number) => void;
  setFocusedOptionIndex: (i: number | ((p: number) => number)) => void;
  selectAnswer: (questionId: string, qIndex: number, optionId: string, customText?: string) => void;
  onCustomInputChange: (value: string) => void;
}

const SelectOptions = ({
  question,
  qIndex,
  currentQuestionIndex,
  focusedOptionIndex,
  answers,
  customInputs,
  customInputRef,
  containerRef,
  setCurrentQuestionIndex,
  setFocusedOptionIndex,
  selectAnswer,
  onCustomInputChange,
}: SelectOptionsProps) => {
  const isMultiSelect = isMultipleChoiceQuestion(question);
  const showCustomInput = question.allow_custom_input ?? true;
  const options = question.options ?? [];
  const optionCount = optionCountForQuestion(question);

  const handleOptionClick = (optionId: string) => {
    selectAnswer(question.id, qIndex, optionId);
    containerRef.current?.focus();
  };

  const handleCustomInputClick = () => {
    setCurrentQuestionIndex(qIndex);
    setFocusedOptionIndex(optionCount - 1);
    customInputRef.current?.focus();
  };

  return (
    <div className='flex w-full flex-col items-start'>
      {options.map((option, optIndex) => (
        <OptionRow
          key={option.id}
          option={option}
          isFocused={qIndex === currentQuestionIndex && focusedOptionIndex === optIndex}
          isSelected={answers[question.id]?.optionIds.includes(option.id) ?? false}
          isMultiSelect={isMultiSelect ?? false}
          singleSelectBadge={isMultiSelect ? undefined : getSingleSelectOptionBadge(optIndex)}
          onMouseEnter={() => {
            setCurrentQuestionIndex(qIndex);
            setFocusedOptionIndex(optIndex);
          }}
          onClick={() => handleOptionClick(option.id)}
        />
      ))}

      {showCustomInput && (
        <CustomInputRow
          isFocused={focusedOptionIndex === optionCount - 1 && qIndex === currentQuestionIndex}
          isSelected={answers[question.id]?.optionIds.includes(CUSTOM_OPTION_ID) ?? false}
          isMultiSelect={isMultiSelect ?? false}
          value={customInputs[question.id] || ''}
          inputRef={qIndex === currentQuestionIndex ? customInputRef : undefined}
          onMouseEnter={() => {
            if (qIndex === currentQuestionIndex) setFocusedOptionIndex(optionCount - 1);
          }}
          onClick={handleCustomInputClick}
          onChange={onCustomInputChange}
        />
      )}
    </div>
  );
};

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
}: HITLQuestionItemProps) => {
  const handleApprove = () => {
    selectApprovalAnswer(question.id, qIndex, true);
    containerRef.current?.focus();
  };

  const handleReject = () => {
    selectApprovalAnswer(question.id, qIndex, false);
    containerRef.current?.focus();
  };

  return (
    <div ref={setQuestionEl} className='relative w-full shrink-0'>
      <div className='flex w-full items-center justify-center'>
        <div className='flex w-full items-center justify-center px-4 pt-4.5 pb-2.5'>
          <div className='text-GRAY_1000 flex flex-1 gap-2 text-sm leading-normal font-[550]'>
            <span className='shrink-0'>{qIndex + 1}.</span>
            <span className='leading-normal whitespace-pre-wrap'>{question?.question ?? question?.text}</span>
          </div>
        </div>
      </div>

      <div className='w-full px-1'>
        {isApprovalQuestion(question) ? (
          <div className='flex w-full items-center gap-2 px-4 pb-6'>
            <Button
              type='button'
              variant='default'
              size='xsmall'
              debounceMs={0}
              className={cn(
                'shrink-0',
                qIndex === currentQuestionIndex && focusedOptionIndex === 0 && 'ring-GRAY_500 ring-2 ring-offset-2',
              )}
              onMouseEnter={() => {
                setCurrentQuestionIndex(qIndex);
                setFocusedOptionIndex(0);
              }}
              onClick={handleApprove}
              testId='hitl-approval-approve'
            >
              Approve
            </Button>
            <Button
              type='button'
              variant='secondary'
              size='xsmall'
              debounceMs={0}
              className={cn(
                'shrink-0',
                qIndex === currentQuestionIndex && focusedOptionIndex === 1 && 'ring-GRAY_500 ring-2 ring-offset-2',
              )}
              onMouseEnter={() => {
                setCurrentQuestionIndex(qIndex);
                setFocusedOptionIndex(1);
              }}
              onClick={handleReject}
              testId='hitl-approval-reject'
            >
              Reject
            </Button>
          </div>
        ) : (
          <SelectOptions
            question={question}
            qIndex={qIndex}
            currentQuestionIndex={currentQuestionIndex}
            focusedOptionIndex={focusedOptionIndex}
            answers={answers}
            customInputs={customInputs}
            customInputRef={customInputRef}
            containerRef={containerRef}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            setFocusedOptionIndex={setFocusedOptionIndex}
            selectAnswer={selectAnswer}
            onCustomInputChange={onCustomInputChange}
          />
        )}
      </div>

      {qIndex < questionsLength - 1 && (
        <div aria-hidden='true' className='border-GRAY_200 pointer-events-none absolute inset-0 border-b' />
      )}
    </div>
  );
};
