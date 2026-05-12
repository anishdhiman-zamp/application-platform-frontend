'use client';

import { cn } from '@zamp-platform/ui/utils';
import { useCallback, useEffect, useRef } from 'react';

import { type ChatComposerFileRef, ChatComposerInput, type ChatComposerInputHandle } from './ChatComposerInput';
import { CUSTOM_OPTION_ID } from './constants';
import { CustomInputIcon } from './CustomInputIcon';
import { HITLQuestionsContextActions, useHITLQuestionsContext } from './HITLQuestionsContext';
import { useHITLQuestions } from './useHITLQuestions';
import { isMultipleChoiceQuestion, optionCountForQuestion } from './utils';

export const CustomInputRow = () => {
  const { state, username, dispatch } = useHITLQuestionsContext();
  const { isSingleSelectOnly, handleCustomInputChange, handleFileReferencesChange } = useHITLQuestions();
  const { currentQuestion, focusedOptionIndex, answers, customInputs, submittingOptionId } = state;

  const optionCount = optionCountForQuestion(currentQuestion);
  const isMultiSelect = isMultipleChoiceQuestion(currentQuestion);
  const selectedOptionIds = answers[currentQuestion.id]?.optionIds ?? [];
  const isFocused = focusedOptionIndex === optionCount - 1;
  const isSelected = selectedOptionIds.includes(CUSTOM_OPTION_ID);
  const isSubmitting = isSingleSelectOnly ? submittingOptionId === CUSTOM_OPTION_ID : false;
  const value = customInputs[currentQuestion.id] || '';

  const composerRef = useRef<ChatComposerInputHandle>(null);

  const scheduleFocus = useCallback(() => {
    const rafId = requestAnimationFrame(() => {
      composerRef.current?.focus();
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleFileRefs = useCallback(
    (refs: ChatComposerFileRef[]) => {
      handleFileReferencesChange(currentQuestion.id, refs);
    },
    [handleFileReferencesChange, currentQuestion.id],
  );

  useEffect(() => {
    if (!isFocused) return;
    return scheduleFocus();
  }, [isFocused, scheduleFocus]);

  const handleFocusLastOption = useCallback(() => {
    dispatch({ type: HITLQuestionsContextActions.SET_FOCUSED_OPTION_INDEX, payload: { index: optionCount - 1 } });
  }, [dispatch, optionCount]);

  return (
    <div
      data-hitl-focused={isFocused || undefined}
      className='w-full shrink-0 cursor-pointer rounded-[10px] transition-colors duration-200'
      onClick={handleFocusLastOption}
      onMouseMove={handleFocusLastOption}
    >
      <div className='flex w-full items-start px-3 py-2.5'>
        <div className='flex min-w-px flex-1 items-start gap-2.5'>
          <div
            className={cn(
              'mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center overflow-clip rounded-md transition-colors',
              isSelected ? 'bg-GRAY_1000' : 'bg-GRAY_50',
            )}
          >
            <CustomInputIcon
              isSelected={isSelected}
              isMultiSelect={isMultiSelect ?? false}
              isSubmitting={isSubmitting}
            />
          </div>

          <div className='flex-1 cursor-text' onClick={(e) => e.stopPropagation()}>
            <ChatComposerInput
              ref={composerRef}
              value={value}
              onChange={(text) => handleCustomInputChange(currentQuestion.id, text)}
              onFileReferencesChange={handleFileRefs}
              placeholder='Type something else...'
              className='bg-BG_WHITE rounded-2xl'
              username={username}
              showFilePreview={false}
              disableNewlineOnEnter={!isMultiSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
