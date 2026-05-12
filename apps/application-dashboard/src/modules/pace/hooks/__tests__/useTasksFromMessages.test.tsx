import { act, renderHook } from '@testing-library/react';
import {
  BLOCK_TYPE,
  type ChatMessage,
  ChatMessageType,
  ResourceType,
  SenderType,
  TASK_STATUS,
  taskStatusStore,
} from '@zamp-platform/chat';
import { useTasksFromMessages } from 'modules/pace/hooks/useTasksFromMessages';

const taskMessage = (status = TASK_STATUS.IN_PROGRESS): ChatMessage => ({
  id: 'message-1',
  conversation_id: 'conversation-1',
  resource_id: 'org-1',
  resource_type: ResourceType.ORGANIZATION,
  message_type: ChatMessageType.SYSTEM,
  sender_type: SenderType.ASSISTANT,
  sender_name: 'assistant',
  timestamp: '2026-05-11T00:00:00.000Z',
  metadata: {},
  message_content: {
    elements: [
      {
        id: 'task-block-1',
        type: BLOCK_TYPE.TASK,
        order: 0,
        payload: {
          id: 'task-block-1',
          title: 'Send test hydration DM to Anish',
          task_id: 'task-1',
          status,
        },
      },
    ],
  },
});

describe('useTasksFromMessages', () => {
  afterEach(() => {
    act(() => {
      taskStatusStore.clear();
    });
  });

  it('uses the latest task status when message task blocks are stale', () => {
    const messages = [taskMessage(TASK_STATUS.IN_PROGRESS)];

    const { result } = renderHook(() => useTasksFromMessages(messages));

    expect(result.current.counts[TASK_STATUS.IN_PROGRESS]).toBe(1);

    act(() => {
      taskStatusStore.setStatus('task-1', TASK_STATUS.COMPLETED);
    });

    expect(result.current.counts[TASK_STATUS.IN_PROGRESS]).toBe(0);
    expect(result.current.counts[TASK_STATUS.COMPLETED]).toBe(1);
    expect(result.current.tasks[0].status).toBe(TASK_STATUS.COMPLETED);
  });
});
