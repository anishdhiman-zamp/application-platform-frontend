'use client';

import { captureException } from '@sentry/browser';
import { KEYBOARD_KEYS } from '@zamp-platform/utils';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { getChatTaskRoute } from '@/constants/routeConfig';

import { useHitlRespondMutation } from '../../../api/chat';
import { HITLEntityType, type HITLRespondPayloadType } from '../../../types/chat.types';
import type { ChatComposerFileRef } from './ChatComposerInput';
import { CUSTOM_OPTION_ID, HITL_QUESTIONS_LAYOUT } from './constants';
import { HITLQuestionItem } from './HITLQuestionItem';
import { HITLQuestionsFooter } from './HITLQuestionsFooter';
import { HITLQuestionsHeader } from './HITLQuestionsHeader';
import type { HITLQuestionsBlockProps } from './types';
import {
  appendPrintableToCustomInput,
  buildResponseForQuestion,
  buildSkippedAnswers,
  type HITLAnswersState,
  isMultipleChoiceQuestion,
  isQuestionAnswerComplete,
  isTextQuestion,
  optionCountForQuestion,
} from './utils';

const SLIDE_OFFSET_PX = 32;

export const HITLQuestionsBlock = ({
  payload,
  onSubmit,
  sourceEntityId,
  sourceEntityType,
  conversationId,
  username,
}: HITLQuestionsBlockProps) => {
  const { questions } = payload;
  const router = useRouter();
  const title = questions[0]?.title ?? undefined;
  const titleEntityId = questions[0]?.entity_id;
  const titleEntityType = questions[0]?.entity_type;
  const handleTitleClick = useCallback(() => {
    if (titleEntityId && titleEntityType === HITLEntityType.TASK) {
      router.push(getChatTaskRoute({ taskId: titleEntityId, conversationId }));
    }
  }, [titleEntityId, titleEntityType, conversationId, router]);

  // --- State ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(() =>
    questions[0] ? optionCountForQuestion(questions[0]) - 1 : 0,
  );
  const [answers, setAnswers] = useState<HITLAnswersState>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [questionFileRefs, setQuestionFileRefs] = useState<Record<string, ChatComposerFileRef[]>>({});
  const [submittingOptionId, setSubmittingOptionId] = useState<string | null>(null);

  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null);
  const questionScrollRef = useRef<HTMLDivElement>(null);
  const navDirectionRef = useRef<'next' | 'prev'>('next');
  const scrollDirectionRef = useRef<'up' | 'down'>('down');
  const shouldScrollRef = useRef(false);
  const submitRef = useRef<(() => void) | null>(null);
  const submitSingleSelectRef = useRef<
    ((questionId: string, optionId: string, customText: string | undefined) => void) | null
  >(null);
  const stateRef = useRef({ currentQuestionIndex, focusedOptionIndex, customInputs, questionFileRefs });

  // --- Derived state ---
  const currentQuestion = questions[currentQuestionIndex];
  const totalOptions = currentQuestion ? optionCountForQuestion(currentQuestion) : 1;
  const allQuestionsAnswered = questions.every(
    (q) => isQuestionAnswerComplete(q, answers[q.id]) || (questionFileRefs[q.id]?.length ?? 0) > 0,
  );
  const isSingleSelectOnly =
    questions.length === 1 && !isMultipleChoiceQuestion(questions[0]) && !isTextQuestion(questions[0]);

  const [hitlRespond, { isLoading: isHitlRespondLoading }] = useHitlRespondMutation();

  // --- Handlers ---
  const navigateToQuestion = useCallback(
    (index: number, direction: 'next' | 'prev') => {
      navDirectionRef.current = direction;
      shouldScrollRef.current = true;
      setCurrentQuestionIndex(index);
      const nextQuestion = questions[index];
      setFocusedOptionIndex(nextQuestion ? optionCountForQuestion(nextQuestion) - 1 : 0);
    },
    [questions],
  );

  const selectAnswer = useCallback(
    (questionId: string, qIndex: number, optionId: string, customText?: string) => {
      const q = questions[qIndex];
      const isMulti = isMultipleChoiceQuestion(q);

      setAnswers((prev) => {
        const current = prev[questionId] || { optionIds: [], customText: '' };
        let newOptionIds = [...current.optionIds];

        if (isMulti) {
          newOptionIds = newOptionIds.includes(optionId)
            ? newOptionIds.filter((id) => id !== optionId)
            : [...newOptionIds, optionId];
        } else {
          newOptionIds = [optionId];
        }

        const isCustomOption = optionId === CUSTOM_OPTION_ID;
        const wasSkipped = current.customText === 'No preference' && current.optionIds.includes(CUSTOM_OPTION_ID);
        if (isMulti && !isCustomOption && wasSkipped) {
          newOptionIds = newOptionIds.filter((id) => id !== CUSTOM_OPTION_ID);
        }
        const newCustomText = isMulti
          ? isCustomOption
            ? (customText ?? current.customText)
            : wasSkipped
              ? ''
              : (customText ?? current.customText)
          : isCustomOption
            ? (customText ?? current.customText)
            : '';

        return { ...prev, [questionId]: { optionIds: newOptionIds, customText: newCustomText, isSkipped: false } };
      });

      if (isMulti) {
        if (optionId !== CUSTOM_OPTION_ID) {
          setCustomInputs((prev) => {
            if (prev[questionId] === 'No preference') return { ...prev, [questionId]: '' };
            return prev;
          });
        }
      } else {
        if (optionId !== CUSTOM_OPTION_ID) {
          setCustomInputs((prev) => ({ ...prev, [questionId]: '' }));
          if (isSingleSelectOnly) {
            submitSingleSelectRef.current?.(questionId, optionId, undefined);
            return;
          }
        }
        if (qIndex < questions.length - 1) navigateToQuestion(qIndex + 1, 'next');
      }
    },
    [questions, navigateToQuestion, isSingleSelectOnly],
  );

  const handleCustomInputChange = useCallback(
    (questionId: string, value: string) => {
      const q = questions.find((question) => question.id === questionId);
      if (!q) return;

      setCustomInputs((prev) => ({ ...prev, [questionId]: value }));

      if (isTextQuestion(q)) {
        setAnswers((prev) => ({ ...prev, [questionId]: { optionIds: [], customText: value, isSkipped: false } }));
        return;
      }

      setAnswers((prev) => {
        const isMulti = isMultipleChoiceQuestion(q);
        const current = prev[questionId] || { optionIds: [], customText: '' };
        let newOptionIds = [...current.optionIds];
        if (value) {
          // User typed something — switch to custom mode, clear any real selections for single-select
          if (!isMulti) newOptionIds = [];
          if (!newOptionIds.includes(CUSTOM_OPTION_ID)) newOptionIds.push(CUSTOM_OPTION_ID);
        } else {
          // Empty input — remove custom option marker but preserve real selections
          newOptionIds = newOptionIds.filter((id) => id !== CUSTOM_OPTION_ID);
        }
        return { ...prev, [questionId]: { optionIds: newOptionIds, customText: value, isSkipped: false } };
      });
    },
    [questions],
  );

  const handleFileReferencesChange = useCallback((questionId: string, refs: ChatComposerFileRef[]) => {
    setQuestionFileRefs((prev) => ({ ...prev, [questionId]: refs }));
  }, []);

  const handleSkipToCustomInput = useCallback(
    (questionId: string, qIndex: number) => {
      setCustomInputs((prev) => ({ ...prev, [questionId]: 'No preference' }));
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { optionIds: [CUSTOM_OPTION_ID], customText: 'No preference', isSkipped: false },
      }));
      if (qIndex < questions.length - 1) {
        navigateToQuestion(qIndex + 1, 'next');
      } else {
        setFocusedOptionIndex(totalOptions - 1);
      }
    },
    [questions.length, totalOptions, navigateToQuestion],
  );

  const handleSubmit = useCallback(async () => {
    if (!allQuestionsAnswered || !sourceEntityId || !sourceEntityType || isHitlRespondLoading) return;

    const submitPayload: HITLRespondPayloadType = {
      source_entity: { entity_type: sourceEntityType, entity_id: sourceEntityId },
      responses: questions.map((question) =>
        buildResponseForQuestion(question, answers[question.id], sourceEntityType, questionFileRefs[question.id]),
      ),
    };

    try {
      await hitlRespond(submitPayload).unwrap();
      onSubmit?.();
    } catch (error) {
      captureException(error);
    }
  }, [
    allQuestionsAnswered,
    sourceEntityId,
    sourceEntityType,
    isHitlRespondLoading,
    questions,
    answers,
    questionFileRefs,
    hitlRespond,
    onSubmit,
  ]);

  submitRef.current = () => void handleSubmit();

  const handleSingleSelectSubmit = useCallback(
    async (questionId: string, optionId: string, customText: string | undefined) => {
      if (!sourceEntityId || !sourceEntityType || isHitlRespondLoading) return;
      const question = questions.find((q) => q.id === questionId);
      if (!question) return;

      const answer =
        optionId === CUSTOM_OPTION_ID
          ? { optionIds: [CUSTOM_OPTION_ID], customText: customText ?? '', isSkipped: false }
          : { optionIds: [optionId], customText: '', isSkipped: false };

      const submitPayload: HITLRespondPayloadType = {
        source_entity: { entity_type: sourceEntityType, entity_id: sourceEntityId },
        responses: [buildResponseForQuestion(question, answer, sourceEntityType, questionFileRefs[questionId])],
      };

      setSubmittingOptionId(optionId);
      try {
        await hitlRespond(submitPayload).unwrap();
        onSubmit?.();
      } catch (error) {
        captureException(error);
        setSubmittingOptionId(null);
      }
    },
    [sourceEntityId, sourceEntityType, isHitlRespondLoading, questions, questionFileRefs, hitlRespond, onSubmit],
  );

  submitSingleSelectRef.current = handleSingleSelectSubmit;

  const handleDismiss = useCallback(() => {
    setAnswers((prev) => buildSkippedAnswers(questions, prev));
    setTimeout(() => submitRef.current?.(), 0);
  }, [questions]);

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
  }, [focusedOptionIndex, totalOptions]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && active !== document.body && !containerRef.current?.contains(active)) return;

      const {
        currentQuestionIndex: qIdx,
        focusedOptionIndex: optIdx,
        customInputs: inputs,
        questionFileRefs: fileRefs,
      } = stateRef.current;
      if (!currentQuestion) return;

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
      const q = currentQuestion;

      switch (e.key) {
        case KEYBOARD_KEYS.ARROW_DOWN: {
          preventUnlessTextField();
          scrollDirectionRef.current = 'down';
          setFocusedOptionIndex((p) => (p === lastOptionIdx ? 0 : p + 1));
          break;
        }
        case KEYBOARD_KEYS.ARROW_UP: {
          preventUnlessTextField();
          scrollDirectionRef.current = 'up';
          setFocusedOptionIndex((p) => (p === 0 ? lastOptionIdx : p - 1));
          break;
        }
        case KEYBOARD_KEYS.ENTER: {
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (qIdx < lastQuestionIdx) {
              navigateToQuestion(qIdx + 1, 'next');
            } else {
              submitRef.current?.();
            }
            return;
          }
          preventUnlessTextField();
          if (isTextQuestion(q)) {
            e.preventDefault();
            const text = (inputs[q.id] || '').trim();
            const hasAttachments = (fileRefs[q.id]?.length ?? 0) > 0;
            if ((text || hasAttachments) && qIdx < lastQuestionIdx) {
              navigateToQuestion(qIdx + 1, 'next');
            }
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
        case KEYBOARD_KEYS.ESCAPE: {
          e.preventDefault();
          handleSkipToCustomInput(q.id, qIdx);
          if (isSingleSelectOnly) {
            submitSingleSelectRef.current?.(q.id, CUSTOM_OPTION_ID, 'No preference');
          }
          break;
        }
        default:
          if (targetIsTextField || isTextQuestion(q) || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) {
            return;
          }
          setFocusedOptionIndex(lastOptionIdx);
          appendPrintableToCustomInput(q, e.key, setCustomInputs, setAnswers);
      }
    },
    [
      currentQuestion,
      questions,
      totalOptions,
      isSingleSelectOnly,
      selectAnswer,
      handleSkipToCustomInput,
      navigateToQuestion,
    ],
  );

  // --- Effects ---
  useEffect(() => {
    stateRef.current = { currentQuestionIndex, focusedOptionIndex, customInputs, questionFileRefs };
  }, [currentQuestionIndex, focusedOptionIndex, customInputs, questionFileRefs]);

  useEffect(() => {
    return handleFocusAndScroll();
  }, [handleFocusAndScroll]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!questions.length) return null;

  return (
    <div ref={containerRef} className='w-full max-w-[659px] outline-none' tabIndex={-1}>
      <div className='bg-GRAY_100 shadow-table-filter-menu relative flex w-full flex-col overflow-hidden rounded-xl'>
        <HITLQuestionsHeader
          questionCount={questions.length}
          currentQuestionIndex={currentQuestionIndex}
          title={title}
          onTitleClick={handleTitleClick}
          onPrev={() => currentQuestionIndex > 0 && navigateToQuestion(currentQuestionIndex - 1, 'prev')}
          onNext={() =>
            currentQuestionIndex < questions.length - 1 && navigateToQuestion(currentQuestionIndex + 1, 'next')
          }
          onDismiss={handleDismiss}
        />

        <div className='bg-BG_WHITE shadow-table-filter-menu relative flex flex-col overflow-hidden rounded-xl border border-gray-300'>
          <div className='relative overflow-hidden'>
            <AnimatePresence mode='wait' initial={false}>
              <motion.div
                key={currentQuestion.id}
                initial={{ x: navDirectionRef.current === 'next' ? SLIDE_OFFSET_PX : -SLIDE_OFFSET_PX, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: navDirectionRef.current === 'next' ? -SLIDE_OFFSET_PX : SLIDE_OFFSET_PX, opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
              >
                <div
                  ref={questionScrollRef}
                  className='overflow-y-auto [scrollbar-width:thin]'
                  style={{ maxHeight: HITL_QUESTIONS_LAYOUT.PANEL_MAX_HEIGHT_PX }}
                >
                  <HITLQuestionItem
                    question={currentQuestion}
                    qIndex={currentQuestionIndex}
                    questionsLength={questions.length}
                    currentQuestionIndex={currentQuestionIndex}
                    focusedOptionIndex={focusedOptionIndex}
                    answers={answers}
                    customInputs={customInputs}
                    containerRef={containerRef}
                    submittingOptionId={submittingOptionId}
                    isSingleSelectOnly={isSingleSelectOnly}
                    setCurrentQuestionIndex={(i) => navigateToQuestion(i, i > currentQuestionIndex ? 'next' : 'prev')}
                    setFocusedOptionIndex={setFocusedOptionIndex}
                    selectAnswer={selectAnswer}
                    onCustomInputChange={(value) => handleCustomInputChange(currentQuestion.id, value)}
                    onFileReferencesChange={handleFileReferencesChange}
                    username={username}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <HITLQuestionsFooter
            onSkip={() => handleSkipToCustomInput(currentQuestion.id, currentQuestionIndex)}
            onSubmit={() => void handleSubmit()}
            onNext={() => navigateToQuestion(currentQuestionIndex + 1, 'next')}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
            currentQuestionAnswered={
              isQuestionAnswerComplete(currentQuestion, answers[currentQuestion.id]) ||
              (questionFileRefs[currentQuestion.id]?.length ?? 0) > 0
            }
            submitDisabled={!allQuestionsAnswered}
            isSubmitting={isHitlRespondLoading}
            isSingleSelectOnly={isSingleSelectOnly}
          />
        </div>
      </div>
    </div>
  );
};
