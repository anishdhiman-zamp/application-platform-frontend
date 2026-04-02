import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

export const getAutoLoopLockedConversations = (): Set<string> => {
  try {
    const stored = getFromLocalStorage(LOCAL_STORAGE_KEYS.PEV_LOCKED_CONVERSATIONS);

    if (!stored) return new Set();

    return new Set(JSON.parse(stored) as string[]);
  } catch {
    return new Set();
  }
};

export const addAutoLoopLockedConversation = (id: string) => {
  const locked = getAutoLoopLockedConversations();

  locked.add(id);
  setToLocalStorage(LOCAL_STORAGE_KEYS.PEV_LOCKED_CONVERSATIONS, JSON.stringify([...locked]));
};

export const isConversationAutoLoopLocked = (id: string | null): boolean => {
  if (!id) return false;

  return getAutoLoopLockedConversations().has(id);
};
