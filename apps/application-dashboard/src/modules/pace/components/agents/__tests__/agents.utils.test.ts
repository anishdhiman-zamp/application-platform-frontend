import { buildAgentListingPanelRoute } from '@/modules/pace/components/agents/utils/agents.utils';

describe('agents utils', () => {
  it('builds the canonical listing drawer route for an agent', () => {
    expect(buildAgentListingPanelRoute('agent-1', 'Research Agent', 'Find things', 'agent_1')).toBe(
      '/chat/agents?a=agent-1&title=Research+Agent&description=Find+things&avatarKey=agent_1',
    );
  });
});
