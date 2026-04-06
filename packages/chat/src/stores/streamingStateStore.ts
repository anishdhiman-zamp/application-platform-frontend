import { StreamingState } from '../types/chat.types';

type Listener = () => void;

/** Global streaming state store keyed by conversation ID. Persists across route changes. */
class StreamingStateStore {
  private states = new Map<string, StreamingState>();
  private listeners = new Map<string, Set<Listener>>();
  private globalListeners = new Set<Listener>();
  private pendingNotifications = new Set<string>();
  private flushScheduled = false;
  private drafts = new Map<string, StreamingState>();
  private rafScheduled = new Set<string>();

  /** Prefers the unflushed draft so callers always see the latest content even before the RAF flush. */
  get(conversationId: string): StreamingState | null {
    return this.drafts.get(conversationId) ?? this.states.get(conversationId) ?? null;
  }

  set(conversationId: string, state: StreamingState | null): void {
    if (state === null) {
      this.states.delete(conversationId);
    } else {
      this.states.set(conversationId, state);
    }
    this.drafts.delete(conversationId);
    this.scheduleNotify(conversationId);
  }

  update(conversationId: string, updater: (prev: StreamingState | null) => StreamingState | null): void {
    const prev = this.get(conversationId);
    const next = updater(prev);
    this.set(conversationId, next);
  }

  /** Flushes any pending draft before deleting so callers reading via get() see the complete final state. */
  delete(conversationId: string): void {
    const draft = this.drafts.get(conversationId);
    if (draft) {
      this.states.set(conversationId, draft);
    }
    this.states.delete(conversationId);
    this.drafts.delete(conversationId);
    this.rafScheduled.delete(conversationId);
    this.scheduleNotify(conversationId);
  }

  has(conversationId: string): boolean {
    return this.states.has(conversationId);
  }

  /** Subscribe to state changes for a specific conversation. Returns an unsubscribe function. */
  subscribe(conversationId: string, listener: Listener): () => void {
    let listeners = this.listeners.get(conversationId);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(conversationId, listeners);
    }
    listeners.add(listener);

    return () => {
      listeners!.delete(listener);
      if (listeners!.size === 0) {
        this.listeners.delete(conversationId);
      }
    };
  }

  /** Subscribe to state changes across all conversations. Returns an unsubscribe function. */
  subscribeAll(listener: Listener): () => void {
    this.globalListeners.add(listener);
    return () => {
      this.globalListeners.delete(listener);
    };
  }

  getActiveStreamingConversationIds(): string[] {
    const ids: string[] = [];
    for (const [id, state] of this.states) {
      if (state.is_active) {
        ids.push(id);
      }
    }
    return ids;
  }

  clear(): void {
    this.states.clear();
    const allConversationIds = Array.from(this.listeners.keys());
    for (const id of allConversationIds) {
      this.scheduleNotify(id);
    }
    if (allConversationIds.length === 0 && this.globalListeners.size > 0) {
      for (const listener of this.globalListeners) {
        listener();
      }
    }
  }

  /**
   * High-frequency write path for content_block_delta events.
   * Mutates a draft in-place and flushes it once per RAF frame — one React
   * notification per frame instead of one per SSE chunk.
   */
  bufferDelta(conversationId: string, updater: (draft: StreamingState) => void): void {
    let draft = this.drafts.get(conversationId);
    if (!draft) {
      const current = this.states.get(conversationId);
      if (!current) return;
      draft = structuredClone(current);
      this.drafts.set(conversationId, draft);
    }
    updater(draft);
    this.scheduleRAFFlush(conversationId);
  }

  private scheduleRAFFlush(conversationId: string): void {
    if (this.rafScheduled.has(conversationId)) return;
    this.rafScheduled.add(conversationId);
    requestAnimationFrame(() => {
      this.rafScheduled.delete(conversationId);
      const draft = this.drafts.get(conversationId);
      if (draft) {
        this.states.set(conversationId, draft);
        this.drafts.delete(conversationId);
        this.scheduleNotify(conversationId);
      }
    });
  }

  private isFlushing = false;

  /** Batches notifications via microtask. Re-entrant writes are deferred to prevent update-depth cascades. */
  private scheduleNotify(conversationId: string): void {
    if (this.isFlushing) {
      Promise.resolve().then(() => this.scheduleNotify(conversationId));
      return;
    }

    this.pendingNotifications.add(conversationId);

    if (!this.flushScheduled) {
      this.flushScheduled = true;
      queueMicrotask(() => this.flush());
    }
  }

  private flush(): void {
    if (this.isFlushing) return;
    this.isFlushing = true;

    try {
      const conversationIds = Array.from(this.pendingNotifications);
      this.pendingNotifications.clear();
      this.flushScheduled = false;

      for (const conversationId of conversationIds) {
        const listeners = this.listeners.get(conversationId);
        if (listeners) {
          for (const listener of listeners) {
            listener();
          }
        }
      }

      if (conversationIds.length > 0 && this.globalListeners.size > 0) {
        for (const listener of this.globalListeners) {
          listener();
        }
      }
    } finally {
      this.isFlushing = false;
    }
  }
}

export const streamingStateStore = new StreamingStateStore();
export type { StreamingStateStore };
