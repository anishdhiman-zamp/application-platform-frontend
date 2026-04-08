type Listener = () => void;

/**
 * Lightweight global store mapping conversationId → browser session ID.
 *
 * Written by ConversationProvider when the per-conversation SSE delivers a
 * browser_streaming_available event. Read by BrowserViewerTab (which renders
 * outside the ConversationProvider tree) to attach the session_id to the
 * noVNC proxy request.
 */
class BrowserSessionStore {
  private sessions = new Map<string, string>();
  private listeners = new Map<string, Set<Listener>>();

  get(conversationId: string): string | undefined {
    return this.sessions.get(conversationId);
  }

  set(conversationId: string, sessionId: string): void {
    this.sessions.set(conversationId, sessionId);
    this.notify(conversationId);
  }

  delete(conversationId: string): void {
    this.sessions.delete(conversationId);
    this.notify(conversationId);
  }

  subscribe(conversationId: string, listener: Listener): () => void {
    let set = this.listeners.get(conversationId);
    if (!set) {
      set = new Set();
      this.listeners.set(conversationId, set);
    }
    set.add(listener);

    return () => {
      set!.delete(listener);
      if (set!.size === 0) this.listeners.delete(conversationId);
    };
  }

  private notify(conversationId: string): void {
    const set = this.listeners.get(conversationId);
    if (set) {
      for (const fn of set) fn();
    }
  }
}

export const browserSessionStore = new BrowserSessionStore();
