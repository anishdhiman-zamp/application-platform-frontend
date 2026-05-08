import { render, screen, waitFor } from '@testing-library/react';
import AgentDetailPage from '@/modules/pace/components/agents/components/AgentDetailPage';
import { CHAT_SIDEBAR_STATE } from '@/modules/pace/pace.types';

const mockAgentData = {
  id: 'agent-1',
  name: 'Research Agent',
  description: 'Finds useful context',
  avatar: 'agent_1',
};
const mockTriggersData = { triggers: [] };
const mockAgentsListData = { agents: [mockAgentData] };

jest.mock('@zamp-platform/ui', () => ({
  AutoSizeTextarea: ({
    maxHeight: _maxHeight,
    minRows: _minRows,
    ...props
  }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { maxHeight?: number; minRows?: number }) => (
    <textarea {...props} />
  ),
  Skeleton: ({ className }: { className?: string }) => <div className={className} />,
}));

jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}));

jest.mock('@/apis/agents', () => ({
  useGetAgentTriggersQuery: () => ({ data: mockTriggersData }),
  useGetAgentsListQuery: () => ({ data: mockAgentsListData }),
  useUpdateAgentMutation: () => [jest.fn()],
}));

jest.mock('@/components/ImageKitImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt?: string }) => <span aria-label={alt} />,
}));

jest.mock('@/components/layouts/PageContainer', () => ({
  __esModule: true,
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

jest.mock('@/modules/pace/components/agents/hooks/useAgentWithPolling', () => ({
  useAgentWithPolling: () => ({
    data: mockAgentData,
    isLoading: false,
    isError: false,
    isPolling: false,
  }),
}));

jest.mock('modules/pace/components/agents/components/AgentPanelHeader', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('modules/pace/components/agents/constants/agents.constants', () => ({
  getAddInstructionsMessage: (agentName: string) => `Add instructions for ${agentName}`,
  getAddTriggerMessage: (agentName: string) => `Add trigger for ${agentName}`,
  getAgentAvatar: () => ({ src: '/agent.svg', alt: 'Agent' }),
  getAgentAvatarByKey: () => ({ src: '/agent.svg', alt: 'Agent' }),
}));

jest.mock('@/modules/pace/hooks/useTriggerChatMessageFromButton', () => ({
  useTriggerChatMessageFromButton: () => ({ triggerChatMessage: jest.fn() }),
}));

jest.mock('@/modules/pace/pace.context', () => ({
  usePaceLayoutContext: () => ({
    chatSidebarState: CHAT_SIDEBAR_STATE.SIDEBAR,
    setChatSidebarState: jest.fn(),
  }),
}));

jest.mock('@/modules/pace/components/agents/components/AgentInstructions', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('@/modules/pace/components/tasks/components/TaskAccordionGroup', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('@/modules/pace/components/agents/components/AgentTriggerList', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('@/modules/pace/components/agents/components/AgentFolderList', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('@/modules/pace/components/agents/components/AgentToolsAccess', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('@/modules/pace/components/agents/components/AddConnectionModal', () => ({
  __esModule: true,
  default: () => <div />,
}));

describe('AgentDetailPage', () => {
  it('does not report metadata changes when fetched metadata already matches the current route metadata', async () => {
    const onAgentMetadataChange = jest.fn();

    render(
      <AgentDetailPage
        agentId='agent-1'
        agentName='Research Agent'
        agentDescription='Finds useful context'
        avatarKey='agent_1'
        onAgentMetadataChange={onAgentMetadataChange}
      />,
    );

    await waitFor(() => expect(screen.getByLabelText('Agent description')).toHaveValue('Finds useful context'));

    expect(onAgentMetadataChange).not.toHaveBeenCalled();
  });
});
