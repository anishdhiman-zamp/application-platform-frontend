import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { Checkbox } from '../ui/checkbox';

describe('Checkbox Component - Functional Tests', () => {
  it('renders as unchecked by default and is interactive', () => {
    const { getByRole } = render(<Checkbox />);
    const checkbox = getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    expect(checkbox).not.toBeDisabled();
  });

  it('toggles checked state when clicked (uncontrolled)', () => {
    const { getByRole } = render(<Checkbox defaultChecked={false} />);
    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('does not toggle when disabled', () => {
    const { getByRole } = render(<Checkbox disabled defaultChecked={false} />);
    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('calls onCheckedChange with correct values', () => {
    const handleChange = jest.fn();
    const { getByRole } = render(<Checkbox onCheckedChange={handleChange} />);
    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('renders check icon only when checked', () => {
    const { getByRole, rerender } = render(<Checkbox checked={false} />);
    expect(getByRole('checkbox').querySelector('svg')).not.toBeInTheDocument();

    rerender(<Checkbox checked />);
    expect(getByRole('checkbox').querySelector('svg')).toBeInTheDocument();
  });

  it('supports controlled state via checked prop', () => {
    const { getByRole, rerender } = render(<Checkbox checked={false} />);
    const checkbox = getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    rerender(<Checkbox checked />);
    expect(checkbox).toBeChecked();
  });

  it('forwards ref to underlying element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} />);
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('applies custom className', () => {
    const { getByRole } = render(<Checkbox className='custom-class' />);
    expect(getByRole('checkbox')).toHaveClass('custom-class');
  });

  it('applies indeterminate state', () => {
    const { getByRole } = render(<Checkbox checked='indeterminate' />);
    expect(getByRole('checkbox')).toHaveAttribute('data-state', 'indeterminate');
  });

  it('applies base styling classes', () => {
    const { getByRole } = render(<Checkbox />);
    const checkbox = getByRole('checkbox');
    expect(checkbox).toHaveClass(
      'border-GRAY_500',
      'hover:bg-GRAY_400',
      'focus-visible:ring-ring',
      'data-[state=checked]:bg-GRAY_1000',
      'data-[state=checked]:border-GRAY_600',
      'peer',
      'h-3.5',
      'w-3.5',
      'shrink-0',
      'cursor-pointer',
      'rounded-[3px]',
      'border',
      'focus-visible:ring-1',
      'focus-visible:outline-hidden',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
    );
  });

  // Critical snapshots that could break component usage
  it('matches snapshot for default checkbox', () => {
    const { container } = render(<Checkbox />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for checked state', () => {
    const { container } = render(<Checkbox checked />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for disabled state', () => {
    const { container } = render(<Checkbox disabled />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for indeterminate state', () => {
    const { container } = render(<Checkbox checked='indeterminate' />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
