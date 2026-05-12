import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AgentDetailPage from '@/modules/pace/components/agents/components/AgentDetailPage';
import { CHAT_SIDEBAR_STATE } from '@/modules/pace/pace.types';

const mockAgentData = {
  id: 'agent-1',
  name: 'Research Agent',
  description: 'Finds useful context',
  avatar: 'agent_1',
};
let mockTriggersData = { triggers: [] as { id: string; title: string; enabled: boolean }[] };
const mockAgentsListData = { agents: [mockAgentData] };

jest.mock('@zamp-platform/ui', () => ({
  CSS_VARS: {
    RED_100: '#fee2e2',
    RED_800: '#991b1b',
    GREEN_100: '#dcfce7',
    GREEN_800: '#166534',
    ORANGE_100: '#ffedd5',
    ORANGE_800: '#9a3412',
  },
  Tabs: ({
    value,
    onValueChange,
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    onValueChange: (value: string) => void;
  }) => {
    const React = jest.requireActual('react');
    const clonedChildren = React.Children.map(children, (child: React.ReactNode) =>
      React.isValidElement(child) ? React.cloneElement(child, { activeTab: value, onTabChange: onValueChange }) : child,
    );

    return <div {...props}>{clonedChildren}</div>;
  },
  TabsList: ({
    children,
    activeTab,
    onTabChange,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    activeTab?: string;
    onTabChange?: (value: string) => void;
  }) => {
    const React = jest.requireActual('react');
    const clonedChildren = React.Children.map(children, (child: React.ReactNode) =>
      React.isValidElement(child) ? React.cloneElement(child, { activeTab, onTabChange }) : child,
    );

    return (
      <div role='tablist' {...props}>
        {clonedChildren}
      </div>
    );
  },
  TabsTrigger: ({
    value,
    activeTab,
    onTabChange,
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string;
    activeTab?: string;
    onTabChange?: (value: string) => void;
  }) => (
    <button
      type='button'
      role='tab'
      aria-selected={activeTab === value}
      onClick={() => onTabChange?.(value)}
      {...props}
    >
      {children}
    </button>
  ),
  TabsContent: ({
    value,
    activeTab,
    onTabChange: _onTabChange,
    forceMount: _forceMount,
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    activeTab?: string;
    onTabChange?: (value: string) => void;
    forceMount?: boolean;
  }) => {
    const isActive = activeTab === value;
    const hidesInactivePanel = className?.includes('data-[state=inactive]:hidden') ?? false;

    return (
      <div
        role='tabpanel'
        data-state={isActive ? 'active' : 'inactive'}
        hidden={!isActive && hidesInactivePanel}
        className={className}
        {...props}
      >
        {children}
      </div>
    );
  },
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
    <div data-testid='agent-detail-page-container' className={className}>
      {children}
    </div>
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
  ...jest.requireActual('modules/pace/components/agents/constants/agents.constants'),
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
  default: ({ isActive }: { isActive?: boolean }) => (
    <div data-testid='agent-instructions-panel'>{String(isActive)}</div>
  ),
}));

jest.mock('@/modules/pace/components/tasks/components/TaskAccordionGroup', () => ({
  __esModule: true,
  default: ({ isActive }: { isActive?: boolean }) => <div data-testid='agent-tasks-panel'>{String(isActive)}</div>,
}));

jest.mock('@/modules/pace/components/agents/components/AgentTriggerList', () => ({
  __esModule: true,
  default: ({ isActive }: { isActive?: boolean }) => <div data-testid='agent-triggers-panel'>{String(isActive)}</div>,
}));

jest.mock('@/modules/pace/components/agents/components/AgentFolderList', () => ({
  __esModule: true,
  default: ({ isActive }: { isActive?: boolean }) => <div data-testid='agent-files-panel'>{String(isActive)}</div>,
}));

jest.mock('@/modules/pace/components/agents/components/AgentToolsAccess', () => ({
  __esModule: true,
  default: ({ isActive }: { isActive?: boolean }) => (
    <div data-testid='agent-tools-access-panel'>{String(isActive)}</div>
  ),
}));

jest.mock('@/modules/pace/components/agents/components/AddConnectionModal', () => ({
  __esModule: true,
  default: () => <div />,
}));

