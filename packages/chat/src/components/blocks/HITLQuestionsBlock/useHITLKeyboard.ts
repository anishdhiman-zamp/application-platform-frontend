'use client';

import { KEYBOARD_KEYS } from '@zamp-platform/utils';
import { useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';

import { CUSTOM_OPTION_ID } from './constants';
import { HITLQuestionsContextActions, useHITLQuestionsContext } from './HITLQuestionsContext';
import { useHITLQuestions } from './useHITLQuestions';
import { isTextQuestion, optionCountForQuestion } from './utils';

export const useHITLKeyboard = () => {
  const { state, dispatch, questions, containerRef, shouldScrollRef, submitRef, submitSingleSelectRef } =
    useHITLQuestionsContext();

  const { navigateToQuestion, selectAnswer, handleSkipToCustomInput } = useHITLQuestions();

  const { currentQuestion, focusedOptionIndex } = state;
  const prefersReducedMotion = useReducedMotion();

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const isSingleSelectOnly =
    questions.length === 1 && currentQuestion && !isTextQuestion(currentQuestion) && !currentQuestion.is_multi_select;
  const totalOptions = currentQuestion ? optionCountForQuestion(currentQuestion) : 1;

  const scrollFocusedIntoView = useCallback(() => {
    if (!shouldScrollRef.current) return;
    shouldScrollRef.current = false;

    const container = containerRef.current;
    if (!container) return;

    const rafId = requestAnimationFrame(() => {
      const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

      // Resolve the scroll element via live DOM rather than a React ref:
      // AnimatePresence keeps the exiting question's div mounted alongside the
      // entering one during the slide, so a ref attached in JSX would race
      // between the two elements and could be null mid-transition.
      const focusedEl = container.querySelector<HTMLElement>('[data-hitl-focused]');
      const scrollEl =
        focusedEl?.closest<HTMLElement>('[data-hitl-scroll]') ??
        container.querySelector<HTMLElement>('[data-hitl-scroll]');
      if (!scrollEl) return;

      // Focused element lives outside the scroll container (i.e. the custom input
      // row at the bottom of the panel). Reset to top so the question header and
      // first option are visible — what the user expects when entering a question.
      if (!focusedEl || !scrollEl.contains(focusedEl)) {
        scrollEl.scrollTo({ top: 0, behavior });
        return;
      }

      const scrollRect = scrollEl.getBoundingClientRect();
      const elRect = focusedEl.getBoundingClientRect();
      const overflowTop = scrollRect.top - elRect.top;
      const overflowBottom = elRect.bottom - scrollRect.bottom;

      if (overflowTop > 0) {
        scrollEl.scrollTo({ top: scrollEl.scrollTop - overflowTop, behavior });
      } else if (overflowBottom > 0) {
        scrollEl.scrollTo({ top: scrollEl.scrollTop + overflowBottom, behavior });
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [containerRef, shouldScrollRef, prefersReducedMotion]);

  useEffect(() => scrollFocusedIntoView(), [focusedOptionIndex, scrollFocusedIntoView]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const {
        currentQuestionIndex: qIdx,
        focusedOptionIndex: optIdx,
        customInputs: inputs,
        questionFileRefs: fileRefs,
        currentQuestion: q,
      } = stateRef.current;
      if (!q) return;

      const active = document.activeElement;
      if (active && active !== document.body && !containerRef.current?.contains(active)) return;

      shouldScrollRef.current = true;
      dispatch({ type: HITLQuestionsContextActions.SET_HOVER_VISIBLE, payload: { value: true } });

      const targetIsTextField =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);

      const preventUnlessTextField = () => {
        if (!targetIsTextField) e.preventDefault();
      };

      const takeoverFromTextField = () => {
        if (targetIsTextField) containerRef.current?.focus({ preventScroll: true });
      };

      const lastOptionIdx = totalOptions - 1;
      const lastQuestionIdx = questions.length - 1;

      switch (e.key) {
        case KEYBOARD_KEYS.ARROW_DOWN:
          preventUnlessTextField();
          takeoverFromTextField();
          dispatch({ type: HITLQuestionsContextActions.FOCUS_NEXT_OPTION, payload: { lastOptionIdx } });
          break;

        case KEYBOARD_KEYS.ARROW_UP:
          preventUnlessTextField();
          takeoverFromTextField();
          dispatch({ type: HITLQuestionsContextActions.FOCUS_PREV_OPTION, payload: { lastOptionIdx } });
          break;

        case KEYBOARD_KEYS.ENTER: {
          if (e.shiftKey) break;

          const isCustomInputFocused = optIdx === lastOptionIdx;
          const isCmdEnter = e.metaKey || e.ctrlKey;

          // Cmd+Enter: always advance or submit regardless of question type
          if (isCmdEnter) {
            e.preventDefault();
            if (qIdx < lastQuestionIdx) navigateToQuestion(qIdx + 1);
            else submitRef.current?.();
            return;
          }

          // Multi-select + custom input focused: plain Enter does nothing, not even a newline
          if (q.is_multi_select && isCustomInputFocused) {
            e.preventDefault();
            break;
          }

          preventUnlessTextField();

          if (isTextQuestion(q) || isCustomInputFocused) {
            // Free-text or single-select custom input: advance to next question or submit
            e.preventDefault();
            const text = (inputs[q.id] || '').trim();
            const hasAttachments = (fileRefs[q.id]?.length ?? 0) > 0;
            if (text || hasAttachments) {
              if (qIdx < lastQuestionIdx) {
                navigateToQuestion(qIdx + 1);
              } else {
                submitRef.current?.();
              }
            }
          } else {
            // Option row focused: select/toggle that option
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
      submitRef,
      submitSingleSelectRef,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
