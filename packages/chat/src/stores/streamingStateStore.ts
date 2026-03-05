import { StreamingState } from '../types/chat.types';

type Listener = () => void;

/** Global streaming state store keyed by conversation ID. Persists across route changes. */
class StreamingStateStore {
  private states = new Map<string, StreamingState>();
  private listeners = new Map<string, Set<Listener>>();
  private globalListeners = new Set<Listener>();

  get(conversationId: string): StreamingState | null {
    return this.states.get(conversationId) ?? null;
  }

  set(conversationId: string, state: StreamingState | null): void {
    if (state === null) {
      this.states.delete(conversationId);
    } else {
      this.states.set(conversationId, state);
    }
    this.notify(conversationId);
  }

  update(conversationId: string, updater: (prev: StreamingState | null) => StreamingState | null): void {
    const prev = this.get(conversationId);
    const next = updater(prev);
    this.set(conversationId, next);
  }

  delete(conversationId: string): void {
    this.states.delete(conversationId);
    this.notify(conversationId);
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

  private notify(conversationId: string): void {
    const listeners = this.listeners.get(conversationId);
    if (listeners) {
      for (const listener of listeners) {
        listener();
      }
    }
    for (const listener of this.globalListeners) {
      listener();
    }
  }
}

export const streamingStateStore = new StreamingStateStore();
export type { StreamingStateStore };
