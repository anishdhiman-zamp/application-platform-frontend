type Listener = () => void;

export type BrowserSessionStatus = 'active' | 'ended';

export interface BrowserSessionState {
  sessionId: string;
  status: BrowserSessionStatus;
}

/**
 * Lightweight global store mapping conversationId → browser session state.
 *
 * Written by ConversationProvider when the per-conversation SSE delivers a
 * browser_streaming_available / browser_streaming_unavailable event.
 * Read by BrowserViewerTab (which renders outside the ConversationProvider tree)
 * to attach the session_id to the noVNC proxy request and to show the correct
 * UI state when streaming ends.
 */
class BrowserSessionStore {
  private sessions = new Map<string, BrowserSessionState>();
  private listeners = new Map<string, Set<Listener>>();

  get(conversationId: string): BrowserSessionState | undefined {
    return this.sessions.get(conversationId);
  }

  set(conversationId: string, sessionId: string): void {
    this.sessions.set(conversationId, { sessionId, status: 'active' });
    this.notify(conversationId);
  }

  markEnded(conversationId: string): void {
    const existing = this.sessions.get(conversationId);
    if (existing) {
      this.sessions.set(conversationId, { ...existing, status: 'ended' });
    } else {
      this.sessions.set(conversationId, { sessionId: '', status: 'ended' });
    }
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
