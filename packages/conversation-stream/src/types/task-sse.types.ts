import type { ChatMessage } from '@zamp-platform/chat';

/**
 * Event types for the per-task SSE channel.
 * Content block events are identical to conversation channel.
 * Task-specific events use `event_type` field to distinguish.
 */
export const enum TaskSSEEventType {
  INIT_STREAM = 'init-stream',
  KEEPALIVE = 'keepalive',
  MESSAGE_START = 'message_start',
  MESSAGE_STOP = 'message_stop',
  CONTENT_BLOCK_START = 'content_block_start',
  CONTENT_BLOCK_DELTA = 'content_block_delta',
  CONTENT_BLOCK_STOP = 'content_block_stop',
  TASK = 'task',
  TASK_UPDATE = 'task_update',
  INPUT_REQUIRED = 'input_required',
}

export interface TaskEventCallbacks {
  onMessageStop: (finalMessage: ChatMessage | null, taskId: string) => void;
  onTaskUpdate?: (taskId: string, updatedFields: Record<string, unknown>) => void;
  onInputRequired?: (taskId: string, data: unknown) => void;
  /** Invoked when the SSE connection is lost and all retry attempts have been exhausted. */
  onDisconnected?: () => void;
}