const renderAgentDetailPage = (props?: Partial<React.ComponentProps<typeof AgentDetailPage>>) =>
  render(
    <AgentDetailPage
      agentId='agent-1'
      agentName='Research Agent'
      agentDescription='Finds useful context'
      avatarKey='agent_1'
      {...props}
    />,
  );

describe('AgentDetailPage', () => {
  beforeEach(() => {
    mockTriggersData = { triggers: [] };
  });

  it('does not report metadata changes when fetched metadata already matches the current route metadata', async () => {
    const onAgentMetadataChange = jest.fn();

    renderAgentDetailPage({ onAgentMetadataChange });

    await waitFor(() => expect(screen.getByLabelText('Agent description')).toHaveValue('Finds useful context'));

    expect(onAgentMetadataChange).not.toHaveBeenCalled();
  });

  it('keeps the agent detail content at 24px horizontal padding across breakpoints', () => {
    renderAgentDetailPage();

    const pageContainerClassName = screen.getByTestId('agent-detail-page-container').className;

    expect(pageContainerClassName).toContain('px-6');
    expect(pageContainerClassName).not.toContain('sm:px-12');
  });

  it('keeps 16px spacing between the description and agent detail tabs', () => {
    renderAgentDetailPage();

    const descriptionClassName = screen.getByLabelText('Agent description').className;

    expect(descriptionClassName).toContain('mb-4');
    expect(descriptionClassName).not.toContain('mb-6');
  });

  it('renders agent detail tabs in the intended order with instructions active by default', () => {
    renderAgentDetailPage();

    const tabLabels = screen.getAllByRole('tab').map((tab) => tab.textContent);

    expect(tabLabels).toEqual(['Instructions', 'Tasks', 'Triggers', 'Files', 'Tools & Access']);
    expect(screen.getByRole('tab', { name: 'Instructions' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('agent-instructions-panel')).toHaveTextContent('true');
    expect(screen.getByTestId('agent-instructions-panel').closest('[role="tabpanel"]')).not.toHaveAttribute('hidden');
    expect(screen.getByTestId('agent-tasks-panel')).toHaveTextContent('false');
    expect(screen.getByTestId('agent-tasks-panel').closest('[role="tabpanel"]')).toHaveAttribute('hidden');
  });

  it('extends the agent detail tab divider across the content container', () => {
    renderAgentDetailPage();

    const tabListClasses = screen.getByRole('tablist').className.split(/\s+/);

    expect(tabListClasses).toContain('w-full');
    expect(tabListClasses).toContain('border-b');
  });

  it('applies the same top spacing to every agent detail tab panel', () => {
    renderAgentDetailPage();

    screen.getAllByRole('tabpanel', { hidden: true }).forEach((panel) => {
      expect(panel).toHaveClass('pt-4');
    });
  });

  it('switches the visible agent detail panel when a tab is selected', () => {
    renderAgentDetailPage();

    fireEvent.click(screen.getByRole('tab', { name: 'Tasks' }));
    expect(screen.getByRole('tab', { name: 'Tasks' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('agent-tasks-panel')).toHaveTextContent('true');
    expect(screen.getByTestId('agent-instructions-panel').closest('[role="tabpanel"]')).toHaveAttribute('hidden');
    expect(screen.getByTestId('agent-tasks-panel').closest('[role="tabpanel"]')).not.toHaveAttribute('hidden');

    fireEvent.click(screen.getByRole('tab', { name: 'Triggers' }));
    expect(screen.getByRole('tab', { name: 'Triggers' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('agent-triggers-panel')).toHaveTextContent('true');

    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    expect(screen.getByRole('tab', { name: 'Files' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('agent-files-panel')).toHaveTextContent('true');

    fireEvent.click(screen.getByRole('tab', { name: 'Tools & Access' }));
    expect(screen.getByRole('tab', { name: 'Tools & Access' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('agent-tools-access-panel')).toHaveTextContent('true');
  });

  it('shows the trigger count on the triggers tab', () => {
    mockTriggersData = {
      triggers: [
        { id: 'trigger-1', title: 'Daily summary', enabled: true },
        { id: 'trigger-2', title: 'Weekly report', enabled: false },
      ],
    };

    renderAgentDetailPage();

    expect(screen.getByRole('tab', { name: 'Triggers 2' })).toBeInTheDocument();
  });
});
