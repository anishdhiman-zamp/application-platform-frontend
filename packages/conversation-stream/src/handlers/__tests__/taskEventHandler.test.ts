import { TaskSSEEventType } from '../../types/task-sse.types';

const mockStreamingState = {
  resource_type: 'ORGANIZATION',
  resource_id: 'org-1',
  conversation_id: 'task-1',
  id: 'message-1',
  message_content: {
    elements: [
      {
        id: 'tool-use-1',
        type: 'tool_use',
        order: 0,
        is_complete: true,
        payload: { tool_call_id: 'tool-call-1' },
      },
      {
        id: 'tool-result-1',
        type: 'tool_result',
        order: 1,
        is_complete: false,
        payload: { content: '', is_error: false, tool_call_id: 'tool-call-1' },
      },
    ],
  },
  message_type: 'SYSTEM',
  sender_type: 'ASSISTANT',
  sender_name: 'assistant',
  timestamp: '2026-05-11T00:00:00.000Z',
  metadata: {},
  is_active: true,
};

const mockStreamingStateStore = {
  get: jest.fn(() => mockStreamingState),
  set: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
};

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { error: jest.fn() },
}));

jest.mock('@zamp-platform/chat', () => ({
  ChatMessageType: { SYSTEM: 'SYSTEM' },
  ResourceType: { ORGANIZATION: 'ORGANIZATION' },
  SenderType: { ASSISTANT: 'ASSISTANT' },
  TASK_STATUS: {
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELED: 'CANCELED',
    IN_PROGRESS: 'IN_PROGRESS',
  },
  runningTasksStore: {
    markFinishedByTaskId: jest.fn(),
  },
  streamingStateStore: mockStreamingStateStore,
}));

import { handleTaskSSEEvent } from '../taskEventHandler';

describe('handleTaskSSEEvent', () => {
  it('finalizes incomplete blocks before moving a stopped task stream into messages', () => {
    const onMessageStop = jest.fn();

    handleTaskSSEEvent('task-1', { type: TaskSSEEventType.MESSAGE_STOP }, { onMessageStop });

    expect(onMessageStop).toHaveBeenCalledWith(
      expect.objectContaining({
        message_content: {
          elements: [expect.objectContaining({ is_complete: true }), expect.objectContaining({ is_complete: true })],
        },
      }),
      'task-1',
    );
    expect(mockStreamingStateStore.delete).toHaveBeenCalledWith('task-1');
  });
});
