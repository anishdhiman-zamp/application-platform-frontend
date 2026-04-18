'use client';

import React, { useCallback } from 'react';

import { MarkdownBlock } from '../../../..';
import type { ChatComposerFileRef } from './ChatComposerInput';
import { SelectQuestionBody } from './SelectQuestionBody';
import type { HITLQuestionWithEntity } from './types';
import { type HITLAnswerValue, optionCountForQuestion } from './utils';

export interface HITLQuestionItemProps {
  question: HITLQuestionWithEntity;
  qIndex: number;
  questionsLength: number;
  currentQuestionIndex: number;
  focusedOptionIndex: number;
  answers: Record<string, HITLAnswerValue>;
  customInputs: Record<string, string>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  submittingOptionId?: string | null;
  isSingleSelectOnly?: boolean;
  setCurrentQuestionIndex: (i: number) => void;
  setFocusedOptionIndex: (i: number | ((p: number) => number)) => void;
  selectAnswer: (questionId: string, qIndex: number, optionId: string, customText?: string) => void;
  onCustomInputChange: (value: string) => void;
  onFileReferencesChange?: (questionId: string, refs: ChatComposerFileRef[]) => void;
  username?: string;
}

export const HITLQuestionItem = ({
  question,
  qIndex,
  questionsLength,
  currentQuestionIndex,
  focusedOptionIndex,
  answers,
  customInputs,
  containerRef,
  submittingOptionId,
  isSingleSelectOnly,
  setCurrentQuestionIndex,
  setFocusedOptionIndex,
  selectAnswer,
  onCustomInputChange,
  onFileReferencesChange,
  username,
}: HITLQuestionItemProps) => {
  const isFocused = qIndex === currentQuestionIndex;
  const selectedOptionIds = answers[question.id]?.optionIds ?? [];

  const handleOptionClick = useCallback(
    (optionId: string, optIndex: number) => {
      setFocusedOptionIndex(optIndex);
      selectAnswer(question.id, qIndex, optionId);
      containerRef.current?.focus();
    },
    [question.id, qIndex, selectAnswer, setFocusedOptionIndex, containerRef],
  );

  const handleCustomInputClick = useCallback(() => {
    setCurrentQuestionIndex(qIndex);
    setFocusedOptionIndex(optionCountForQuestion(question) - 1);
  }, [qIndex, question, setCurrentQuestionIndex, setFocusedOptionIndex]);

  const handleFileReferencesChange = useCallback(
    (refs: ChatComposerFileRef[]) => {
      onFileReferencesChange?.(question.id, refs);
    },
    [onFileReferencesChange, question.id],
  );

  return (
    <div className='relative w-full shrink-0'>
      <div className='flex w-full items-center justify-center px-4 pt-4.5 pb-2.5'>
        <div className='text-GRAY_1000 flex flex-1 gap-2 text-sm leading-normal font-[450]'>
          {questionsLength > 1 && <span className='shrink-0'>{qIndex + 1}.</span>}
          <MarkdownBlock
            fontClassName='text-GRAY_1000 font-[450]'
            payload={{ text: question?.question || question?.text || '' }}
          />
        </div>
      </div>

      <div className='w-full px-1'>
        <SelectQuestionBody
          question={question}
          isFocused={isFocused}
          focusedOptionIndex={focusedOptionIndex}
          selectedOptionIds={selectedOptionIds}
          customInputValue={customInputs[question.id] || ''}
          submittingOptionId={submittingOptionId}
          isSingleSelectOnly={isSingleSelectOnly}
          onOptionClick={handleOptionClick}
          onCustomInputClick={handleCustomInputClick}
          onCustomInputChange={onCustomInputChange}
          onFileReferencesChange={onFileReferencesChange ? handleFileReferencesChange : undefined}
          username={username}
        />
      </div>
    </div>
  );
};
