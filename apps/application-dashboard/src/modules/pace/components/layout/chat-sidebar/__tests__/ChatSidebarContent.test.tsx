import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatSidebarContent from '@/modules/pace/components/layout/chat-sidebar/ChatSidebarContent';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';

const mockSubscribe = jest.fn(() => ({ unsubscribe: jest.fn() }));
const mockRefetchConversationHistory = jest.fn();

jest.mock('@zamp-platform/chat', () => ({
  ChatActionsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropOverlay: () => null,
  HITLEntityType: { CONVERSATION: 'conversation' },
  HITLQuestionsBlock: () => null,
  QueuedMessages: () => null,
  ResourceType: { ORGANIZATION: 'organization' },
  ScopeType: { ORGANIZATION: 'organization' },
  useFileDragDrop: () => ({ isDragOver: false, dropZoneProps: {} }),
}));

jest.mock('@zamp-platform/conversation-stream', () => ({
  ConnectedChatInput: () => <div data-testid='chat-input' />,
  useConversationActions: () => ({
    refetchConversationHistory: mockRefetchConversationHistory,
  }),
  useConversationInputState: () => ({
    inputsRequired: [],
    initiatedBy: null,
  }),
  useConversationMessagesState: () => ({
    queuedMessages: [],
  }),
  useConversationStatusState: () => ({
    isLoadingConversationHistory: false,
    isFetchingConversationHistory: false,
  }),
}));

jest.mock('@zamp-platform/ui/utils', () => ({
  cn: (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' '),
}));

jest.mock('@zamp-platform/utils/event-bus', () => ({
  EVENT_TYPE: {
    INPUT_REQUIRED: 'INPUT_REQUIRED',
    COMPONENT: 'COMPONENT',
  },
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/chat',
}));

jest.mock('@/app/_providers/sse-provider', () => ({
  useEventBus: () => ({
    sseEventBus: {
      subscribe: mockSubscribe,
    },
  }),
}));

jest.mock('@/hooks/useResourceAccess', () => ({
  useResourceAccess: () => ({
    checkUserPrivilege: () => false,
  }),
}));

jest.mock('@/modules/pace/components/chat/ChatHome', () => ({
  __esModule: true,
  default: () => <div data-testid='chat-home' />,
}));

jest.mock('@/modules/pace/components/chat/ChatTopbar', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <div data-testid='chat-topbar'>{title}</div>,
}));

jest.mock('@/modules/pace/components/chat/ModelSelector', () => ({
  __esModule: true,
  default: () => <div data-testid='model-selector' />,
}));

jest.mock('@/modules/pace/components/dynamic-tabs/useDynamicTabs', () => ({
  useDynamicTabs: () => ({
    activeTab: {
      id: 'docs/xyz.md',
      name: 'xyz.md',
      path: '/chat?f=docs%2Fxyz.md',
      type: TAB_TYPE.FILE,
    },
    openTab: jest.fn(),
    openSingleTab: jest.fn(),
    openSingleBrowserTab: jest.fn(),
    updateTab: jest.fn(),
  }),
}));

jest.mock('@/modules/pace/components/layout/chat-sidebar/ChatConversationContent', () => ({
  __esModule: true,
  default: ({ emptyState }: { emptyState?: React.ReactNode }) => (
    <div data-testid='conversation-content'>{emptyState}</div>
  ),
}));

jest.mock('@/modules/pace/components/tasks/constants/tasks.constants', () => ({
  HITL_RESPONDED_EVENT: 'hitl-responded',
}));

jest.mock('@/modules/pace/hooks/useChatDraftInput', () => ({
  useChatDraftInput: () => ({ inputValue: "Let's discuss xyz.md", setInputValue: jest.fn() }),
}));

jest.mock('@/modules/pace/hooks/useHitlQuestions', () => ({
  useHitlQuestions: () => ({ hitlQuestions: [], hitlQuestionsKey: 'questions' }),
}));

jest.mock('@/modules/pace/hooks/useReferencePicker', () => ({
  useReferencePicker: () => null,
}));

jest.mock('@/modules/pace/pace.context', () => ({
  usePaceConversationContext: () => ({
    activeAgentInfo: null,
    activeFileInfo: { path: 'docs/xyz.md', name: 'xyz.md' },
    selectedModel: 'gpt-test',
    setSelectedModel: jest.fn(),
    sharedFileReferences: [],
    setSharedFileReferences: jest.fn(),
    sharedExternalFilePaths: { current: new Set() },
  }),
  usePaceLayoutContext: () => ({
    chatSidebarState: CHAT_SIDEBAR_STATE.SIDEBAR,
    setChatSidebarState: jest.fn(),
  }),
}));

describe('ChatSidebarContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the home-style chat surface for a file-scoped new chat', () => {
    render(
      <ChatSidebarContent
        conversationId={null}
        setConversationId={jest.fn()}
        setChatTitle={jest.fn()}
        startNewChat={jest.fn()}
        chatTitle=''
        chatKey={0}
        organizationId='org-1'
        currentUserName='Anish'
        username='anish'
      />,
    );

    expect(screen.queryByTestId('chat-topbar')).not.toBeInTheDocument();
    expect(screen.getByTestId('chat-home')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
  });
});
