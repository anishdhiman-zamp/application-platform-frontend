import { render } from '@testing-library/react';
import AgentTabIcon from '@/modules/pace/components/agents/components/AgentTabIcon';

describe('AgentTabIcon', () => {
  it('uses the sidebar agents glyph instead of an avatar image', () => {
    const { container, queryByRole } = render(<AgentTabIcon />);

    expect(queryByRole('img', { name: /agent avatar/i })).not.toBeInTheDocument();
    expect(container.querySelector('svg.lucide-bot')).toBeInTheDocument();
  });
});
