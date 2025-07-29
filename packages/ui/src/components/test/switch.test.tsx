import { fireEvent, render, screen } from '@testing-library/react';
import { Switch } from '../ui/switch';

describe('Switch Component - Functional Tests', () => {
  it('renders without crashing', () => {
    render(<Switch data-testid='custom-switch' />);
    expect(screen.getByTestId('custom-switch')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Switch data-testid='switch' className='custom-class' />);
    expect(screen.getByTestId('switch')).toHaveClass('custom-class');
  });

  it('renders with defaultChecked', () => {
    render(<Switch data-testid='switch' defaultChecked />);
    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toHaveAttribute('data-state', 'checked');
  });

  it('forwards additional props', () => {
    render(<Switch data-testid='switch' aria-label='Theme toggle' />);
    expect(screen.getByTestId('switch')).toHaveAttribute('aria-label', 'Theme toggle');
  });

  it('calls onCheckedChange when toggled (controlled)', () => {
    const handleChange = jest.fn();
    render(<Switch checked={false} onCheckedChange={handleChange} data-testid='switch' />);

    fireEvent.click(screen.getByTestId('switch'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  // Critical snapshots that could break component usage
  it('matches snapshot for default state', () => {
    const { container } = render(<Switch />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for checked state', () => {
    const { container } = render(<Switch defaultChecked />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for disabled state', () => {
    const { container } = render(<Switch disabled />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for disabled checked state', () => {
    const { container } = render(<Switch disabled defaultChecked />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<Switch className='custom-switch' />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
