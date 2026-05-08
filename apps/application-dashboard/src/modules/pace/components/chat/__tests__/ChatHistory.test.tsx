import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ChatHistory from '@/modules/pace/components/chat/ChatHistory';
import type { FeedbackItemType, OpenFeedbackResponseType } from '@/types/api/feedbacks.types';

const mockUseGetConversationHistoryQuery = jest.fn();

jest.mock('@/apis/pace', () => ({
  useGetConversationHistoryQuery: (...args: unknown[]) => mockUseGetConversationHistoryQuery(...args),
}));

jest.mock('@/hooks/toolkit', () => ({
  useAppSelector: () => 'org-1',
}));

jest.mock('@/hooks', () => ({
  useDebounce: (value: string) => value,
}));

jest.mock('@zamp-platform/chat', () => ({
  ResourceType: { ORGANIZATION: 'organization' },
  unreadStore: { markRead: jest.fn(), markUnread: jest.fn() },
  useActiveStreamingIds: () => new Set<string>(),
  useInputsRequiredConversations: () => new Set<string>(),
  useRunningTasksConversations: () => new Set<string>(),
  useUnreadConversations: () => new Set<string>(),
}));

jest.mock('@zamp-platform/tanstack-table', () => ({
  useInfiniteScroll: () => ({ fetchMoreOnBottomReached: jest.fn() }),
}));

jest.mock('@zamp-platform/ui', () => ({
  Button: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>,
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock('@zamp-platform/ui/utils', () => ({
  cn: (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' '),
}));

jest.mock('lucide-react', () => ({
  MessageSquare: () => <svg data-testid='message-square-icon' />,
  Plus: () => <svg data-testid='plus-icon' />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@/components/commonWrapper', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('@/modules/pace/components/loaders/ChatHistorySkeleton', () => ({
  __esModule: true,
  default: () => <div data-testid='chat-history-skeleton' />,
}));

jest.mock('@/modules/team/components/EmptyStateListing', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock('@/modules/pace/components/chat/ChatHistoryItem', () => ({
  __esModule: true,
  default: ({ conversation }: { conversation: FeedbackItemType }) => (
    <div data-testid='chat-history-item'>{conversation.title}</div>
  ),
}));

const createConversation = (index: number): FeedbackItemType =>
  ({
    id: `conversation-${index}`,
    title: `Conversation ${index}`,
  }) as FeedbackItemType;

const mockConversationHistory = (
  totalCount: number,
  loadedCount = Math.min(totalCount, 5),
): OpenFeedbackResponseType => ({
  conversations: Array.from({ length: loadedCount }, (_, index) => createConversation(index + 1)),
  total_pages: Math.ceil(totalCount / 5),
  count: totalCount,
});

const renderRecentHistory = (response: OpenFeedbackResponseType) => {
  mockUseGetConversationHistoryQuery.mockReturnValue({
    data: response,
    isLoading: false,
    isError: false,
    isUninitialized: false,
    isFetching: false,
    refetch: jest.fn(),
  });

  render(<ChatHistory onSelectConversation={jest.fn()} recentLimit={5} viewMoreHref='/chat/history' />);
};

describe('ChatHistory recent mode', () => {
  beforeEach(() => {
    mockUseGetConversationHistoryQuery.mockReset();
  });

  it('does not show the older chats link when the total conversation count fits inside the recent limit', async () => {
    renderRecentHistory(mockConversationHistory(5));

    await waitFor(() => expect(screen.getAllByTestId('chat-history-item')).toHaveLength(5));

    expect(screen.queryByTestId('chat-history-view-more')).not.toBeInTheDocument();
  });

  it('shows the older chats link when there are more conversations than the recent limit', async () => {
    renderRecentHistory(mockConversationHistory(6));

    expect(await screen.findByTestId('chat-history-view-more')).toHaveAttribute('href', '/chat/history');
  });
});
