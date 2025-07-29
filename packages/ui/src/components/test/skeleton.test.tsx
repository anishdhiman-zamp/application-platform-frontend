import { render, screen } from '@testing-library/react';
import { Skeleton } from '../ui/skeleton';

describe('Skeleton', () => {
  it('applies default base classes', () => {
    render(<Skeleton data-testid='skeleton' />);
    const el = screen.getByTestId('skeleton');

    expect(el.className).toMatch(/animate-pulse/);
    expect(el.className).toMatch(/rounded-md/);
    expect(el.className).toMatch(/bg-gray-100/);
  });

  it('merges custom className with base styles', () => {
    render(<Skeleton className='custom-class h-4 w-32' data-testid='skeleton' />);
    const el = screen.getByTestId('skeleton');

    expect(el).toHaveClass('h-4');
    expect(el).toHaveClass('w-32');
    expect(el).toHaveClass('custom-class');
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveClass('rounded-md');
    expect(el).toHaveClass('bg-gray-100');
  });

  it('forwards additional HTML attributes', () => {
    render(<Skeleton aria-label='loading-indicator' data-testid='skeleton' />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveAttribute('aria-label', 'loading-indicator');
  });

  it('renders children if provided (flexible behavior)', () => {
    render(<Skeleton>Skeleton Content</Skeleton>);
    expect(screen.getByText('Skeleton Content')).toBeInTheDocument();
  });

  it('matches snapshot (default)', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom styles and children', () => {
    const { container } = render(
      <Skeleton className='h-4 w-16'>
        <span>Content</span>
      </Skeleton>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
