'use client';

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

const DEBOUNCE_DELAY_MS = 300;
const NEW_CONVERSATION_ID = 'null_thread';

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

// get drafts from localStorage
const getDraftsFromStorage = (): ChatDraft[] => {
  const stored = getFromLocalStorage(LOCAL_STORAGE_KEYS.CHAT_DRAFTS);

  if (!stored) return [];
  try {
    return JSON.parse(stored) as ChatDraft[];
  } catch {
    return [];
  }
};

// save drafts to localStorage
const saveDraftsToStorage = (drafts: ChatDraft[]) => {
  setToLocalStorage(LOCAL_STORAGE_KEYS.CHAT_DRAFTS, JSON.stringify(drafts));
};

// get draft by id
const getDraftById = (drafts: ChatDraft[], id: string): ChatDraft | undefined => {
  return drafts.find((draft) => draft.id === id);
};

// upsert draft
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

// remove draft
const removeDraft = (drafts: ChatDraft[], id: string): ChatDraft[] => {
  return drafts.filter((draft) => draft.id !== id);
};

/**
 * Hook to manage chat input draft with local storage persistence.
 * Drafts are stored in a single 'chat_drafts' array and survive page refreshes.
 * localStorage writes are debounced for better performance.
 */
export const useChatDraftInput = ({ conversationId }: UseChatDraftInputProps): UseChatDraftInputReturn => {
  const draftId = conversationId || NEW_CONVERSATION_ID;
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [inputValue, setInputValueState] = useState(() => {
    const drafts = getDraftsFromStorage();
    const draft = getDraftById(drafts, draftId);

    return draft?.content || '';
  });

  // Load draft when conversationId changes
  useEffect(() => {
    const drafts = getDraftsFromStorage();
    const draft = getDraftById(drafts, draftId);

    setInputValueState(draft?.content || '');
  }, [draftId]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const setInputValue = useCallback(
    (newValue: SetStateAction<string>) => {
      setInputValueState((prev) => {
        const nextValue = typeof newValue === 'function' ? newValue(prev) : newValue;

        // Clear existing timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Debounce localStorage write
        debounceTimerRef.current = setTimeout(() => {
          const drafts = getDraftsFromStorage();

          if (nextValue) {
            const updatedDrafts = upsertDraft(drafts, draftId, nextValue);

            saveDraftsToStorage(updatedDrafts);
          } else {
            const updatedDrafts = removeDraft(drafts, draftId);

            saveDraftsToStorage(updatedDrafts);
          }
        }, DEBOUNCE_DELAY_MS);

        return nextValue;
      });
    },
    [draftId],
  );

  return {
    inputValue,
    setInputValue,
  };
};
