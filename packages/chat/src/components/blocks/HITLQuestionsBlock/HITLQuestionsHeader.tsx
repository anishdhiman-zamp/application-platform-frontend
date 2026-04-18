'use client';

import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';

import { TaskStatusIcon } from '../../../..';
import { TASK_STATUS } from '../../../types/block.types';

export interface HITLQuestionsHeaderProps {
  questionCount: number;
  currentQuestionIndex: number;
  title?: string;
  onTitleClick?: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDismiss: () => void;
}

export const HITLQuestionsHeader = ({
  questionCount,
  currentQuestionIndex,
  title,
  onTitleClick,
  onPrev,
  onNext,
  onDismiss,
}: HITLQuestionsHeaderProps) => {
  return (
    <div className='relative z-[2] w-full shrink-0'>
      <div className='flex w-full items-center justify-between px-2.5 py-2'>
        <div className='flex min-w-0 items-center gap-1.5 overflow-hidden'>
          <TaskStatusIcon status={TASK_STATUS.NEEDS_INPUT} />
          {title ? (
            <button
              type='button'
              onClick={onTitleClick}
              className='group flex min-w-0 cursor-pointer items-center gap-1 text-left'
            >
              <span className='f-12-450 text-GRAY_900 group-hover:text-GRAY_1000 truncate transition-colors'>
                {title}
              </span>
              <ArrowUpRight
                className='text-GRAY_900 group-hover:text-GRAY_1000 invisible shrink-0 transition-colors group-hover:visible'
                size={12}
              />
            </button>
          ) : (
            <span className='f-12-450 text-GRAY_900 truncate'>Needs input</span>
          )}
        </div>
        <div className='flex shrink-0 items-center gap-3'>
          {questionCount > 1 && (
            <div className='flex shrink-0 items-center gap-1'>
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
                <ArrowLeft className='text-gray-1000' size={14} />
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
                <ArrowRight className='text-gray-1000' size={14} />
              </Button>
            </div>
          )}
          <TooltipProvider delayDuration={500}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='xxsmall'
                  className='shrink-0'
                  onClick={onDismiss}
                  aria-label='Dismiss'
                  testId='hitl-questions-header-dismiss'
                >
                  <X className='text-gray-700' size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{questionCount > 1 ? 'Skip all' : 'Skip'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
