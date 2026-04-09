'use client';

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { DEBOUNCE_DELAY_MS, NEW_CONVERSATION_ID } from '@/modules/pace/pace.constants';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

const MAX_DRAFTS = 10;

interface ChatDraft {
  id: string;
  content: string;
  timestamp: number;
}

interface UseChatDraftInputProps {
  conversationId: string | null;
}

interface UseChatDraftInputReturn {
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
}

const getDraftsFromStorage = (): ChatDraft[] => {
  const stored = getFromLocalStorage(LOCAL_STORAGE_KEYS.CONVERSATION_DRAFTS);

  if (!stored) return [];
  try {
    return JSON.parse(stored) as ChatDraft[];
  } catch {
    setToLocalStorage(LOCAL_STORAGE_KEYS.CONVERSATION_DRAFTS, JSON.stringify([]));

    return [];
  }
};

const evictOldDrafts = (drafts: ChatDraft[]): ChatDraft[] => {
  if (drafts.length <= MAX_DRAFTS) return drafts;

  return [...drafts].sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_DRAFTS);
};

const saveDraftsToStorage = (drafts: ChatDraft[]) => {
  const trimmed = evictOldDrafts(drafts);

  setToLocalStorage(LOCAL_STORAGE_KEYS.CONVERSATION_DRAFTS, JSON.stringify(trimmed));
};

const getDraftById = (drafts: ChatDraft[], id: string): ChatDraft | undefined => {
  return drafts.find((draft) => draft.id === id);
};

const upsertDraft = (drafts: ChatDraft[], id: string, content: string): ChatDraft[] => {
  const existingIndex = drafts.findIndex((draft) => draft.id === id);
  const newDraft: ChatDraft = { id, content, timestamp: Date.now() };

  if (existingIndex >= 0) {
    const updated = [...drafts];

    updated[existingIndex] = newDraft;

    return updated;
  }

  return [...drafts, newDraft];
};

const removeDraft = (drafts: ChatDraft[], id: string): ChatDraft[] => {
  return drafts.filter((draft) => draft.id !== id);
};

/**
 * Hook to manage chat input draft with local storage persistence.
 * Drafts are stored in a single 'conversation_drafts' array and survive page refreshes.
 * localStorage writes are debounced for better performance.
 */
export const useChatDraftInput = ({ conversationId }: UseChatDraftInputProps): UseChatDraftInputReturn => {
  const draftId = conversationId || NEW_CONVERSATION_ID;
  const draftIdRef = useRef(draftId);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageSentFromNewChatRef = useRef(false);

  draftIdRef.current = draftId;

  const [inputValue, setInputValueState] = useState(() => {
    const drafts = getDraftsFromStorage();
    const draft = getDraftById(drafts, draftId);

    return draft?.content || '';
  });

  const persistDraft = useCallback((capturedDraftId: string, content: string) => {
    const drafts = getDraftsFromStorage();

    if (content) {
      const updatedDrafts = upsertDraft(drafts, capturedDraftId, content);

      saveDraftsToStorage(updatedDrafts);
    } else {
      const updatedDrafts = removeDraft(drafts, capturedDraftId);

      saveDraftsToStorage(updatedDrafts);
    }
  }, []);

  const setInputValue = useCallback(
    (newValue: SetStateAction<string>) => {
      setInputValueState((prev) => {
        const nextValue = typeof newValue === 'function' ? newValue(prev) : newValue;

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        const capturedDraftId = draftIdRef.current;

        if (!nextValue && capturedDraftId === NEW_CONVERSATION_ID && prev) {
          messageSentFromNewChatRef.current = true;

          persistDraft(capturedDraftId, nextValue);
        } else {
          debounceTimerRef.current = setTimeout(() => {
            persistDraft(capturedDraftId, nextValue);
          }, DEBOUNCE_DELAY_MS);
        }

        return nextValue;
      });
    },
    [persistDraft],
  );

  useEffect(() => {
    if (draftId !== NEW_CONVERSATION_ID) {
      const drafts = getDraftsFromStorage();
      const updatedDrafts = removeDraft(drafts, NEW_CONVERSATION_ID);

      saveDraftsToStorage(updatedDrafts);
      messageSentFromNewChatRef.current = false;
    }

    const drafts = getDraftsFromStorage();
    const draft = getDraftById(drafts, draftId);

    setInputValueState(draft?.content || '');
  }, [draftId]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    inputValue,
    setInputValue,
  };
};
