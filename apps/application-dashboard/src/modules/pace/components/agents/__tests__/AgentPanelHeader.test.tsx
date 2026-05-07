import { render, screen } from '@testing-library/react';
import AgentPanelHeader from '@/modules/pace/components/agents/components/AgentPanelHeader';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
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
  setNewChatDraft: jest.fn(),
}));

describe('AgentPanelHeader', () => {
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
});
