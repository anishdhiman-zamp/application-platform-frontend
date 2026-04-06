import { captureException } from '@sentry/browser';
import { streamingStateStore } from '@zamp-platform/chat';
import { toast } from 'sonner';

import { type ConversationEventCallbacks, handleConversationSSEEvent } from '../handlers/conversationEventHandler';
import { SSE_MAX_BACKOFF_MS, SSE_MAX_RETRIES } from '../types/sse.types';
import { openSSEConnection, SSE_SOURCE_TYPE } from './openSSEConnection';

/** Exponential backoff: min(1000 * 2^attempt, 30000) + jitter(0-500ms) */
function getRetryDelay(retryCount: number): number {
  return Math.min(1000 * Math.pow(2, retryCount), SSE_MAX_BACKOFF_MS) + Math.random() * 500;
}

// No-op callbacks used when no ConversationProvider is mounted.
// Ensures store-mutating events (MESSAGE_STOP, MESSAGE_START, content blocks)
// still fire even in background — without triggering any UI updates.
const BACKGROUND_CALLBACKS: ConversationEventCallbacks = {
  onTitleUpdated: () => {},
  onMessageStop: () => {},
};

interface RegistryEntry {
  controller: AbortController;
  callbacks: Set<ConversationEventCallbacks>; // all mounted ConversationProviders for this conversation
  organizationId: string | undefined;
  isAlive: boolean; // false after onerror/onclose; next register() opens a fresh connection
  retryCount: number;
  retryTimer: ReturnType<typeof setTimeout> | null;
  lastEventId: string | null;
}

/**
 * Global singleton owning SSE connections keyed by conversationId.
 *
 * deregister() + is_active=true  → keep connection alive in background
 * deregister() + is_active=false → close immediately
 * closeConnection() + no provider → close immediately (background stream done)
 * closeConnection() + provider mounted → keep open until provider unmounts
 *
 * On network blip (onDead), automatically retries up to SSE_MAX_RETRIES times
 * with exponential backoff while a provider is mounted. After exhausting
 * retries, invokes onDisconnected on all mounted callbacks.
 */
class ConversationSSERegistry {
  private connections = new Map<string, RegistryEntry>();

  /** Called by ConversationProvider on mount. Reuses a live connection or opens a fresh one. */
  register(
    conversationId: string,
    organizationId: string | undefined,
    isNewConversation: boolean,
    streamingMessageId: string | null | undefined,
    callbacks: ConversationEventCallbacks,
  ): void {
    const existing = this.connections.get(conversationId);

    if (existing?.isAlive) {
      existing.callbacks.add(callbacks);
      return;
    }

    if (existing) {
      // dead or retrying entry — clean up before opening fresh
      this.cancelRetry(existing);
      existing.controller.abort();
      this.connections.delete(conversationId);
    }

    this.openConnection(conversationId, organizationId, isNewConversation, streamingMessageId, new Set([callbacks]));
  }

  /**
   * Called by ConversationProvider on unmount.
   * Keeps the connection alive if streaming is still active; closes it otherwise.
   */
  deregister(conversationId: string, callbacks: ConversationEventCallbacks): void {
    const entry = this.connections.get(conversationId);
    if (!entry) return;

    entry.callbacks.delete(callbacks);

    const isActive = streamingStateStore.get(conversationId)?.is_active === true;
    if (!isActive) {
      this.closeConnection(conversationId);
    }
    // If still active, conversationEventHandler calls closeConnection after MESSAGE_STOP.
  }

  /**
   * Called by conversationEventHandler after MESSAGE_STOP.
   * Background connections (no mounted provider) are closed immediately.
   * Foreground connections stay open for the next user message; closed on unmount.
   */
  closeConnection(conversationId: string): void {
    const entry = this.connections.get(conversationId);
    if (!entry) return;

    if (entry.callbacks.size === 0) {
      this.cancelRetry(entry);
      entry.controller.abort();
      this.connections.delete(conversationId);
    }
    // callbacks.size > 0 → provider is mounted, keep alive until unmount
  }

  /** Returns true if a live connection exists. Used to skip redundant history refetches. */
  isConnected(conversationId: string): boolean {
    const entry = this.connections.get(conversationId);
    return entry?.isAlive === true;
  }

