'use client';

import { Button } from '@zamp-platform/ui';

export interface HITLQuestionsFooterProps {
  onSkip: () => void;
  onSubmit: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
  currentQuestionAnswered: boolean;
  submitDisabled: boolean;
  isSubmitting: boolean;
  isSingleSelectOnly: boolean;
}

export const HITLQuestionsFooter = ({
  onSkip,
  onSubmit,
  onNext,
  isLastQuestion,
  currentQuestionAnswered,
  submitDisabled,
  isSubmitting,
  isSingleSelectOnly,
}: HITLQuestionsFooterProps) => {
  return (
    <div className='bg-BG_WHITE shrink-0 shadow-[0px_-10px_6px_0px_var(--BG_WHITE)]'>
      <div className='flex w-full items-center justify-end py-1.5 pr-1.5 pl-3'>
        <div className='flex shrink-0 items-center gap-1.5'>
          <Button type='button' variant='outline' size='xsmall' onClick={onSkip} testId='hitl-questions-skip'>
            <div className='flex items-center justify-center gap-1'>
              <kbd className='bg-BG_WHITE flex h-3.5 items-center justify-center rounded border border-gray-300 px-1 text-[10px] font-[450] text-gray-700'>
                Esc
              </kbd>
              <span className='text-[11px] font-[450] text-gray-700'>to</span>
              <span className='text-gray-1000 text-xs font-medium'>Skip</span>
            </div>
          </Button>
          {!isSingleSelectOnly && (
            <Button
              type='button'
              size='xsmall'
              variant='default'
              disabled={isLastQuestion ? submitDisabled : !currentQuestionAnswered}
              isLoading={isLastQuestion ? isSubmitting : false}
              onClick={isLastQuestion ? onSubmit : onNext}
              className='gap-1'
              testId={isLastQuestion ? 'hitl-questions-submit' : 'hitl-questions-next'}
            >
              {isLastQuestion ? 'Submit' : 'Next'}
              <span className='text-[11px] font-medium opacity-70'>⌘↵</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
