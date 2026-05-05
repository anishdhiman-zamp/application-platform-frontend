type Listener = () => void;

/**
 * Tracks conversations with a pending HITL gate awaiting human input. Marked
 * pending on INPUT_REQUIRED SSE events; cleared on MESSAGE_START (assistant
 * resumed) or when the consumer calls markResolved after a successful response.
 */
class InputsRequiredStore {
  private pending = new Set<string>();
  private listeners = new Set<Listener>();

  markPending(conversationId: string): void {
    if (this.pending.has(conversationId)) return;
    this.pending.add(conversationId);
    this.notify();
  }

  markResolved(conversationId: string): void {
    if (!this.pending.has(conversationId)) return;
    this.pending.delete(conversationId);
    this.notify();
  }

  has(conversationId: string): boolean {
    return this.pending.has(conversationId);
  }

  /** Returns a sorted snapshot — stable reference for useSyncExternalStore. */
  getSnapshot(): string[] {
    return Array.from(this.pending).sort();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const inputsRequiredStore = new InputsRequiredStore();
