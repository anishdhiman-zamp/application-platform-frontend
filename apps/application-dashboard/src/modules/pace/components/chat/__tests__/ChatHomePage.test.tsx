import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ChatHomePage from '@/modules/pace/components/chat/ChatHomePage';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';

const mockSetChatMessageIntent = jest.fn();
const mockSetChatSidebarState = jest.fn();
const mockStartNewChat = jest.fn();

jest.mock('@zamp-platform/chat', () => ({
  ChatActionsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropOverlay: () => null,
  ResourceType: { ORGANIZATION: 'organization' },
  ScopeType: { ORGANIZATION: 'organization' },
  useFileDragDrop: () => ({ isDragOver: false, dropZoneProps: {} }),
}));

jest.mock('@zamp-platform/conversation-stream', () => {
  const React = jest.requireActual('react') as typeof import('react');
  const ConversationActionsContext = React.createContext<{
    createConversationV2?: (payload: {
      message_content?: {
        text?: string;
        file_references?: { path: string; name: string }[];
        references?: unknown[];
      };
      llm_model?: string | null;
      pev_enabled?: boolean;
    }) => Promise<unknown>;
  }>({});

  return {
    ConnectedChatInput: () => {
      const actions = React.useContext(ConversationActionsContext);

      return (
        <button
          type='button'
          onClick={() =>
            actions.createConversationV2?.({
              message_content: { text: 'I want to collaborate with Slack Digest' },
              llm_model: 'gpt-test',
            })
          }
        >
          Send from home
        </button>
      );
    },
    ConversationActionsContext,
    ConversationBrowserContext: React.createContext({}),
    ConversationInputContext: React.createContext({}),
    ConversationMessagesContext: React.createContext({}),
    ConversationStateContext: React.createContext({}),
    ConversationStatusContext: React.createContext({}),
    createConversationActions: (actions: unknown) => actions,
  };
});

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      initial?: unknown;
      animate?: unknown;
      exit?: unknown;
      transition?: unknown;
    }) => <div {...props}>{children}</div>,
  },
  useReducedMotion: () => false,
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/chat',
}));

jest.mock('@/contexts/VoiceChatContext', () => ({
  useVoiceChatContext: () => ({ isVoiceChatEnabled: false, state: 'inactive' }),
}));

jest.mock('@/hooks/toolkit', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      user: {
        user: {
          orgs: [{ organization_id: 'org-1' }],
          user_name: 'Anish',
          username: 'anish',
        },
      },
    }),
}));

jest.mock('@/modules/pace/components/chat/ChatHome', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('@/modules/pace/components/chat/ModelSelector', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('@/modules/pace/components/dynamic-tabs/useDynamicTabs', () => ({
  useDynamicTabs: () => ({
    activeTab: {
      id: 'agent-1',
      type: TAB_TYPE.AGENT,
      title: 'Slack Digest',
      path: '/chat?a=agent-1',
    },
    openTab: jest.fn(),
    openSingleTab: jest.fn(),
  }),
}));

jest.mock('@/modules/pace/hooks/useChatDraftInput', () => ({
  CHAT_DRAFT_UPDATE_EVENT: 'chat-draft-update',
  useChatDraftInput: () => ({ inputValue: 'I want to collaborate with Slack Digest', setInputValue: jest.fn() }),
}));

jest.mock('@/modules/pace/hooks/useReferencePicker', () => ({
  useReferencePicker: () => null,
}));

jest.mock('@/modules/pace/pace.context', () => ({
  usePaceActionsContext: () => ({
    startNewChat: mockStartNewChat,
    logoAnimationKey: 0,
    triggerLogoAnimation: jest.fn(),
  }),
  usePaceConversationContext: () => ({
    setChatMessageIntent: mockSetChatMessageIntent,
    pendingFileReferences: [],
    clearPendingFileReferences: jest.fn(),
    pendingMentionInserts: [],
    clearPendingMentionInserts: jest.fn(),
    sharedFileReferences: [],
    setSharedFileReferences: jest.fn(),
    sharedExternalFilePaths: { current: new Set() },
    selectedModel: 'gpt-test',
    setSelectedModel: jest.fn(),
    activeAgentInfo: { id: 'agent-1', name: 'Slack Digest', avatar: 'agent_1' },
  }),
  usePaceLayoutContext: () => ({
    chatSidebarState: CHAT_SIDEBAR_STATE.COLLAPSED,
    setChatSidebarState: mockSetChatSidebarState,
  }),
}));

describe('ChatHomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends homepage messages through the active agent while keeping the panel open', async () => {
    render(<ChatHomePage />);

    fireEvent.click(screen.getByRole('button', { name: 'Send from home' }));

    await waitFor(() => {
      expect(mockSetChatMessageIntent).toHaveBeenCalledWith({
        message: 'I want to collaborate with Slack Digest',
        fileReferences: undefined,
        references: undefined,
        llmModel: 'gpt-test',
        metadata: { agent_id: 'agent-1', avatar: 'agent_1' },
        autoLoopEnabled: undefined,
      });
    });
    expect(mockSetChatSidebarState).toHaveBeenCalledWith(CHAT_SIDEBAR_STATE.SIDEBAR);
    expect(mockStartNewChat).not.toHaveBeenCalled();
  });
});
