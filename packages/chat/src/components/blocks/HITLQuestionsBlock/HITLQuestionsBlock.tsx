'use client';

import { captureException } from '@sentry/browser';
import { KEYBOARD_KEYS } from '@zamp-platform/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useHitlRespondMutation } from '../../../api/chat';
import { HITL_RESPONSE_TYPE } from '../../../types/block.types';
import type { HITLRespondPayloadType, HITLResponse } from '../../../types/chat.types';
import { CUSTOM_OPTION_ID, HITL_APPROVAL_NO, HITL_APPROVAL_YES, HITL_QUESTIONS_LAYOUT } from './constants';
import { HITLQuestionItem } from './HITLQuestionItem';
import { HITLQuestionsFooter } from './HITLQuestionsFooter';
import { HITLQuestionsHeader } from './HITLQuestionsHeader';
import type { HITLQuestionsBlockProps } from './types';
import type { HITLAnswersState } from './utils';
import {
  appendPrintableToCustomInput,
  isApprovalQuestion,
  isMultipleChoiceQuestion,
  isQuestionAnswerComplete,
  lastOptionFocusIndex,
  optionCountForQuestion,
} from './utils';

export const HITLQuestionsBlock = ({
  payload,
  onSubmit,
  sourceEntityId,
  sourceEntityType,
}: HITLQuestionsBlockProps) => {
  const { questions } = payload;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [hitlRespond, { isLoading: isHitlRespondLoading }] = useHitlRespondMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0);
  const [answers, setAnswers] = useState<HITLAnswersState>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const totalOptions = currentQuestion ? optionCountForQuestion(currentQuestion) : 1;
  const allQuestionsAnswered = questions.every((q) => isQuestionAnswerComplete(q, answers[q.id]));

  const stateRef = useRef({
    currentQuestionIndex,
    focusedOptionIndex,
    customInputs,
    totalOptions,
    currentQuestion,
    answers,
  });

  const selectApprovalAnswer = useCallback(
    (questionId: string, qIndex: number, approved: boolean) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          optionIds: [approved ? HITL_APPROVAL_YES : HITL_APPROVAL_NO],
          customText: '',
          isSkipped: false,
        },
      }));
      if (qIndex < questions.length - 1) {
        setCurrentQuestionIndex(qIndex + 1);
        setFocusedOptionIndex(0);
      }
    },
    [questions.length],
  );

  const selectAnswer = useCallback(
    (questionId: string, qIndex: number, optionId: string, customText?: string) => {
      const q = questions[qIndex];
      if (isApprovalQuestion(q)) return;
      const isMulti = isMultipleChoiceQuestion(q);

      setAnswers((prev) => {
        const currentAnswer = prev[questionId] || { optionIds: [], customText: '' };
        let newOptionIds = [...currentAnswer.optionIds];

        if (isMulti) {
          if (newOptionIds.includes(optionId)) {
            newOptionIds = newOptionIds.filter((id) => id !== optionId);
          } else {
            newOptionIds.push(optionId);
          }
        } else {
          newOptionIds = [optionId];
        }

        return {
          ...prev,
          [questionId]: {
            optionIds: newOptionIds,
            customText: customText ?? currentAnswer.customText,
            isSkipped: false,
          },
        };
      });

      if (!isMulti && qIndex < questions.length - 1) {
        setCurrentQuestionIndex(qIndex + 1);
        setFocusedOptionIndex(0);
      }
    },
    [questions],
  );

  const skipQuestion = useCallback(
    (qId: string, qIdx: number) => {
      const q = questions[qIdx];
      setCustomInputs((prev) => ({ ...prev, [qId]: '' }));
      setAnswers((prev) => ({
        ...prev,
        [qId]: { optionIds: [], customText: '', isSkipped: true },
      }));
      const isMulti = isMultipleChoiceQuestion(q);
      if (qIdx < questions.length - 1 && !isMulti) {
        setCurrentQuestionIndex(qIdx + 1);
        setFocusedOptionIndex(0);
      }
    },
    [questions],
  );

  const handleCustomInputChange = useCallback(
    (value: string) => {
      setCustomInputs((prev) => ({ ...prev, [currentQuestion.id]: value }));
      setAnswers((prev) => {
        const currentAns = prev[currentQuestion.id] || { optionIds: [], customText: '' };
        let newOptionIds = [...currentAns.optionIds];
        if (value && !newOptionIds.includes(CUSTOM_OPTION_ID)) {
          newOptionIds.push(CUSTOM_OPTION_ID);
        } else if (!value && newOptionIds.includes(CUSTOM_OPTION_ID)) {
          newOptionIds = newOptionIds.filter((id) => id !== CUSTOM_OPTION_ID);
        }
        return {
          ...prev,
          [currentQuestion.id]: { optionIds: newOptionIds, customText: value, isSkipped: false },
        };
      });
    },
    [currentQuestion],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const {
        currentQuestionIndex: qIdx,
        focusedOptionIndex: optIdx,
        customInputs: inputs,
        totalOptions,
        currentQuestion,
      } = stateRef.current;

      if (!currentQuestion) return;

      const targetIsTextField = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      const preventUnlessTextField = () => {
        if (!targetIsTextField) e.preventDefault();
      };

      const lastOptionIdx = totalOptions - 1;
      const lastQuestionIdx = questions.length - 1;
      const q = currentQuestion;

      switch (e.key) {
        case KEYBOARD_KEYS.ARROW_DOWN: {
          preventUnlessTextField();
          if (optIdx === lastOptionIdx) {
            if (qIdx < lastQuestionIdx) {
              setCurrentQuestionIndex((p) => p + 1);
              setFocusedOptionIndex(0);
            }
          } else {
            setFocusedOptionIndex((p) => p + 1);
          }
          break;
        }
        case KEYBOARD_KEYS.ARROW_UP: {
          preventUnlessTextField();
          if (optIdx === 0) {
            if (qIdx > 0) {
              const prevIdx = qIdx - 1;
              setCurrentQuestionIndex(prevIdx);
              setFocusedOptionIndex(lastOptionFocusIndex(questions[prevIdx]));
            }
          } else {
            setFocusedOptionIndex((p) => p - 1);
          }
          break;
        }
        case KEYBOARD_KEYS.ENTER: {
          preventUnlessTextField();
          if (isApprovalQuestion(q)) {
            selectApprovalAnswer(q.id, qIdx, optIdx === 0);
          } else if (optIdx === lastOptionIdx) {
            selectAnswer(q.id, qIdx, CUSTOM_OPTION_ID, inputs[q.id] || '');
          } else {
            const opts = q.options ?? [];
            selectAnswer(q.id, qIdx, opts[optIdx].id);
          }
          break;
        }
        case KEYBOARD_KEYS.ESCAPE:
          e.preventDefault();
          skipQuestion(q.id, qIdx);
          break;
        default:
          if (targetIsTextField || isApprovalQuestion(q) || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) {
            return;
          }
          setFocusedOptionIndex(lastOptionIdx);
          appendPrintableToCustomInput(q.id, e.key, setCustomInputs, setAnswers);
      }
    },
    [questions, selectAnswer, selectApprovalAnswer, skipQuestion],
  );

  const handleSubmit = useCallback(async () => {
    if (!allQuestionsAnswered || !sourceEntityId || !sourceEntityType || isHitlRespondLoading) return;

    const responses = questions.map((question) => {
      const answer = answers[question.id];
      const entity_type = question.entity_type ?? (sourceEntityType as string);
      const entity_id = question.entity_id ?? question.id;

      const buildSkippedResponse = (): HITLResponse => {
        if (isApprovalQuestion(question)) {
          return { type: HITL_RESPONSE_TYPE.APPROVAL, approved: false, is_skipped: true };
        }
        if (isMultipleChoiceQuestion(question)) {
          return { type: HITL_RESPONSE_TYPE.MULTIPLE_CHOICE, selected_options: [], is_skipped: true };
        }
        return {
          type: HITL_RESPONSE_TYPE.SELECT_ONE,
          selected_option: null,
          custom_input: null,
          is_skipped: true,
        };
      };

      if (answer?.isSkipped) {
        return { entity_type, entity_id, response: buildSkippedResponse() };
      }

      if (isApprovalQuestion(question)) {
        const ids = answer?.optionIds ?? [];
        const approved = ids.includes(HITL_APPROVAL_YES);
        return {
          entity_type,
          entity_id,
          response: { type: HITL_RESPONSE_TYPE.APPROVAL, approved },
        };
      }

      if (isMultipleChoiceQuestion(question)) {
        const ids = answer?.optionIds ?? [];
        const selected_options = ids.filter((id) => id !== CUSTOM_OPTION_ID);
        const customTrimmed = (answer?.customText ?? '').trim();
        const response: HITLResponse = {
          type: HITL_RESPONSE_TYPE.MULTIPLE_CHOICE,
          selected_options,
        };
        if (question.allow_custom_input && customTrimmed) {
          response.custom_input = customTrimmed;
        }
        return { entity_type, entity_id, response };
      }

      const isCustom = answer?.optionIds.includes(CUSTOM_OPTION_ID);
      if (isCustom) {
        return {
          entity_type,
          entity_id,
          response: {
            type: HITL_RESPONSE_TYPE.SELECT_ONE,
            selected_option: null,
            custom_input: answer?.customText?.trim() ?? '',
          },
        };
      }

      return {
        entity_type,
        entity_id,
        response: {
          type: HITL_RESPONSE_TYPE.SELECT_ONE,
          selected_option: answer?.optionIds[0] ?? null,
          custom_input: null,
        },
      };
    });

    const submitPayload: HITLRespondPayloadType = {
      source_entity: { entity_type: sourceEntityType, entity_id: sourceEntityId },
      responses,
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
    hitlRespond,
    onSubmit,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
    stateRef.current = {
      currentQuestionIndex,
      focusedOptionIndex,
      customInputs,
      totalOptions,
      currentQuestion,
      answers,
    };
  }, [currentQuestionIndex, focusedOptionIndex, customInputs, totalOptions, currentQuestion, answers]);

  useEffect(() => {
    if (!isApprovalQuestion(currentQuestion) && focusedOptionIndex === totalOptions - 1 && customInputRef.current) {
      customInputRef.current.focus({ preventScroll: true });
      customInputRef.current.select();
    }
  }, [currentQuestion, focusedOptionIndex, totalOptions, currentQuestionIndex]);

  if (!questions.length) return null;

  return (
    <div ref={containerRef} className='w-full max-w-[659px] outline-none' tabIndex={-1}>
      <div className='bg-GRAY_20 shadow-table-filter-menu relative flex w-full flex-col overflow-hidden rounded-xl'>
        <HITLQuestionsHeader
          questionCount={questions.length}
          currentQuestionIndex={currentQuestionIndex}
          onPrev={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(currentQuestionIndex - 1)}
          onNext={() =>
            currentQuestionIndex < questions.length - 1 && setCurrentQuestionIndex(currentQuestionIndex + 1)
          }
        />

        <div
          className='bg-BG_WHITE shadow-table-filter-menu relative flex flex-col overflow-hidden rounded-xl border border-gray-300'
          style={{ maxHeight: HITL_QUESTIONS_LAYOUT.PANEL_MAX_HEIGHT_PX }}
        >
          <div ref={scrollContainerRef} className='min-h-0 w-full flex-1 overflow-y-auto'>
            {questions.map((question, qIndex) => (
              <HITLQuestionItem
                key={question.id}
                question={question}
                qIndex={qIndex}
                questionsLength={questions.length}
                currentQuestionIndex={currentQuestionIndex}
                focusedOptionIndex={focusedOptionIndex}
                answers={answers}
                customInputs={customInputs}
                customInputRef={customInputRef}
                containerRef={containerRef}
                setQuestionEl={(el) => {
                  questionRefs.current[qIndex] = el;
                }}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                setFocusedOptionIndex={setFocusedOptionIndex}
                selectApprovalAnswer={selectApprovalAnswer}
                selectAnswer={selectAnswer}
                onCustomInputChange={handleCustomInputChange}
              />
            ))}
            <div className='shrink-0' style={{ height: HITL_QUESTIONS_LAYOUT.BOTTOM_INSET_PX }} />
          </div>

          <HITLQuestionsFooter
            onSkip={() => skipQuestion(currentQuestion.id, currentQuestionIndex)}
            onSubmit={() => void handleSubmit()}
            submitDisabled={!allQuestionsAnswered}
            isSubmitting={isHitlRespondLoading}
          />
        </div>
      </div>
    </div>
  );
};
