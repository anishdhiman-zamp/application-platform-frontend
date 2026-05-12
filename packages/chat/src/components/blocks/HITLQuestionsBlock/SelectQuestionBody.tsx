'use client';

import React, { useCallback } from 'react';

import { HITLQuestionsContextActions, useHITLQuestionsContext } from './HITLQuestionsContext';
import { OptionRow } from './OptionRow';
import { useHITLQuestions } from './useHITLQuestions';
import { getSingleSelectBadge, isMultipleChoiceQuestion } from './utils';

export const SelectQuestionBody = () => {
  const { state, dispatch, containerRef } = useHITLQuestionsContext();
  const { isSingleSelectOnly, selectAnswer } = useHITLQuestions();

  const { currentQuestion, currentQuestionIndex, focusedOptionIndex, answers, submittingOptionId, isHoverVisible } =
    state;

  const isMultiSelect = isMultipleChoiceQuestion(currentQuestion);
  const options = currentQuestion.options ?? [];
  const selectedOptionIds = answers[currentQuestion.id]?.optionIds ?? [];

  const handleOptionClick = useCallback(
    (optionId: string, optIndex: number) => {
      dispatch({ type: HITLQuestionsContextActions.SET_FOCUSED_OPTION_INDEX, payload: { index: optIndex } });
      selectAnswer(currentQuestion.id, currentQuestionIndex, optionId);
      containerRef.current?.focus();
    },
    [dispatch, selectAnswer, currentQuestion.id, currentQuestionIndex, containerRef],
  );

  const handleOptionMouseMove = useCallback(
    (optIndex: number) => {
      dispatch({ type: HITLQuestionsContextActions.SET_FOCUSED_OPTION_INDEX, payload: { index: optIndex } });
      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
        containerRef.current?.focus({ preventScroll: true });
      }
    },
    [dispatch, containerRef],
  );

  return (
    <div className='flex w-full flex-col items-start'>
      {options.map((option, optIndex) => {
        const isScrollTarget = focusedOptionIndex === optIndex;
        return (
          <OptionRow
            key={option.id}
            option={option}
            isHighlighted={isScrollTarget && isHoverVisible}
            isScrollTarget={isScrollTarget}
            isSelected={selectedOptionIds.includes(option.id)}
            isMultiSelect={isMultiSelect ?? false}
            isSubmitting={isSingleSelectOnly ? submittingOptionId === option.id : false}
            singleSelectBadge={isMultiSelect ? undefined : getSingleSelectBadge(optIndex)}
            onClick={() => handleOptionClick(option.id, optIndex)}
            onMouseMove={() => handleOptionMouseMove(optIndex)}
          />
        );
      })}
    </div>
  );
};
