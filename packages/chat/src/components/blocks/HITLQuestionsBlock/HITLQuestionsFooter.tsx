'use client';

import { Button } from '@zamp-platform/ui';
import React from 'react';

export interface HITLQuestionsFooterProps {
  onSkip: () => void;
  onSubmit: () => void;
  submitDisabled: boolean;
  isSubmitting: boolean;
}

export const HITLQuestionsFooter = ({ onSkip, onSubmit, submitDisabled, isSubmitting }: HITLQuestionsFooterProps) => {
  return (
    <div className='bg-BG_WHITE absolute right-0 bottom-0 left-0 z-10 overflow-hidden shadow-[0px_-10px_6px_0px_var(--BG_WHITE)]'>
      <div className='flex w-full items-center justify-end py-1.5 pr-1.5 pl-3'>
        <div className='flex shrink-0 items-center gap-1.5'>
          <Button
            type='button'
            variant='ghost'
            size='xsmall'
            className='hidden h-auto px-2.5 py-1.5 hover:opacity-70'
            onClick={onSkip}
            testId='hitl-questions-skip'
          >
            <div className='flex items-center justify-center gap-1'>
              <kbd className='bg-BG_WHITE flex h-3.5 items-center justify-center rounded border border-gray-300 px-1 text-[10px] font-[450] text-gray-700'>
                Esc
              </kbd>
              <span className='text-[11px] font-[450] text-gray-700'>to</span>
              <span className='text-gray-1000 text-xs font-medium'>Skip</span>
            </div>
          </Button>
          <Button
            type='button'
            size='xsmall'
            variant='default'
            disabled={submitDisabled}
            isLoading={isSubmitting}
            onClick={onSubmit}
            testId='hitl-questions-submit'
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};
