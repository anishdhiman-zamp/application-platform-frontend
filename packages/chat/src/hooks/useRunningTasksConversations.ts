import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';

import { runningTasksStore } from '../stores/runningTasksStore';

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Returns the set of conversation IDs that have ≥1 task currently in progress. */
export function useRunningTasksConversations(): Set<string> {
  const cachedRef = useRef<string[]>([]);

  const subscribe = useCallback((onStoreChange: () => void) => {
    return runningTasksStore.subscribe(onStoreChange);
  }, []);

  const getSnapshot = useCallback(() => {
    const ids = runningTasksStore.getSnapshot();
    if (arraysEqual(cachedRef.current, ids)) {
      return cachedRef.current;
    }
    cachedRef.current = ids;
    return ids;
  }, []);

  const runningIds = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(() => new Set(runningIds), [runningIds]);
}
