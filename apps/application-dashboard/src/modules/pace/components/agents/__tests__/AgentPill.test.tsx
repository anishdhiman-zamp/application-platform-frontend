import { render } from '@testing-library/react';
import AgentPill from '@/modules/pace/components/agents/components/AgentPill';

jest.mock('@zamp-platform/ui', () => ({
  CSS_VARS: {
    RED_100: '#fee2e2',
    RED_800: '#991b1b',
    GREEN_100: '#dcfce7',
    GREEN_800: '#166534',
    ORANGE_100: '#ffedd5',
    ORANGE_800: '#9a3412',
  },
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div className='outline-none'>{children}</div>,
}));

jest.mock('@/apis/agents', () => ({
  useGetAgentQuery: () => ({ data: { avatar: 'agent_7' } }),
}));

jest.mock('@/components/ImageKitImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt?: string }) => <img alt={alt} />,
}));

jest.mock('@/modules/pace/components/dynamic-tabs/useDynamicTabs', () => ({
  useDynamicTabs: () => ({
    getTabById: () => ({ metadata: { avatarKey: 'agent_7' } }),
    openSingleTab: jest.fn(),
  }),
}));

jest.mock('@/modules/pace/components/agents/components/AgentTestCard', () => ({
  __esModule: true,
  default: () => <div />,
}));

describe('AgentPill', () => {
  beforeEach(() => {
    class ResizeObserverMock {
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    }

    global.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
  });

  it('uses the sidebar agents glyph for the pill trigger instead of an avatar image', () => {
    const containerRef = { current: document.createElement('div') };
    const { container, queryByRole } = render(
      <AgentPill agentId='agent-1' agentName='Research Agent' avatarKey='agent_7' containerRef={containerRef} />,
    );

    expect(queryByRole('img', { name: /agent avatar/i })).not.toBeInTheDocument();
    expect(container.querySelector('svg.lucide-bot')).toBeInTheDocument();
  });
});
