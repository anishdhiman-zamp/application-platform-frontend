import { StreamingState } from '../types/chat.types';

type Listener = () => void;

/** Global streaming state store keyed by conversation ID. Persists across route changes. */
class StreamingStateStore {
  private states = new Map<string, StreamingState>();
  private listeners = new Map<string, Set<Listener>>();
  private globalListeners = new Set<Listener>();
  private pendingNotifications = new Set<string>();
  private flushScheduled = false;

  get(conversationId: string): StreamingState | null {
    return this.states.get(conversationId) ?? null;
  }

  set(conversationId: string, state: StreamingState | null): void {
    if (state === null) {
      this.states.delete(conversationId);
    } else {
      this.states.set(conversationId, state);
    }
    this.scheduleNotify(conversationId);
  }

  update(conversationId: string, updater: (prev: StreamingState | null) => StreamingState | null): void {
    const prev = this.get(conversationId);
    const next = updater(prev);
    this.set(conversationId, next);
  }

  delete(conversationId: string): void {
    this.states.delete(conversationId);
    this.scheduleNotify(conversationId);
  }

  has(conversationId: string): boolean {
    return this.states.has(conversationId);
  }

  /** Subscribe to changes for a specific conversation. */
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

  /** Subscribe to changes across all conversations. */
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
    for (const listeners of this.listeners.values()) {
      for (const listener of listeners) {
        listener();
      }
    }
    for (const listener of this.globalListeners) {
      listener();
    }
  }

  /**
   * Batches notifications via microtask so multiple rapid store updates
   * (e.g. from SSE delta events) coalesce into a single listener flush,
   * preventing React's "Maximum update depth exceeded" error.
   */
  private scheduleNotify(conversationId: string): void {
    this.pendingNotifications.add(conversationId);
    if (!this.flushScheduled) {
      this.flushScheduled = true;
      queueMicrotask(() => this.flush());
    }
  }

  private flush(): void {
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
  }
}

export const streamingStateStore = new StreamingStateStore();
export type { StreamingStateStore };
