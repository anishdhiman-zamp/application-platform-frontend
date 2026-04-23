'use client';

import { createContext, Dispatch, useCallback, useContext, useEffect, useReducer, useRef } from 'react';

import type { ChatComposerFileRef } from './ChatComposerInput';
import { CUSTOM_OPTION_ID } from './constants';
import type { HITLQuestionsBlockProps } from './types';
import type { HITLQuestionWithEntity } from './types';
import {
  clearHITLDraft,
  type HITLAnswersState,
  type HITLAnswerValue,
  isMultipleChoiceQuestion,
  isTextQuestion,
  optionCountForQuestion,
  readHITLDraft,
  writeHITLDraft,
} from './utils';

// ---------- Constants ----------

export const NO_PREFERENCE_TEXT = 'No preference';

export type NavDirection = 'next' | 'prev';
export type ScrollDirection = 'up' | 'down';

// ---------- Actions ----------

enum HITLQuestionsContextActions {
  NAVIGATE_TO_QUESTION = 'NAVIGATE_TO_QUESTION',
  SET_FOCUSED_OPTION_INDEX = 'SET_FOCUSED_OPTION_INDEX',
  FOCUS_NEXT_OPTION = 'FOCUS_NEXT_OPTION',
  FOCUS_PREV_OPTION = 'FOCUS_PREV_OPTION',
  FOCUS_LAST_OPTION = 'FOCUS_LAST_OPTION',
  SELECT_ANSWER = 'SELECT_ANSWER',
  SET_CUSTOM_INPUT = 'SET_CUSTOM_INPUT',
  APPEND_CHAR_TO_CUSTOM_INPUT = 'APPEND_CHAR_TO_CUSTOM_INPUT',
  SET_FILE_REFS = 'SET_FILE_REFS',
  SKIP_TO_CUSTOM_INPUT = 'SKIP_TO_CUSTOM_INPUT',
  SKIP_ALL_QUESTIONS = 'SKIP_ALL_QUESTIONS',
  SET_SUBMITTING_OPTION_ID = 'SET_SUBMITTING_OPTION_ID',
}

export type HITLActionType =
  | { type: HITLQuestionsContextActions.NAVIGATE_TO_QUESTION; payload: { index: number } }
  | { type: HITLQuestionsContextActions.SET_FOCUSED_OPTION_INDEX; payload: { index: number } }
  | { type: HITLQuestionsContextActions.FOCUS_NEXT_OPTION; payload: { lastOptionIdx: number } }
  | { type: HITLQuestionsContextActions.FOCUS_PREV_OPTION; payload: { lastOptionIdx: number } }
  | { type: HITLQuestionsContextActions.FOCUS_LAST_OPTION; payload: { lastOptionIdx: number } }
  | {
      type: HITLQuestionsContextActions.SELECT_ANSWER;
      payload: { questionId: string; qIndex: number; optionId: string; customText?: string };
    }
  | { type: HITLQuestionsContextActions.SET_CUSTOM_INPUT; payload: { questionId: string; value: string } }
  | {
      type: HITLQuestionsContextActions.APPEND_CHAR_TO_CUSTOM_INPUT;
      payload: { question: HITLQuestionWithEntity; char: string };
    }
  | { type: HITLQuestionsContextActions.SET_FILE_REFS; payload: { questionId: string; refs: ChatComposerFileRef[] } }
  | { type: HITLQuestionsContextActions.SKIP_TO_CUSTOM_INPUT; payload: { questionId: string; totalOptions: number } }
  | { type: HITLQuestionsContextActions.SKIP_ALL_QUESTIONS }
  | { type: HITLQuestionsContextActions.SET_SUBMITTING_OPTION_ID; payload: { optionId: string | null } };

// ---------- State ----------

interface HITLQuestionsState {
  currentQuestionIndex: number;
  currentQuestion: HITLQuestionWithEntity;
  focusedOptionIndex: number;
  answers: HITLAnswersState;
  customInputs: Record<string, string>;
  questionFileRefs: Record<string, ChatComposerFileRef[]>;
  submittingOptionId: string | null;
}

const createInitialState = (
  questions: HITLQuestionWithEntity[],
  draft: { answers: HITLAnswersState; customInputs: Record<string, string> } | null,
): HITLQuestionsState => ({
  currentQuestionIndex: 0,
  currentQuestion: questions[0],
  focusedOptionIndex: questions[0] ? optionCountForQuestion(questions[0]) - 1 : 0,
  answers: draft?.answers ?? {},
  customInputs: draft?.customInputs ?? {},
  questionFileRefs: {},
  submittingOptionId: null,
});

// ---------- Reducer helpers ----------

