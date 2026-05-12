'use client';

import { Button, TooltipV2 } from '@zamp-platform/ui';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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

  const questionCount = questions.length;
  const hasMultipleQuestions = questionCount > 1;
  const isLastQuestion = currentQuestionIndex === questionCount - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const currentQuestionAnswered =
    isQuestionAnswerComplete(currentQuestion, answers[currentQuestion.id]) ||
    (questionFileRefs[currentQuestion.id]?.length ?? 0) > 0;

  const handleSkipClick = useCallback(
    () => handleSkipToCustomInput(currentQuestion.id, currentQuestionIndex),
    [handleSkipToCustomInput, currentQuestion.id, currentQuestionIndex],
  );

  const handleNextOrSubmit = useCallback(
    () => (isLastQuestion ? void handleSubmit() : navigateToQuestion(currentQuestionIndex + 1)),
    [isLastQuestion, handleSubmit, navigateToQuestion, currentQuestionIndex],
  );

  const handlePrevQuestion = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.blur();
      navigateToQuestion(currentQuestionIndex - 1);
    },
    [navigateToQuestion, currentQuestionIndex],
  );

  const handleNextQuestion = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.blur();
      navigateToQuestion(currentQuestionIndex + 1);
    },
    [navigateToQuestion, currentQuestionIndex],
  );

  return (
    <div className='bg-BG_WHITE shrink-0 shadow-[0px_-10px_6px_0px_var(--BG_WHITE)]'>
      <div className='flex w-full items-center justify-between gap-2 px-4 pt-1.5 pb-4'>
        {hasMultipleQuestions ? (
          <div className='flex shrink-0 items-center gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='xxsmall'
              className='shrink-0 disabled:opacity-50'
              disabled={isFirstQuestion}
              onClick={handlePrevQuestion}
              aria-label='Previous question'
              testId='hitl-questions-footer-prev'
            >
              <ArrowLeft className='text-gray-1000' size={14} />
            </Button>
            <span className='f-12-450 text-gray-900'>
              {currentQuestionIndex + 1} of {questionCount}
            </span>
            <TooltipV2 tooltipBody='Next' asChildTrigger delayDuration={500}>
              <Button
                type='button'
                variant='ghost'
                size='xxsmall'
                className='shrink-0 disabled:opacity-30'
                disabled={isLastQuestion}
                onClick={handleNextQuestion}
                aria-label='Next question'
                testId='hitl-questions-footer-next'
              >
                <ArrowRight className='text-gray-1000' size={14} />
              </Button>
            </TooltipV2>
          </div>
        ) : (
          <div />
        )}
        <div className='flex shrink-0 items-center gap-2'>
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
