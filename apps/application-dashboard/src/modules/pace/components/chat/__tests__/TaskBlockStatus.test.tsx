import { render, screen } from '@testing-library/react';
import TaskBlock from '@zamp-platform/chat/src/components/blocks/TaskBlock';
import { TASK_STATUS, type TaskBlockType } from '@zamp-platform/chat/src/types/block.types';

const mockUseChat = jest.fn();
const mockUseChatActions = jest.fn();

jest.mock('@zamp-platform/chat/src/hooks/useChat', () => ({
  useChat: () => mockUseChat(),
}));

jest.mock('@zamp-platform/chat/src/context/ChatActionsContext', () => ({
  useChatActions: () => mockUseChatActions(),
}));

jest.mock('@/constants/routeConfig', () => ({ getChatTaskRoute: jest.fn(() => '/chat/task') }));
jest.mock('@/hooks/toolkit', () => ({ useAppSelector: jest.fn(() => 'org-1') }));
jest.mock('@/modules/pace/pace.utils', () => ({ preserveSidebarParam: (route: string) => route }));

jest.mock('motion/react', () => {
  const React = jest.requireActual('react');

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    },
  };
});

describe('TaskBlock status rendering', () => {
  beforeEach(() => {
    mockUseChat.mockReturnValue({
      isLoadingConversationHistory: false,
      messages: [],
      streamingState: undefined,
      conversationData: { status: TASK_STATUS.COMPLETED },
    });
    mockUseChatActions.mockReturnValue({
      onTaskOpen: jest.fn(),
      parentTasks: [],
      siblings: [],
      taskSummaries: {},
    });
  });

  it('uses the fetched task status when the chat task block payload is stale', () => {
    const payload: TaskBlockType['payload'] = {
      id: 'task-block-1',
      title: 'Send test hydration DM to Anish',
      task_id: 'task-1',
      status: TASK_STATUS.IN_PROGRESS,
    };

    const { container } = render(<TaskBlock payload={payload} conversationId='conversation-1' />);

    expect(screen.getByText('Send test hydration DM to Anish')).toBeTruthy();
    expect(screen.queryByText('Starting now')).toBeNull();
    expect(container.querySelector('.animate-spin')).toBeNull();
  });

  it('renders task blocks in the same compact row format as agent blocks', () => {
    mockUseChat.mockReturnValue({
      isLoadingConversationHistory: false,
      messages: [],
      streamingState: undefined,
      conversationData: { status: TASK_STATUS.IN_PROGRESS },
    });

    const payload: TaskBlockType['payload'] = {
      id: 'task-block-2',
      title: 'Write a markdown document',
      task_id: 'task-2',
      status: TASK_STATUS.COMPLETED,
    };

    const { container } = render(<TaskBlock payload={payload} conversationId='conversation-1' />);
    const taskName = screen.getByText('Write a markdown document');
    const taskBlock = taskName.closest('[role="button"]');
    const nameGroup = taskName.parentElement;
    const inlineArrow = nameGroup?.querySelector('svg.lucide-arrow-up-right');
    const activityIndicator = container.querySelector('[data-task-block-activity-indicator]');

    expect(taskBlock).toHaveClass('group/task-block');
    expect(taskBlock).toHaveClass('h-[52px]');
    expect(container.querySelector('svg.lucide-activity')).toBeInTheDocument();
    expect(inlineArrow).toBeInTheDocument();
    expect(inlineArrow).toHaveClass('opacity-0');
    expect(inlineArrow).toHaveClass('group-hover/task-block:opacity-100');
    expect(activityIndicator?.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Starting now')).toBeNull();
  });
});