const buildSelectAnswerUpdate = (
  current: HITLAnswerValue,
  optionId: string,
  customText: string | undefined,
  isMulti: boolean,
): HITLAnswerValue => {
  const isCustomOption = optionId === CUSTOM_OPTION_ID;
  const wasSkipped = current.customText === NO_PREFERENCE_TEXT && current.optionIds.includes(CUSTOM_OPTION_ID);

  let newOptionIds = [...current.optionIds];
  if (isMulti) {
    newOptionIds = newOptionIds.includes(optionId)
      ? newOptionIds.filter((id) => id !== optionId)
      : [...newOptionIds, optionId];
    if (!isCustomOption && wasSkipped) {
      newOptionIds = newOptionIds.filter((id) => id !== CUSTOM_OPTION_ID);
    }
  } else {
    newOptionIds = [optionId];
  }

  let newCustomText: string;
  if (isCustomOption) {
    newCustomText = customText ?? current.customText ?? '';
  } else if (isMulti && wasSkipped) {
    newCustomText = '';
  } else if (!isMulti) {
    newCustomText = '';
  } else {
    newCustomText = customText ?? current.customText ?? '';
  }

  return { optionIds: newOptionIds, customText: newCustomText, isSkipped: false };
};

const buildCustomInputAnswerUpdate = (current: HITLAnswerValue, value: string, isMulti: boolean): HITLAnswerValue => {
  let newOptionIds = [...current.optionIds];
  if (value) {
    if (!isMulti) newOptionIds = [];
    if (!newOptionIds.includes(CUSTOM_OPTION_ID)) newOptionIds.push(CUSTOM_OPTION_ID);
  } else {
    newOptionIds = newOptionIds.filter((id) => id !== CUSTOM_OPTION_ID);
  }
  return { optionIds: newOptionIds, customText: value, isSkipped: false };
};

// ---------- Reducer ----------

const createReducer =
  (questions: HITLQuestionWithEntity[]) =>
  (state: HITLQuestionsState, action: HITLActionType): HITLQuestionsState => {
    switch (action.type) {
      case HITLQuestionsContextActions.NAVIGATE_TO_QUESTION: {
        const nextQuestion = questions[action.payload.index];
        return {
          ...state,
          currentQuestionIndex: action.payload.index,
          currentQuestion: nextQuestion,
          focusedOptionIndex: nextQuestion ? optionCountForQuestion(nextQuestion) - 1 : 0,
        };
      }

      case HITLQuestionsContextActions.SET_FOCUSED_OPTION_INDEX:
        return { ...state, focusedOptionIndex: action.payload.index };

      case HITLQuestionsContextActions.FOCUS_NEXT_OPTION:
        return {
          ...state,
          focusedOptionIndex:
            state.focusedOptionIndex === action.payload.lastOptionIdx ? 0 : state.focusedOptionIndex + 1,
        };

      case HITLQuestionsContextActions.FOCUS_PREV_OPTION:
        return {
          ...state,
          focusedOptionIndex:
            state.focusedOptionIndex === 0 ? action.payload.lastOptionIdx : state.focusedOptionIndex - 1,
        };

      case HITLQuestionsContextActions.FOCUS_LAST_OPTION:
        return { ...state, focusedOptionIndex: action.payload.lastOptionIdx };

      case HITLQuestionsContextActions.SELECT_ANSWER: {
        const { questionId, qIndex, optionId, customText } = action.payload;
        const q = questions[qIndex];
        const isMulti = isMultipleChoiceQuestion(q);
        const current = state.answers[questionId] ?? { optionIds: [], customText: '' };
        const updatedAnswer = buildSelectAnswerUpdate(current, optionId, customText, isMulti);

        let newCustomInputs = state.customInputs;
        if (isMulti && optionId !== CUSTOM_OPTION_ID && state.customInputs[questionId] === NO_PREFERENCE_TEXT) {
          newCustomInputs = { ...state.customInputs, [questionId]: '' };
        } else if (!isMulti && optionId !== CUSTOM_OPTION_ID) {
          newCustomInputs = { ...state.customInputs, [questionId]: '' };
        }

        return {
          ...state,
          answers: { ...state.answers, [questionId]: updatedAnswer },
          customInputs: newCustomInputs,
        };
      }

      case HITLQuestionsContextActions.SET_CUSTOM_INPUT: {
        const { questionId, value } = action.payload;
        const q = questions.find((question) => question.id === questionId);
        if (!q) return state;

        const newCustomInputs = { ...state.customInputs, [questionId]: value };

        if (isTextQuestion(q)) {
          return {
            ...state,
            customInputs: newCustomInputs,
            answers: { ...state.answers, [questionId]: { optionIds: [], customText: value, isSkipped: false } },
          };
        }

        const isMulti = isMultipleChoiceQuestion(q);
        const current = state.answers[questionId] ?? { optionIds: [], customText: '' };
        return {
          ...state,
          customInputs: newCustomInputs,
          answers: { ...state.answers, [questionId]: buildCustomInputAnswerUpdate(current, value, isMulti) },
        };
      }

      case HITLQuestionsContextActions.APPEND_CHAR_TO_CUSTOM_INPUT: {
        const { question, char } = action.payload;
        const { id: questionId } = question;
        const isMulti = isMultipleChoiceQuestion(question);
        const current = state.answers[questionId] ?? { optionIds: [], customText: '' };
        const newText = (current.customText ?? '') + char;
        const baseOptionIds = isMulti ? current.optionIds : [];
        const optionIds = baseOptionIds.includes(CUSTOM_OPTION_ID)
          ? baseOptionIds
          : [...baseOptionIds, CUSTOM_OPTION_ID];
        return {
          ...state,
          answers: { ...state.answers, [questionId]: { optionIds, customText: newText, isSkipped: false } },
          customInputs: { ...state.customInputs, [questionId]: (state.customInputs[questionId] ?? '') + char },
        };
      }

      case HITLQuestionsContextActions.SET_FILE_REFS:
        return {
          ...state,
          questionFileRefs: {
            ...state.questionFileRefs,
            [action.payload.questionId]: action.payload.refs,
          },
        };

      case HITLQuestionsContextActions.SKIP_TO_CUSTOM_INPUT: {
        const { questionId, totalOptions } = action.payload;
        return {
          ...state,
          focusedOptionIndex: totalOptions - 1,
          customInputs: { ...state.customInputs, [questionId]: NO_PREFERENCE_TEXT },
          answers: {
            ...state.answers,
            [questionId]: { optionIds: [CUSTOM_OPTION_ID], customText: NO_PREFERENCE_TEXT, isSkipped: false },
          },
        };
      }

      case HITLQuestionsContextActions.SKIP_ALL_QUESTIONS: {
        const skipped: HITLAnswersState = { ...state.answers };
        for (const q of questions) {
          skipped[q.id] = { optionIds: [], customText: '', isSkipped: true };
        }
        return { ...state, answers: skipped };
      }

      case HITLQuestionsContextActions.SET_SUBMITTING_OPTION_ID:
        return { ...state, submittingOptionId: action.payload.optionId };

      default:
        return state;
    }
  };

