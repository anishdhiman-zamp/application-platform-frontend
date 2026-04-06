import { captureException } from '@sentry/browser';
import { streamingStateStore } from '@zamp-platform/chat';
import { toast } from 'sonner';

import { BACKGROUND_TASK_CALLBACKS, handleTaskSSEEvent } from '../handlers/taskEventHandler';
import { SSE_MAX_BACKOFF_MS, SSE_MAX_RETRIES } from '../types/sse.types';
import { type TaskEventCallbacks } from '../types/task-sse.types';
import { openSSEConnection, SSE_SOURCE_TYPE } from './openSSEConnection';

/** Exponential backoff: min(1000 * 2^attempt, 30000) + jitter(0-500ms) */
function getRetryDelay(retryCount: number): number {
  return Math.min(1000 * Math.pow(2, retryCount), SSE_MAX_BACKOFF_MS) + Math.random() * 500;
}

interface TaskRegistryEntry {
  controller: AbortController;
  callbacks: Set<TaskEventCallbacks>;
  organizationId: string | undefined;
  isAlive: boolean;
  retryCount: number;
  retryTimer: ReturnType<typeof setTimeout> | null;
  lastEventId: string | null;
}

/**
 * Global singleton owning SSE connections keyed by taskId.
 *
 * Task SSE stays open for the entire lifetime of the task tab.
 * Connection is only closed when the tab unmounts (deregister removes last callback).
 * message_stop does NOT close the connection — unlike conversations,
 * tasks keep the SSE open to receive subsequent streaming events.
 */
class TaskSSERegistry {
  private connections = new Map<string, TaskRegistryEntry>();

  /** Called by TaskProvider on mount. Reuses a live connection or opens a fresh one. */
  register(
    taskId: string,
    organizationId: string | undefined,
    streamingMessageId: string | null | undefined,
    callbacks: TaskEventCallbacks,
  ): void {
    const existing = this.connections.get(taskId);

    if (existing?.isAlive) {
      existing.callbacks.add(callbacks);
      return;
    }

    if (existing) {
      this.cancelRetry(existing);
      existing.controller.abort();
      this.connections.delete(taskId);
    }

    this.openConnection(taskId, organizationId, streamingMessageId, new Set([callbacks]));
  }

  /**
   * Called by TaskProvider on unmount.
   * Always closes the connection when no callbacks remain — tasks don't have background streaming.
   */
  deregister(taskId: string, callbacks: TaskEventCallbacks): void {
    const entry = this.connections.get(taskId);
    if (!entry) return;

    entry.callbacks.delete(callbacks);

    if (entry.callbacks.size === 0) {
      this.cancelRetry(entry);
      entry.controller.abort();
      this.connections.delete(taskId);
      // Clean up any stale streaming state
      streamingStateStore.delete(taskId);
    }
  }

  /** Returns true if a live connection exists for this task. */
  isConnected(taskId: string): boolean {
    const entry = this.connections.get(taskId);
    return entry?.isAlive === true;
  }

  /** Returns true if a TaskProvider is mounted for this task. */
  hasProvider(taskId: string): boolean {
    const entry = this.connections.get(taskId);
    return (entry?.callbacks.size ?? 0) > 0;
  }

  private openConnection(
    taskId: string,
    organizationId: string | undefined,
    streamingMessageId: string | null | undefined,
    callbackSet: Set<TaskEventCallbacks>,
    lastEventId?: string | null,
    retryCount = 0,
  ): void {
    const controller = new AbortController();

    const entry: TaskRegistryEntry = {
      controller,
      callbacks: callbackSet,
      organizationId,
      isAlive: true,
      retryCount,
      retryTimer: null,
      lastEventId: lastEventId ?? null,
    };
    this.connections.set(taskId, entry);

    openSSEConnection(
      SSE_SOURCE_TYPE.TASK,
      taskId,
      organizationId,
      false, // tasks never send Last-Event-Id: 0 — replay uses &message_id param
      streamingMessageId,
      controller.signal,
      (event, eventId) => {
        if (eventId) entry.lastEventId = eventId;

        const targets = entry.callbacks.size > 0 ? entry.callbacks : [BACKGROUND_TASK_CALLBACKS];
        for (const cb of targets) {
          try {
            handleTaskSSEEvent(taskId, event, cb);
          } catch (error) {
            captureException(error instanceof Error ? error : new Error(String(error)));
          }
        }
      },
      () => {
        // onOpen — connection succeeded, reset retry count
        entry.retryCount = 0;
      },
      () => {
        // onDead — connection died
        const current = this.connections.get(taskId);
        if (current !== entry) return;
        current.isAlive = false;
        this.scheduleRetry(taskId, entry);
      },
      lastEventId,
    );
  }

  /** Schedules a reconnection attempt or gives up after SSE_MAX_RETRIES. */
  private scheduleRetry(taskId: string, entry: TaskRegistryEntry): void {
    if (entry.callbacks.size === 0) return;

    if (entry.retryCount >= SSE_MAX_RETRIES) {
      // Persistent failure after all retries — this is worth reporting to Sentry.
      captureException(new Error(`SSE task connection failed after ${SSE_MAX_RETRIES} retries`), {
        extra: { taskId },
      });
      toast.error('Unable to connect. Please check your internet connection and try again.');
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
      const current = this.connections.get(taskId);
      if (current !== entry) return;
      if (entry.callbacks.size === 0) return;

      entry.controller.abort();

      this.openConnection(taskId, entry.organizationId, null, entry.callbacks, entry.lastEventId, entry.retryCount);
    }, delay);
  }

  private cancelRetry(entry: TaskRegistryEntry): void {
    if (entry.retryTimer !== null) {
      clearTimeout(entry.retryTimer);
      entry.retryTimer = null;
    }
  }
}

export const taskSSERegistry = new TaskSSERegistry();
