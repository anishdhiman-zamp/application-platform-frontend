import { render } from '@testing-library/react';
import AgentTabEmptyState from '@/modules/pace/components/agents/components/AgentTabEmptyState';

jest.mock('@zamp-platform/ui', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type='button' {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ImageKitImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt?: string }) => <span aria-label={alt} />,
}));

describe('AgentTabEmptyState', () => {
  it('keeps comfortable vertical padding inside the bordered empty state', () => {
    const { container } = render(<AgentTabEmptyState description='Run your agent in the background via triggers' />);

    expect(container.firstChild).toHaveClass('py-6');
  });
});
