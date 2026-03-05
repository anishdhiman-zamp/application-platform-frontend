import { useCallback, useSyncExternalStore } from 'react';

import { streamingStateStore } from '../stores/streamingStateStore';
import { StreamingState } from '../types/chat.types';

/** Reads streaming state for a conversation from the global store via useSyncExternalStore. */
export function useStreamingState(conversationId: string | null): StreamingState | null {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!conversationId) return () => {};
      return streamingStateStore.subscribe(conversationId, onStoreChange);
    },
    [conversationId],
  );

  const getSnapshot = useCallback(() => {
    if (!conversationId) return null;
    return streamingStateStore.get(conversationId);
  }, [conversationId]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
