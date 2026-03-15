import { useMemo } from 'react';
import {
  type Block,
  BLOCK_TYPE,
  type ChatMessage,
  type StreamingState,
  TASK_STATUS,
  type TaskBlockType,
  type TaskStatus,
} from '@zamp-platform/chat';

export interface TaskItem {
  id: string;
  title: string;
  task_id: string;
  status: TaskStatus;
  blockId: string;
}

export type TaskCountsByStatus = Record<TaskStatus, number>;

function extractTasksFromElements(elements: Block[], taskMap: Map<string, TaskItem>) {
  for (const element of elements) {
    if (element?.type === BLOCK_TYPE.TASK) {
      const taskBlock = element as TaskBlockType;
      const key = taskBlock.payload.task_id ?? taskBlock.id;

      taskMap.set(key, {
        id: taskBlock.payload.id,
        title: taskBlock.payload.title,
        task_id: taskBlock.payload.task_id,
        status: taskBlock.payload.status ?? TASK_STATUS.IN_PROGRESS,
        blockId: taskBlock.id,
      });
    }
  }
}

export function useTasksFromMessages(messages: ChatMessage[], streamingState?: StreamingState | null) {
  return useMemo(() => {
    const taskMap = new Map<string, TaskItem>();

    for (const message of messages) {
      extractTasksFromElements(message?.message_content?.elements ?? [], taskMap);
    }

    if (streamingState?.is_active) {
      extractTasksFromElements(streamingState?.message_content?.elements ?? [], taskMap);
    }

    const tasks = Array.from(taskMap.values());

    const counts: TaskCountsByStatus = {
      [TASK_STATUS.COMPLETED]: 0,
      [TASK_STATUS.IN_PROGRESS]: 0,
      [TASK_STATUS.FAILED]: 0,
      [TASK_STATUS.NEEDS_INPUT]: 0,
    };

    for (const task of tasks) {
      if (task.status in counts) counts[task.status]++;
    }

    const hasTasks = tasks.length > 0;

    return { tasks, counts, hasTasks };
  }, [messages, streamingState]);
}
