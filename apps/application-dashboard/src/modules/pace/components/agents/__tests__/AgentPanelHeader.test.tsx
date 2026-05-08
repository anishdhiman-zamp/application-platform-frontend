import { fireEvent, render, screen } from '@testing-library/react';
import AgentPanelHeader from '@/modules/pace/components/agents/components/AgentPanelHeader';
import { CHAT_SIDEBAR_STATE } from '@/modules/pace/pace.types';

const mockPush = jest.fn();
const mockSetNewChatDraft = jest.fn();
const mockSetActiveAgentInfo = jest.fn();
const mockSetChatSidebarState = jest.fn();
const mockRequestInstantFilesPanelTransition = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@zamp-platform/ui', () => ({
  Button: ({
    children,
    className,
    leadingIcon,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { leadingIcon?: React.ReactNode }) => (
    <button className={className} {...props}>
      {leadingIcon}
      {children}
    </button>
  ),
  Skeleton: ({ className }: { className?: string }) => <div className={className} />,
  TooltipV2: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/apis/agents', () => ({
  useGetAgentsListQuery: () => ({ data: { agents: [{ id: 'agent-1', my_privilege: 'owner' }] } }),
}));

jest.mock('@/modules/shareResource', () => ({
  agentConfig: {},
  ResourceType: { AGENT: 'agent' },
  ShareResourceVersion: { V2: 'v2' },
  ShareResourcePopup: ({ customTrigger }: { customTrigger?: React.ReactNode }) =>
    customTrigger ?? <button type='button'>Share</button>,
}));

jest.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlag: () => ({ isEnabled: true }),
}));

jest.mock('@/modules/pace/components/chat/ChatButtonZampLogo', () => ({
  __esModule: true,
  default: () => <span data-testid='chat-button-logo' />,
}));

jest.mock('@/modules/pace/components/files-panel/FilesPanelHeaderSlot', () => ({
  useFilesPanelHeaderSlot: () => null,
}));

jest.mock('@/modules/pace/hooks/useChatDraftInput', () => ({
  setNewChatDraft: (content: string) => mockSetNewChatDraft(content),
}));

jest.mock('@/modules/pace/pace.context', () => ({
  usePaceConversationContext: () => ({
    setActiveAgentInfo: mockSetActiveAgentInfo,
  }),
  usePaceLayoutContext: () => ({
    setChatSidebarState: mockSetChatSidebarState,
    requestInstantFilesPanelTransition: mockRequestInstantFilesPanelTransition,
  }),
}));

describe('AgentPanelHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps readable spacing between the agent icon, title, and share action', () => {
    render(
      <AgentPanelHeader
        isActive
        agentId='agent-1'
        agentName='Slack Digest'
        onClose={jest.fn()}
        onAgentNameChange={jest.fn()}
      />,
    );

    const titleActions = screen.getByLabelText('Agent name').closest('div');
    const identityGroup = titleActions?.parentElement;
    const shareButton = screen.getByRole('button', { name: 'Share agent' });

    expect(identityGroup).toHaveClass('gap-2');
    expect(titleActions).toHaveClass('gap-1');
    expect(screen.getByLabelText('Agent name')).toHaveAttribute('size', '1');
    expect(shareButton.className).not.toContain('-ml-');
  });

  it('hands off to chat instantly with a prefilled agent-scoped composer', () => {
    render(
      <AgentPanelHeader
        isActive
        agentId='agent-1'
        agentName='Slack Digest'
        agentDescription='Find things'
        avatarKey='agent_1'
        onClose={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Chat with Agent' }));

    expect(mockSetNewChatDraft).toHaveBeenCalledWith('I want to collaborate with Slack Digest ');
    expect(mockSetActiveAgentInfo).toHaveBeenCalledWith({
      id: 'agent-1',
      name: 'Slack Digest',
      avatar: 'agent_1',
    });
    expect(mockSetChatSidebarState).toHaveBeenCalledWith(CHAT_SIDEBAR_STATE.SIDEBAR);
    expect(mockRequestInstantFilesPanelTransition).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      '/chat?a=agent-1&title=Slack+Digest&description=Find+things&avatarKey=agent_1',
    );
  });
});
