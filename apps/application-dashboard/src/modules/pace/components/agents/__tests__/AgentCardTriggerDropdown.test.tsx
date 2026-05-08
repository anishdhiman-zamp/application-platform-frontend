import { render } from '@testing-library/react';
import AgentCardTriggerDropdown from '@/modules/pace/components/agents/components/AgentCardTriggerDropdown';

const mockTriggers: unknown[] = [];
const mockRefetch = jest.fn();

jest.mock('@/apis/agents', () => ({
  useGetAgentTriggersQuery: () => ({
    data: { triggers: mockTriggers },
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  }),
  useToggleAgentTriggerMutation: () => [jest.fn()],
}));

jest.mock('@/components/common/ImageWithFallback', () => ({
  __esModule: true,
  default: () => null,
}));

describe('AgentCardTriggerDropdown', () => {
  it('does not nest the popover trigger button inside the tooltip trigger button', () => {
    const { container } = render(
      <AgentCardTriggerDropdown agentId='agent-1' agentName='Research Agent' triggerCount={3} />,
    );

    expect(container.querySelector('button button')).toBeNull();
  });
});
