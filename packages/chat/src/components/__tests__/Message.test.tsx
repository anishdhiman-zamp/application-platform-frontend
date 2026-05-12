import { render, screen } from '@testing-library/react';

import { BLOCK_TYPE } from '../../types/block.types';
import { ChatMessage, ChatMessageType, ResourceType, SenderType } from '../../types/chat.types';
import Message from '../Message';

jest.mock('@zamp-platform/ui', () => ({
  useScrollRef: () => ({ current: null }),
}));

jest.mock('motion/react', () => ({
  motion: {
    div: ({
      animate,
      children,
      initial,
      transition,
      ...props
    }: React.ComponentProps<'div'> & { animate?: unknown; initial?: unknown; transition?: unknown }) => {
      void animate;
      void initial;
      void transition;

      return <div {...props}>{children}</div>;
    },
  },
}));

jest.mock('../BlockRenderer', () => ({
  BlockRenderer: ({ className }: { className?: string }) => <div className={className} data-testid='block-renderer' />,
}));

jest.mock('../ChatFeedback', () => ({
  __esModule: true,
  default: () => <div data-testid='chat-feedback' />,
}));

jest.mock('../CopyMessageButton', () => ({
  __esModule: true,
  default: () => <button type='button'>Copy</button>,
}));

jest.mock('../MessageTimestamp', () => ({
  __esModule: true,
  default: () => <span data-testid='message-timestamp' />,
}));

class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

describe('Message', () => {
  const userMessage: ChatMessage = {
    id: 'message-1',
    conversation_id: 'conversation-1',
    resource_type: ResourceType.PROCESS,
    resource_id: 'process-1',
    message_type: ChatMessageType.TEXT,
    sender_type: SenderType.USER,
    metadata: {},
    timestamp: '2026-05-12T08:00:00.000Z',
    message_content: {
      elements: [
        {
          id: 'block-1',
          order: 1,
          type: BLOCK_TYPE.MARKDOWN,
          payload: {
            text: 'Summarize this document',
          },
        },
      ],
    },
  };

  it('uses compact padding around user message content', () => {
    render(<Message message={userMessage} />);

    const blockRenderer = screen.getByTestId('block-renderer');
    const bubble = blockRenderer.parentElement?.parentElement;
    const bubbleClassName = bubble?.className ?? '';

    expect(bubbleClassName).toContain('px-3');
    expect(bubbleClassName).toContain('py-2');
    expect(bubbleClassName).not.toContain('px-4');
    expect(bubbleClassName).not.toContain('py-3');
  });
});
