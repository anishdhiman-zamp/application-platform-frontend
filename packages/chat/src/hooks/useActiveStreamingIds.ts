import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';

import { streamingStateStore } from '../stores/streamingStateStore';

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Returns the set of conversation IDs with active streams. */
export function useActiveStreamingIds(): Set<string> {
  const cachedRef = useRef<string[]>([]);

  const subscribe = useCallback((onStoreChange: () => void) => {
    return streamingStateStore.subscribeAll(onStoreChange);
  }, []);

  const getSnapshot = useCallback(() => {
    const ids = streamingStateStore.getActiveStreamingConversationIds();
    if (arraysEqual(cachedRef.current, ids)) {
      return cachedRef.current;
    }
    cachedRef.current = ids;
    return ids;
  }, []);

  const activeIds = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(() => new Set(activeIds), [activeIds]);
}
