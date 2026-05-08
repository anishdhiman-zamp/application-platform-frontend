type Listener = () => void;

/**
 * Tracks per-conversation in-flight tasks. A conversation is "running" while
 * its task set is non-empty — used by the sidebar dot to stay blue after the
 * assistant message stream stops but a TASK block is still IN_PROGRESS.
 *
 * Maintains an inverse map (taskId → conversationId) so callers on the per-task
 * SSE channel can finish a task without already knowing which conversation owns it.
 */
class RunningTasksStore {
  private byConversation = new Map<string, Set<string>>();
  private taskToConversation = new Map<string, string>();
  private listeners = new Set<Listener>();

  markRunning(conversationId: string, taskId: string): void {
    if (!conversationId || !taskId) return;
    const existing = this.byConversation.get(conversationId);
    if (existing?.has(taskId)) return;
    if (existing) {
      existing.add(taskId);
    } else {
      this.byConversation.set(conversationId, new Set([taskId]));
    }
    this.taskToConversation.set(taskId, conversationId);
    this.notify();
  }

  markFinished(conversationId: string, taskId: string): void {
    if (!conversationId || !taskId) return;
    const existing = this.byConversation.get(conversationId);
    if (!existing || !existing.has(taskId)) return;
    existing.delete(taskId);
    if (existing.size === 0) {
      this.byConversation.delete(conversationId);
    }
    this.taskToConversation.delete(taskId);
    this.notify();
  }

  /** Finish a task when only the taskId is known (per-task SSE channel). */
  markFinishedByTaskId(taskId: string): void {
    if (!taskId) return;
    const conversationId = this.taskToConversation.get(taskId);
    if (!conversationId) return;
    this.markFinished(conversationId, taskId);
  }

  clearConversation(conversationId: string): void {
    const set = this.byConversation.get(conversationId);
    if (!set) return;
    for (const taskId of set) {
      this.taskToConversation.delete(taskId);
    }
    this.byConversation.delete(conversationId);
    this.notify();
  }

  has(conversationId: string): boolean {
    const set = this.byConversation.get(conversationId);
    return !!set && set.size > 0;
  }

  /** Returns a sorted snapshot of conversation IDs with ≥1 running task — stable reference for useSyncExternalStore. */
  getSnapshot(): string[] {
    return Array.from(this.byConversation.keys()).sort();
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

export const runningTasksStore = new RunningTasksStore();