  /** Returns true if a ConversationProvider is mounted for this conversation. */
  hasProvider(conversationId: string): boolean {
    const entry = this.connections.get(conversationId);
    return (entry?.callbacks.size ?? 0) > 0;
  }

  private backgroundStopListeners = new Set<(conversationId: string) => void>();

  /** Register a callback invoked when a background stream completes (no provider mounted). Returns a cleanup function. */
  setOnBackgroundStop(cb: (conversationId: string) => void): () => void {
    this.backgroundStopListeners.add(cb);
    return () => this.backgroundStopListeners.delete(cb);
  }

  /** Called by conversationEventHandler on background MESSAGE_STOP. */
  notifyBackgroundStop(conversationId: string): void {
    for (const cb of this.backgroundStopListeners) cb(conversationId);
  }

  /**
   * Opens an SSE connection and wires up event routing, lastEventId tracking,
   * and the onDead → retry cycle.
   */
  private openConnection(
    conversationId: string,
    organizationId: string | undefined,
    isNewConversation: boolean,
    streamingMessageId: string | null | undefined,
    callbackSet: Set<ConversationEventCallbacks>,
    lastEventId?: string | null,
    retryCount = 0,
  ): void {
    const controller = new AbortController();

    const entry: RegistryEntry = {
      controller,
      callbacks: callbackSet,
      organizationId,
      isAlive: true,
      retryCount,
      retryTimer: null,
      lastEventId: lastEventId ?? null,
    };
    this.connections.set(conversationId, entry);

    openSSEConnection(
      SSE_SOURCE_TYPE.CONVERSATION,
      conversationId,
      organizationId,
      isNewConversation,
      streamingMessageId,
      controller.signal,
      (event, eventId) => {
        // Track the last event ID for reconnection resumption
        if (eventId) entry.lastEventId = eventId;

        const targets = entry.callbacks.size > 0 ? entry.callbacks : [BACKGROUND_CALLBACKS];
        for (const cb of targets) {
          try {
            handleConversationSSEEvent(conversationId, event, cb);
          } catch (error) {
            console.error('Error handling conversation SSE event', error);
          }
        }
      },
      () => {
        // onOpen — connection succeeded, reset retry count
        entry.retryCount = 0;
      },
      () => {
        // onDead — connection died
        const current = this.connections.get(conversationId);
        if (current !== entry) return;
        current.isAlive = false;
        this.scheduleRetry(conversationId, entry);
      },
      lastEventId,
    );
  }

  /** Schedules a reconnection attempt or gives up after SSE_MAX_RETRIES. */
  private scheduleRetry(conversationId: string, entry: RegistryEntry): void {
    // No provider mounted — no point retrying
    if (entry.callbacks.size === 0) return;

    if (entry.retryCount >= SSE_MAX_RETRIES) {
      // Persistent failure after all retries — this is worth reporting to Sentry.
      captureException(new Error(`SSE conversation connection failed after ${SSE_MAX_RETRIES} retries`), {
        extra: { conversationId },
      });
      toast.error('Unable to connect. Please check your internet connection and try again.');
      // Notify all providers
      for (const cb of entry.callbacks) {
        try {
          cb.onDisconnected?.();
        } catch (error) {
          captureException(error instanceof Error ? error : new Error(String(error)));
        }
      }
      return;
    }

    const delay = getRetryDelay(entry.retryCount);
    entry.retryCount++;

    entry.retryTimer = setTimeout(() => {
      entry.retryTimer = null;
      const current = this.connections.get(conversationId);
      if (current !== entry) return; // entry replaced by a fresh register()
      if (entry.callbacks.size === 0) return; // provider unmounted while waiting

      // Abort the old controller before opening a fresh connection
      entry.controller.abort();

      // Re-open with the same callback set, last event ID, and current retry count
      this.openConnection(
        conversationId,
        entry.organizationId,
        false, // not a new conversation on reconnect
        null, // no specific message ID on reconnect
        entry.callbacks,
        entry.lastEventId,
        entry.retryCount,
      );
    }, delay);
  }

  private cancelRetry(entry: RegistryEntry): void {
    if (entry.retryTimer !== null) {
      clearTimeout(entry.retryTimer);
      entry.retryTimer = null;
    }
  }
}

export const conversationSSERegistry = new ConversationSSERegistry();
