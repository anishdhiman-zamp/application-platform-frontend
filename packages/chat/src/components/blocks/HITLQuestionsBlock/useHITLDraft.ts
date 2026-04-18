'use client';

import { useCallback, useEffect, useState } from 'react';

import { clearHITLDraft, type HITLAnswersState, readHITLDraft, writeHITLDraft } from './utils';

interface UseHITLDraftReturn {
  answers: HITLAnswersState;
  setAnswers: React.Dispatch<React.SetStateAction<HITLAnswersState>>;
  customInputs: Record<string, string>;
  setCustomInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  clearDraft: () => void;
}

export const useHITLDraft = (sourceEntityId: string | undefined): UseHITLDraftReturn => {
  const [answers, setAnswers] = useState<HITLAnswersState>(() => {
    if (!sourceEntityId) return {};
    return readHITLDraft(sourceEntityId)?.answers ?? {};
  });

  const [customInputs, setCustomInputs] = useState<Record<string, string>>(() => {
    if (!sourceEntityId) return {};
    return readHITLDraft(sourceEntityId)?.customInputs ?? {};
  });

  useEffect(() => {
    if (!sourceEntityId) return;
    writeHITLDraft(sourceEntityId, { answers, customInputs });
  }, [sourceEntityId, answers, customInputs]);

  const clearDraft = useCallback(() => {
    if (sourceEntityId) clearHITLDraft(sourceEntityId);
  }, [sourceEntityId]);

  return { answers, setAnswers, customInputs, setCustomInputs, clearDraft };
};