// ---------- Context ----------

interface HITLQuestionsContextType {
  state: HITLQuestionsState;
  dispatch: Dispatch<HITLActionType>;
  questions: HITLQuestionsBlockProps['payload']['questions'];
  username?: string;
  sourceEntityId?: string;
  sourceEntityType?: HITLQuestionsBlockProps['sourceEntityType'];
  conversationId?: string;
  llmModel?: string | null;
  onSubmit?: HITLQuestionsBlockProps['onSubmit'];
  containerRef: React.RefObject<HTMLDivElement | null>;
  questionScrollRef: React.RefObject<HTMLDivElement | null>;
  navDirectionRef: React.RefObject<NavDirection>;
  scrollDirectionRef: React.RefObject<ScrollDirection>;
  shouldScrollRef: React.RefObject<boolean>;
  submitRef: React.RefObject<(() => void) | null>;
  submitSingleSelectRef: React.RefObject<
    ((questionId: string, optionId: string, customText: string | undefined) => void) | null
  >;
  clearDraft: () => void;
}

const HITLQuestionsContext = createContext<HITLQuestionsContextType | null>(null);

export const useHITLQuestionsContext = (): HITLQuestionsContextType => {
  const ctx = useContext(HITLQuestionsContext);
  if (!ctx) throw new Error('useHITLQuestionsContext must be used within HITLQuestionsProvider');
  return ctx;
};

// ---------- Provider ----------

interface HITLQuestionsProviderProps extends HITLQuestionsBlockProps {
  children: React.ReactNode;
}

export const HITLQuestionsProvider = ({
  payload,
  onSubmit,
  sourceEntityId,
  sourceEntityType,
  conversationId,
  username,
  llmModel,
  children,
}: HITLQuestionsProviderProps) => {
  const { questions } = payload;

  const [state, dispatch] = useReducer(createReducer(questions), null, () =>
    createInitialState(questions, sourceEntityId ? readHITLDraft(sourceEntityId) : null),
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const questionScrollRef = useRef<HTMLDivElement>(null);
  const navDirectionRef = useRef<NavDirection>('next');
  const scrollDirectionRef = useRef<ScrollDirection>('down');
  const shouldScrollRef = useRef(false);
  const submitRef = useRef<(() => void) | null>(null);
  const submitSingleSelectRef = useRef<
    ((questionId: string, optionId: string, customText: string | undefined) => void) | null
  >(null);

  const clearDraft = useCallback(() => {
    if (sourceEntityId) clearHITLDraft(sourceEntityId);
  }, [sourceEntityId]);

  useEffect(() => {
    if (!sourceEntityId) return;
    writeHITLDraft(sourceEntityId, { answers: state.answers, customInputs: state.customInputs });
  }, [sourceEntityId, state.answers, state.customInputs]);

  return (
    <HITLQuestionsContext.Provider
      value={{
        state,
        dispatch,
        questions,
        username,
        sourceEntityId,
        sourceEntityType,
        conversationId,
        llmModel,
        onSubmit,
        containerRef,
        questionScrollRef,
        navDirectionRef,
        scrollDirectionRef,
        shouldScrollRef,
        submitRef,
        submitSingleSelectRef,
        clearDraft,
      }}
    >
      {children}
    </HITLQuestionsContext.Provider>
  );
};

export { HITLQuestionsContextActions };
