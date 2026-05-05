import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';

import { inputsRequiredStore } from '../stores/inputsRequiredStore';

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Returns the set of conversation IDs that have a pending HITL gate awaiting human input. */
export function useInputsRequiredConversations(): Set<string> {
  const cachedRef = useRef<string[]>([]);

  const subscribe = useCallback((onStoreChange: () => void) => {
    return inputsRequiredStore.subscribe(onStoreChange);
  }, []);

  const getSnapshot = useCallback(() => {
    const ids = inputsRequiredStore.getSnapshot();
    if (arraysEqual(cachedRef.current, ids)) {
      return cachedRef.current;
    }
    cachedRef.current = ids;
    return ids;
  }, []);

  const pendingIds = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(() => new Set(pendingIds), [pendingIds]);
}
