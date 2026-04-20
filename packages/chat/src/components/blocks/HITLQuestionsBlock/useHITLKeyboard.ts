'use client';

import { KEYBOARD_KEYS } from '@zamp-platform/utils';
import { useCallback, useEffect, useRef } from 'react';

import { CUSTOM_OPTION_ID } from './constants';
import { HITLQuestionsContextActions, useHITLQuestionsContext } from './HITLQuestionsContext';
import { useHITLQuestions } from './useHITLQuestions';
import { isTextQuestion, optionCountForQuestion } from './utils';

export const useHITLKeyboard = () => {
  const {
    state,
    dispatch,
    questions,
    containerRef,
    questionScrollRef,
    scrollDirectionRef,
    shouldScrollRef,
    submitRef,
    submitSingleSelectRef,
  } = useHITLQuestionsContext();

  const { navigateToQuestion, selectAnswer, handleSkipToCustomInput } = useHITLQuestions();

  const { currentQuestion, focusedOptionIndex } = state;

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const isSingleSelectOnly =
    questions.length === 1 && currentQuestion && !isTextQuestion(currentQuestion) && !currentQuestion.is_multi_select;
  const totalOptions = currentQuestion ? optionCountForQuestion(currentQuestion) : 1;

  const handleFocusAndScroll = useCallback(() => {
    if (focusedOptionIndex < totalOptions - 1) {
      containerRef.current?.focus({ preventScroll: true });
    }

    if (!shouldScrollRef.current) return;
    shouldScrollRef.current = false;

    const rafId = requestAnimationFrame(() => {
      const scrollEl = questionScrollRef.current;
      if (!scrollEl) return;

      const focusedEl = scrollEl.querySelector<HTMLElement>('[data-hitl-focused]');
      if (!focusedEl) return;

      const scrollRect = scrollEl.getBoundingClientRect();
      const elRect = focusedEl.getBoundingClientRect();
      const isFullyVisible = elRect.top >= scrollRect.top && elRect.bottom <= scrollRect.bottom;

      if (!isFullyVisible) {
        focusedEl.scrollIntoView({
          block: scrollDirectionRef.current === 'down' ? 'start' : 'end',
          behavior: 'smooth',
        });
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [focusedOptionIndex, totalOptions, containerRef, questionScrollRef, shouldScrollRef, scrollDirectionRef]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && active !== document.body && !containerRef.current?.contains(active)) return;

      const {
        currentQuestionIndex: qIdx,
        focusedOptionIndex: optIdx,
        customInputs: inputs,
        questionFileRefs: fileRefs,
        currentQuestion: q,
      } = stateRef.current;
      if (!q) return;

      shouldScrollRef.current = true;

      const targetIsTextField =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);

      const preventUnlessTextField = () => {
        if (!targetIsTextField) e.preventDefault();
      };

      const lastOptionIdx = totalOptions - 1;
      const lastQuestionIdx = questions.length - 1;

      switch (e.key) {
        case KEYBOARD_KEYS.ARROW_DOWN:
          preventUnlessTextField();
          scrollDirectionRef.current = 'down';
          dispatch({ type: HITLQuestionsContextActions.FOCUS_NEXT_OPTION, payload: { lastOptionIdx } });
          break;

        case KEYBOARD_KEYS.ARROW_UP:
          preventUnlessTextField();
          scrollDirectionRef.current = 'up';
          dispatch({ type: HITLQuestionsContextActions.FOCUS_PREV_OPTION, payload: { lastOptionIdx } });
          break;

        case KEYBOARD_KEYS.ENTER: {
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (qIdx < lastQuestionIdx) navigateToQuestion(qIdx + 1, 'next');
            else submitRef.current?.();
            return;
          }
          preventUnlessTextField();
          if (isTextQuestion(q)) {
            e.preventDefault();
            const text = (inputs[q.id] || '').trim();
            const hasAttachments = (fileRefs[q.id]?.length ?? 0) > 0;
            if ((text || hasAttachments) && qIdx < lastQuestionIdx) navigateToQuestion(qIdx + 1, 'next');
          } else if (optIdx === lastOptionIdx) {
            const customText = inputs[q.id] || '';
            selectAnswer(q.id, qIdx, CUSTOM_OPTION_ID, customText);
            if (isSingleSelectOnly && customText.trim()) {
              submitSingleSelectRef.current?.(q.id, CUSTOM_OPTION_ID, customText);
            }
          } else {
            selectAnswer(q.id, qIdx, (q.options ?? [])[optIdx].id);
          }
          break;
        }

        case KEYBOARD_KEYS.ESCAPE:
          e.preventDefault();
          handleSkipToCustomInput(q.id, qIdx);
          if (isSingleSelectOnly) submitSingleSelectRef.current?.(q.id, CUSTOM_OPTION_ID, 'No preference');
          break;

        default:
          if (targetIsTextField || isTextQuestion(q) || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey)
            return;
          dispatch({ type: HITLQuestionsContextActions.FOCUS_LAST_OPTION, payload: { lastOptionIdx } });
          dispatch({
            type: HITLQuestionsContextActions.APPEND_CHAR_TO_CUSTOM_INPUT,
            payload: { question: q, char: e.key },
          });
      }
    },
    [
      questions,
      totalOptions,
      isSingleSelectOnly,
      selectAnswer,
      handleSkipToCustomInput,
      navigateToQuestion,
      dispatch,
      containerRef,
      shouldScrollRef,
      scrollDirectionRef,
      submitRef,
      submitSingleSelectRef,
    ],
  );

  useEffect(() => {
    return handleFocusAndScroll();
  }, [handleFocusAndScroll]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
