import { render, screen, waitFor } from '@testing-library/react';
import AgentFolderList from '@/modules/pace/components/agents/components/AgentFolderList';
import AgentToolsAccess from '@/modules/pace/components/agents/components/AgentToolsAccess';
import AgentTriggerList from '@/modules/pace/components/agents/components/AgentTriggerList';

const mockRefetch = jest.fn();
const mockToggleTrigger = jest.fn();
const mockToggleFileAccess = jest.fn();
const mockFetchIntegrationTools = jest.fn();
const mockFetchToolPolicies = jest.fn();
const mockAddConnection = jest.fn();
const mockRemoveConnection = jest.fn();
const mockDeleteIntegration = jest.fn();
const mockSyncToolPolicies = jest.fn();
const mockEnsureResourceAction = jest.fn();
const mockTriggersData = { triggers: [{ id: 'trigger-1', title: 'Daily summary', enabled: true }] };
const mockFilesData = { files: [{ path: 'reports', name: 'Reports', type: 'directory' }] };
const mockFileAccessData = { folders: [{ path: 'reports', has_access: true }] };
const mockCatalogData = {
  items: [
    {
      name: 'gmail',
      title: 'Gmail',
      icon: '/gmail.svg',
      connections: [{ id: 'connection-1', name: 'ops@example.com' }],
    },
  ],
};
const mockAgentConnectionsData = {
  connections: [
    {
      id: 'connection-1',
      integration_name: 'gmail',
      resource_audience_policy_id: 'rap-1',
      tool_policies: [],
    },
  ],
};

jest.mock('@zamp-platform/ui', () => ({
  CSS_VARS: {
    GREEN_100: '#dcfce7',
    GREEN_800: '#166534',
    ORANGE_100: '#ffedd5',
    ORANGE_800: '#9a3412',
    RED_100: '#fee2e2',
    RED_800: '#991b1b',
  },
  COLORS: {
    BLACK: '#000000',
    WHITE: '#ffffff',
  },
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type='button' {...props}>
      {children}
    </button>
  ),
  FolderClosedIcon: () => <span data-testid='folder-icon' />,
  Skeleton: ({ className }: { className?: string }) => <div className={className} />,
  Switch: ({ checked, onCheckedChange }: { checked?: boolean; onCheckedChange?: (checked: boolean) => void }) => (
    <button type='button' role='switch' aria-checked={checked} onClick={() => onCheckedChange?.(!checked)}>
      Toggle
    </button>
  ),
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('lucide-react', () => ({
  Plus: () => <span data-testid='plus-icon' />,
  Zap: () => <span data-testid='zap-icon' />,
}));

jest.mock('@/components/ImageKitImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt?: string }) => <span aria-label={alt} />,
}));

jest.mock('@/components/common/ImageWithFallback', () => ({
  __esModule: true,
  default: ({ alt }: { alt?: string }) => <span aria-label={alt} />,
}));

jest.mock('@/hooks/toolkit', () => ({
  useAppSelector: () => 'user-1',
}));

jest.mock('@/apis/filesystem', () => ({
  useListFilesQuery: () => ({
    data: mockFilesData,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  }),
}));

jest.mock('@/apis/integrations', () => ({
  useGetIntegrationsCatalogEnabledQuery: () => ({
    data: mockCatalogData,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  }),
}));

jest.mock('@/modules/integrations/IntegrationDetail/useSyncToolPolicies', () => ({
  useEnsureResourceAction: () => mockEnsureResourceAction,
  useSyncToolPolicies: () => ({ syncToolPolicies: mockSyncToolPolicies }),
}));

jest.mock('@/modules/pace/components/agents/components/IntegrationList', () => ({
  __esModule: true,
  default: () => <div data-testid='integration-list' />,
}));

jest.mock('@/modules/pace/components/agents/components/IntegrationDetail', () => ({
  __esModule: true,
  default: () => <div data-testid='integration-detail' />,
}));

jest.mock('@/apis/agents', () => ({
  useAddConnectionToAgentMutation: () => [mockAddConnection],
  useDeleteAgentIntegrationMutation: () => [mockDeleteIntegration],
  useGetAgentConnectionsQuery: () => ({
    data: mockAgentConnectionsData,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  }),
  useGetAgentFileAccessQuery: () => ({
    data: mockFileAccessData,
  }),
  useGetAgentTriggersQuery: () => ({
    data: mockTriggersData,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: mockRefetch,
  }),
  useLazyGetConnectionToolPoliciesQuery: () => [mockFetchToolPolicies],
  useLazyGetIntegrationToolsQuery: () => [mockFetchIntegrationTools],
  useRemoveConnectionFromAgentMutation: () => [mockRemoveConnection],
  useToggleAgentFileAccessMutation: () => [mockToggleFileAccess],
  useToggleAgentTriggerMutation: () => [mockToggleTrigger],
}));

describe('agent tab spacing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchIntegrationTools.mockReturnValue({
      unwrap: () => Promise.resolve({ items: [{ name: 'send_email', display_name: 'Send email' }] }),
    });
    mockFetchToolPolicies.mockReturnValue({
      unwrap: () => Promise.resolve({ policies: [] }),
    });
  });

  it('uses the instructions helper-copy rhythm on triggers, files, and tools tabs', async () => {
    render(
      <>
        <AgentTriggerList agentId='agent-1' />
        <AgentFolderList agentId='agent-1' />
        <AgentToolsAccess agentId='agent-1' />
      </>,
    );

    const triggerHelper = screen.getByText('What should this agent run?');
    const filesHelper = screen.getByText('What folders can the agent access?');
    const toolsHelper = await screen.findByText('What can the agent use? Add connections & tools it can access.');

    [triggerHelper, filesHelper, toolsHelper].forEach((helperText) => {
      expect(helperText).toHaveClass('f-14-400', 'text-GRAY_700', 'text-left', 'mb-6');
      ['f-14-450', 'ml-2.5', 'mt-4', 'mb-4'].forEach((className) => {
        expect(helperText).not.toHaveClass(className);
      });
    });

    await waitFor(() => expect(screen.getByTestId('integration-list')).toBeInTheDocument());
  });
});
