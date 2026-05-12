import {
  AGENT_CARD_GRID_CLASS,
  AGENT_CARD_GRID_WIDTH_CLASS,
} from '@/modules/pace/components/agents/constants/agents.constants';

describe('agent listing layout constants', () => {
  it('keeps the agents grid at two columns until the container is extra wide', () => {
    expect(AGENT_CARD_GRID_CLASS).toContain('@3xl:grid-cols-[repeat(2,350px)]');
    expect(AGENT_CARD_GRID_CLASS).toContain('@6xl:grid-cols-[repeat(3,350px)]');
    expect(AGENT_CARD_GRID_CLASS).not.toContain('@5xl:grid-cols-[repeat(3,350px)]');

    expect(AGENT_CARD_GRID_WIDTH_CLASS).toContain('@3xl:max-w-[716px]');
    expect(AGENT_CARD_GRID_WIDTH_CLASS).toContain('@6xl:max-w-[1082px]');
    expect(AGENT_CARD_GRID_WIDTH_CLASS).not.toContain('@5xl:max-w-[1082px]');
  });
});
