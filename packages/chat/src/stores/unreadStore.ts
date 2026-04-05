type Listener = () => void;

/** Tracks conversations with unread assistant messages. Marked unread on background MESSAGE_STOP, read when user opens the conversation. */
class UnreadStore {
  private unread = new Set<string>();
  private listeners = new Set<Listener>();

  /** Adds conversationId to unread set and plays a notification chime. No-op if already unread. */
  markUnread(conversationId: string): void {
    if (this.unread.has(conversationId)) return;
    this.unread.add(conversationId);
    this.playNotificationSound();
    this.notify();
  }

  /** Removes conversationId from unread set. No-op if already read. */
  markRead(conversationId: string): void {
    if (!this.unread.has(conversationId)) return;
    this.unread.delete(conversationId);
    this.notify();
  }

  has(conversationId: string): boolean {
    return this.unread.has(conversationId);
  }

  /** Returns a sorted snapshot — stable reference for useSyncExternalStore. */
  getSnapshot(): string[] {
    return Array.from(this.unread).sort();
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

  private playNotificationSound(): void {
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      // Two-tone chime: A5 → C6
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1047, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.25);

      setTimeout(() => ctx.close(), 300);
    } catch {
      // AudioContext unavailable in SSR or before first user interaction.
    }
  }
}

export const unreadStore = new UnreadStore();
