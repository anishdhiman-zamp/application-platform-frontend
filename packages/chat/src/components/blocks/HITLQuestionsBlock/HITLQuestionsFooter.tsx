'use client';

import { Button } from '@zamp-platform/ui';
import { useCallback } from 'react';

import { useHITLQuestionsContext } from './HITLQuestionsContext';
import { useHITLQuestions } from './useHITLQuestions';
import { isQuestionAnswerComplete } from './utils';

export const HITLQuestionsFooter = () => {
  const { state, questions } = useHITLQuestionsContext();
  const {
    allQuestionsAnswered,
    isSingleSelectOnly,
    isHitlRespondLoading,
    navigateToQuestion,
    handleSkipToCustomInput,
    handleSubmit,
  } = useHITLQuestions();

  const { currentQuestion, currentQuestionIndex, answers, questionFileRefs } = state;

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentQuestionAnswered =
    isQuestionAnswerComplete(currentQuestion, answers[currentQuestion.id]) ||
    (questionFileRefs[currentQuestion.id]?.length ?? 0) > 0;

  const handleSkipClick = useCallback(
    () => handleSkipToCustomInput(currentQuestion.id, currentQuestionIndex),
    [handleSkipToCustomInput, currentQuestion.id, currentQuestionIndex],
  );

  const handleNextOrSubmit = useCallback(
    () => (isLastQuestion ? void handleSubmit() : navigateToQuestion(currentQuestionIndex + 1, 'next')),
    [isLastQuestion, handleSubmit, navigateToQuestion, currentQuestionIndex],
  );

  return (
    <div className='bg-BG_WHITE shrink-0 shadow-[0px_-10px_6px_0px_var(--BG_WHITE)]'>
      <div className='flex w-full items-center justify-end py-1.5 pr-1.5 pl-3'>
        <div className='flex shrink-0 items-center gap-1.5'>
          <Button type='button' variant='outline' size='xsmall' onClick={handleSkipClick} testId='hitl-questions-skip'>
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
              disabled={isLastQuestion ? !allQuestionsAnswered : !currentQuestionAnswered}
              isLoading={isLastQuestion ? isHitlRespondLoading : false}
              onClick={handleNextOrSubmit}
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
