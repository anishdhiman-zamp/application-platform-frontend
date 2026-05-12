import type { TaskStatus } from '../types/block.types';

type Listener = () => void;

class TaskStatusStore {
  private statuses = new Map<string, TaskStatus>();
  private snapshot: ReadonlyMap<string, TaskStatus> = new Map();
  private listeners = new Set<Listener>();

  setStatus(taskId: string, status: TaskStatus): void {
    if (!taskId || !status) return;
    if (this.statuses.get(taskId) === status) return;

    this.statuses.set(taskId, status);
    this.snapshot = new Map(this.statuses);
    this.notify();
  }

  getSnapshot(): ReadonlyMap<string, TaskStatus> {
    return this.snapshot;
  }

  clear(): void {
    if (this.statuses.size === 0) return;

    this.statuses.clear();
    this.snapshot = new Map();
    this.notify();
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

export const taskStatusStore = new TaskStatusStore();
