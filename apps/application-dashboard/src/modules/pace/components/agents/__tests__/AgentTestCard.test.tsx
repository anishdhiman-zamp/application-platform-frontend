import { render, screen } from '@testing-library/react';
import AgentTestCard from '@/modules/pace/components/agents/components/AgentTestCard';

jest.mock('@zamp-platform/ui', () => ({
  Button: ({
    children,
    isLoading: _isLoading,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }) => (
    <button type='button' {...props}>
      {children}
    </button>
  ),
  CSS_VARS: {
    RED_100: '#fee2e2',
    RED_800: '#991b1b',
    GREEN_100: '#dcfce7',
    GREEN_800: '#166534',
    ORANGE_100: '#ffedd5',
    ORANGE_800: '#9a3412',
  },
}));

jest.mock('@/apis/agents', () => ({
  useLazyGetAgentTriggersQuery: () => [jest.fn(), { isFetching: false }],
}));

jest.mock('@/components/common/ImageWithFallback', () => ({
  __esModule: true,
  default: ({ alt }: { alt?: string }) => <img alt={alt} />,
}));

jest.mock('@/components/ImageKitImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt?: string }) => <img alt={alt} />,
}));

jest.mock('@/modules/pace/hooks/useTriggerChatMessageFromButton', () => ({
  useTriggerChatMessageFromButton: () => ({ triggerChatMessage: jest.fn() }),
}));

jest.mock('@/modules/pace/pace.context', () => ({
  usePaceActionsContext: () => ({ startNewChat: jest.fn() }),
  usePaceConversationContext: () => ({ setChatMessageIntent: jest.fn() }),
  usePaceLayoutContext: () => ({ setChatSidebarState: jest.fn() }),
}));

describe('AgentTestCard', () => {
  it('uses the same hover background as task rows for the agent bar', () => {
    render(
      <AgentTestCard
        agentId='agent-1'
        agentName='Twitter Reader Agent'
        avatar={{ key: 'agent_1', src: '/agent.png', alt: 'Twitter Reader Agent' }}
      />,
    );

    const agentBar = screen.getByText('Twitter Reader Agent').closest('.cursor-pointer');

    expect(agentBar).toHaveClass('hover:bg-BG_GRAY_2');
    expect(agentBar).not.toHaveClass('hover:bg-GRAY_100');
  });

  it('shows the open arrow inline after the agent name on hover', () => {
    const { container } = render(
      <AgentTestCard
        agentId='agent-1'
        agentName='Twitter Reader Agent'
        avatar={{ key: 'agent_1', src: '/agent.png', alt: 'Twitter Reader Agent' }}
      />,
    );

    const agentName = screen.getByText('Twitter Reader Agent');
    const nameGroup = agentName.parentElement;
    const rightControls = container.querySelector('[data-agent-test-card-controls]');
    const agentBar = agentName.closest('.cursor-pointer');
    const inlineArrow = nameGroup?.querySelector('svg.lucide-arrow-up-right');

    expect(agentBar).toHaveClass('group/agent-test-card');
    expect(inlineArrow).toBeInTheDocument();
    expect(inlineArrow).toHaveClass('opacity-0');
    expect(inlineArrow).toHaveClass('group-hover/agent-test-card:opacity-100');
    expect(inlineArrow).not.toHaveClass('group-hover:opacity-100');
    expect(rightControls?.querySelector('svg.lucide-arrow-up-right')).not.toBeInTheDocument();
  });
});
