import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';

import { unreadStore } from '../stores/unreadStore';

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Returns the set of conversation IDs with unread messages. */
export function useUnreadConversations(): Set<string> {
  const cachedRef = useRef<string[]>([]);

  const subscribe = useCallback((onStoreChange: () => void) => {
    return unreadStore.subscribe(onStoreChange);
  }, []);

  const getSnapshot = useCallback(() => {
    const ids = unreadStore.getSnapshot();
    if (arraysEqual(cachedRef.current, ids)) {
      return cachedRef.current;
    }
    cachedRef.current = ids;
    return ids;
  }, []);

  const unreadIds = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(() => new Set(unreadIds), [unreadIds]);
}
