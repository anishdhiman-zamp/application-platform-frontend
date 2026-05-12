'use client';

import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { ArrowUpRight, X } from 'lucide-react';

import { TaskStatusIcon } from '../../../..';
import { TASK_STATUS } from '../../../types/block.types';
import { useHITLQuestionsContext } from './HITLQuestionsContext';
import { useHITLQuestions } from './useHITLQuestions';

export const HITLQuestionsHeader = () => {
  const { questions } = useHITLQuestionsContext();
  const { title, handleDismiss, handleTitleClick } = useHITLQuestions();

  const questionCount = questions.length;

  return (
    <div className='relative z-2 w-full shrink-0'>
      <div className='flex w-full items-center justify-between px-2.5 py-2'>
        <div className='flex min-w-0 items-center gap-1.5 overflow-hidden'>
          <TaskStatusIcon status={TASK_STATUS.NEEDS_INPUT} />
          {title ? (
            <button
              type='button'
              onClick={handleTitleClick}
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
          <TooltipProvider delayDuration={500}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='xxsmall'
                  className='shrink-0'
                  onClick={handleDismiss}
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
