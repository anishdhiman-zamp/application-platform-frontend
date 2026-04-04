'use client';

import { Button } from '@zamp-platform/ui';
import { ChevronDown, ChevronUp, CircleHelp } from 'lucide-react';
import React from 'react';

export interface HITLQuestionsHeaderProps {
  questionCount: number;
  currentQuestionIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export const HITLQuestionsHeader: React.FC<HITLQuestionsHeaderProps> = ({
  questionCount,
  currentQuestionIndex,
  onPrev,
  onNext,
}) => {
  return (
    <div className='relative z-[2] w-full shrink-0'>
      <div className='flex w-full items-center justify-between px-2.5 py-2'>
        <div className='flex shrink-0 items-center gap-1.5'>
          <CircleHelp className='text-gray-900' size={14} strokeWidth={1.5} />
          <span className='text-xs font-[450] text-gray-900'>{questionCount === 1 ? 'Question' : 'Questions'}</span>
        </div>
        <div className='flex shrink-0 items-center gap-3'>
          <Button
            type='button'
            variant='ghost'
            size='xxsmall'
            className='shrink-0 disabled:opacity-50'
            disabled={currentQuestionIndex === 0}
            onClick={onPrev}
            aria-label='Previous question'
            testId='hitl-questions-header-prev'
          >
            <ChevronUp className='text-gray-900' size={14} strokeWidth={1.5} />
          </Button>
          <span className='text-xs font-[450] text-gray-900'>
            {currentQuestionIndex + 1} of {questionCount}
          </span>
          <Button
            type='button'
            variant='ghost'
            size='xxsmall'
            className='shrink-0 disabled:opacity-30'
            disabled={currentQuestionIndex === questionCount - 1}
            onClick={onNext}
            aria-label='Next question'
            testId='hitl-questions-header-next'
          >
            <ChevronDown className='text-gray-900' size={14} strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
};
