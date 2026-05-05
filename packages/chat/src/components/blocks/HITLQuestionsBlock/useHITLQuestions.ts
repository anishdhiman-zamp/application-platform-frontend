'use client';

import { captureException } from '@sentry/browser';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { getChatTaskRoute } from '@/constants/routeConfig';

import { useHitlRespondMutation } from '../../../api/chat';
import { HITLEntityType, type HITLRespondPayloadType } from '../../../types/chat.types';
import type { ChatComposerFileRef } from './ChatComposerInput';
import { CUSTOM_OPTION_ID } from './constants';
import { HITLQuestionsContextActions, useHITLQuestionsContext } from './HITLQuestionsContext';
import { buildResponseForQuestion, isQuestionAnswerComplete, isTextQuestion, optionCountForQuestion } from './utils';

export const useHITLQuestions = () => {
  const {
    state,
    dispatch,
    questions,
    sourceEntityId,
    sourceEntityType,
    conversationId,
    llmModel,
    onSubmit,
    navDirectionRef,
    shouldScrollRef,
    submitRef,
    submitSingleSelectRef,
    clearDraft,
    isSubmitting: isHitlRespondLoading,
    setIsSubmitting,
  } = useHITLQuestionsContext();

  const { currentQuestion, answers, questionFileRefs } = state;

  const router = useRouter();
  const [hitlRespond] = useHitlRespondMutation();

  // ---------- Derived ----------

  const totalOptions = currentQuestion ? optionCountForQuestion(currentQuestion) : 1;
  const allQuestionsAnswered = questions.every(
    (q) => isQuestionAnswerComplete(q, answers[q.id]) || (questionFileRefs[q.id]?.length ?? 0) > 0,
  );
  const isSingleSelectOnly =
    questions.length === 1 && currentQuestion && !isTextQuestion(currentQuestion) && !currentQuestion.is_multi_select;
  const title = currentQuestion?.title ?? undefined;
  const titleEntityId = currentQuestion?.entity_id;
  const titleEntityType = currentQuestion?.entity_type;

  // ---------- Handlers ----------

  const handleTitleClick = useCallback(() => {
    if (titleEntityId && titleEntityType === HITLEntityType.TASK) {
      router.push(getChatTaskRoute({ taskId: titleEntityId, conversationId, inChat: true }));
    }
  }, [titleEntityId, titleEntityType, conversationId, router]);

  const navigateToQuestion = useCallback(
    (index: number, direction: 'next' | 'prev') => {
      navDirectionRef.current = direction;
      shouldScrollRef.current = true;
      dispatch({ type: HITLQuestionsContextActions.NAVIGATE_TO_QUESTION, payload: { index } });
    },
    [dispatch, navDirectionRef, shouldScrollRef],
  );

  const selectAnswer = useCallback(
    (questionId: string, qIndex: number, optionId: string, customText?: string) => {
      dispatch({
        type: HITLQuestionsContextActions.SELECT_ANSWER,
        payload: { questionId, qIndex, optionId, customText },
      });

      const q = questions[qIndex];
      const isMulti = q?.is_multi_select || false;

      if (!isMulti && optionId !== CUSTOM_OPTION_ID) {
        if (isSingleSelectOnly) {
          submitSingleSelectRef.current?.(questionId, optionId, undefined);
          return;
        }
        if (qIndex < questions.length - 1) navigateToQuestion(qIndex + 1, 'next');
      }
    },
    [dispatch, questions, isSingleSelectOnly, navigateToQuestion, submitSingleSelectRef],
  );

  const handleCustomInputChange = useCallback(
    (questionId: string, value: string) => {
      dispatch({ type: HITLQuestionsContextActions.SET_CUSTOM_INPUT, payload: { questionId, value } });
    },
    [dispatch],
  );

  const handleFileReferencesChange = useCallback(
    (questionId: string, refs: ChatComposerFileRef[]) => {
      dispatch({ type: HITLQuestionsContextActions.SET_FILE_REFS, payload: { questionId, refs } });
    },
    [dispatch],
  );

  const handleSkipToCustomInput = useCallback(
    (questionId: string, qIndex: number) => {
      dispatch({ type: HITLQuestionsContextActions.SKIP_TO_CUSTOM_INPUT, payload: { questionId, totalOptions } });
      if (qIndex < questions.length - 1) {
        navigateToQuestion(qIndex + 1, 'next');
      }
    },
    [dispatch, totalOptions, questions.length, navigateToQuestion],
  );

  const handleSubmit = useCallback(async () => {
    if (!allQuestionsAnswered || !sourceEntityId || !sourceEntityType || isHitlRespondLoading) return;

    const submitPayload: HITLRespondPayloadType = {
      source_entity: { entity_type: sourceEntityType, entity_id: sourceEntityId },
      responses: questions.map((question) =>
        buildResponseForQuestion(question, answers[question.id], sourceEntityType, questionFileRefs[question.id]),
      ),
      ...(llmModel ? { llm_model: llmModel } : {}),
    };

    setIsSubmitting(true);
    try {
      await hitlRespond(submitPayload).unwrap();
      clearDraft();
      onSubmit?.();
    } catch (error) {
      captureException(error);
      setIsSubmitting(false);
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
    clearDraft,
    onSubmit,
    llmModel,
    setIsSubmitting,
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
        ...(llmModel ? { llm_model: llmModel } : {}),
      };

      dispatch({ type: HITLQuestionsContextActions.SET_SUBMITTING_OPTION_ID, payload: { optionId } });
      setIsSubmitting(true);
      try {
        await hitlRespond(submitPayload).unwrap();
        clearDraft();
        onSubmit?.();
      } catch (error) {
        captureException(error);
        setIsSubmitting(false);
        dispatch({ type: HITLQuestionsContextActions.SET_SUBMITTING_OPTION_ID, payload: { optionId: null } });
      }
    },
    [
      sourceEntityId,
      sourceEntityType,
      isHitlRespondLoading,
      questions,
      questionFileRefs,
      hitlRespond,
      clearDraft,
      onSubmit,
      dispatch,
      llmModel,
      setIsSubmitting,
    ],
  );

  submitSingleSelectRef.current = handleSingleSelectSubmit;

  const handleDismiss = useCallback(async () => {
    if (!sourceEntityId || !sourceEntityType) return;

    const submitPayload: HITLRespondPayloadType = {
      source_entity: { entity_type: sourceEntityType, entity_id: sourceEntityId },
      responses: questions.map((question) =>
        buildResponseForQuestion(
          question,
          { optionIds: [], customText: '', isSkipped: true },
          sourceEntityType,
          undefined,
        ),
      ),
      ...(llmModel ? { llm_model: llmModel } : {}),
    };

    try {
      await hitlRespond(submitPayload).unwrap();
      clearDraft();
      dispatch({ type: HITLQuestionsContextActions.SKIP_ALL_QUESTIONS });
      onSubmit?.();
    } catch (error) {
      captureException(error);
    }
  }, [dispatch, questions, clearDraft, sourceEntityId, sourceEntityType, hitlRespond, onSubmit, llmModel]);

  return {
    currentQuestion,
    allQuestionsAnswered,
    isSingleSelectOnly,
    isHitlRespondLoading,
    title,
    navigateToQuestion,
    selectAnswer,
    handleCustomInputChange,
    handleFileReferencesChange,
    handleSkipToCustomInput,
    handleSubmit,
    handleDismiss,
    handleTitleClick,
  };
};
