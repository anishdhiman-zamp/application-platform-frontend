import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import EmailInputToChips from '../ui/email-input-to-chips';

describe('EmailInputToChips - Core Functional Tests', () => {
  it('renders with initial emails as chips', () => {
    render(<EmailInputToChips value={['a@b.com', 'c@d.com']} onChange={() => {}} />);
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
    expect(screen.getByText('c@d.com')).toBeInTheDocument();
  });

  it('adds a valid email on Enter', () => {
    const handleChange = jest.fn();
    render(<EmailInputToChips value={[]} onChange={handleChange} />);
    const input = screen.getByTestId('input-to-chips-input');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith(['test@example.com']);
  });

  it('adds a valid email on comma', () => {
    const handleChange = jest.fn();
    render(<EmailInputToChips value={[]} onChange={handleChange} />);
    const input = screen.getByTestId('input-to-chips-input');
    fireEvent.change(input, { target: { value: 'foo@bar.com' } });
    fireEvent.keyDown(input, { key: ',', code: 'Comma' });
    expect(handleChange).toHaveBeenCalledWith(['foo@bar.com']);
  });

  it('does not add invalid email', () => {
    const handleChange = jest.fn();
    render(<EmailInputToChips value={[]} onChange={handleChange} />);
    const input = screen.getByTestId('input-to-chips-input');
    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('removes last chip on Backspace when input is empty', () => {
    const handleChange = jest.fn();
    render(<EmailInputToChips value={['a@b.com', 'c@d.com']} onChange={handleChange} />);
    const input = screen.getByTestId('input-to-chips-input');
    fireEvent.keyDown(input, { key: 'Backspace', code: 'Backspace' });
    expect(handleChange).toHaveBeenCalledWith(['a@b.com']);
  });

  it('removes chip when X button is clicked', () => {
    const handleChange = jest.fn();
    render(<EmailInputToChips value={['a@b.com', 'c@d.com']} onChange={handleChange} />);
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);
    expect(handleChange).toHaveBeenCalledWith(['c@d.com']);
  });

  it('focuses input when root is clicked', () => {
    render(<EmailInputToChips value={[]} onChange={() => {}} />);
    const root = screen.getByTestId('input-to-chips-root');
    const input = screen.getByTestId('input-to-chips-input');
    input.blur();
    fireEvent.click(root);
    expect(document.activeElement).toBe(input);
  });

  it('applies custom className', () => {
    render(<EmailInputToChips value={[]} onChange={() => {}} className='custom-class' />);
    expect(screen.getByTestId('input-to-chips-root')).toHaveClass('custom-class');
  });

  it('handles empty array value gracefully', () => {
    expect(() => {
      render(<EmailInputToChips value={[]} onChange={() => {}} />);
    }).not.toThrow();
  });
});

describe('EmailInputToChips - DOM Structure and Attribute Tests', () => {
  it('renders correct DOM structure for empty input', () => {
    render(<EmailInputToChips value={[]} onChange={() => {}} />);

    // Test root container structure
    const root = screen.getByTestId('input-to-chips-root');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('f-13-450', 'flex', 'flex-wrap', 'items-center', 'gap-2');

    // Test input element structure
    const input = screen.getByTestId('input-to-chips-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('aria-label', 'Add email');
    expect(input).toHaveClass(
      'min-w-[120px]',
      'flex-1',
      'border-none',
      'bg-transparent',
      'px-2',
      'py-1',
      'outline-none',
    );

    // Verify no chips are rendered
    const chips = screen.queryAllByRole('button');
    expect(chips).toHaveLength(0);
  });

  it('renders correct DOM structure for input with chips', () => {
    render(<EmailInputToChips value={['a@b.com', 'c@d.com']} onChange={() => {}} />);

    // Test root container
    const root = screen.getByTestId('input-to-chips-root');
    expect(root).toBeInTheDocument();

    // Test chip structure
    const chips = screen.getAllByRole('button');
    expect(chips).toHaveLength(2);

    // Test individual chip structure and CSS classes
    chips.forEach((chip, index) => {
      // Check for the custom size classes applied by EmailInputToChips
      expect(chip).toHaveClass('h-4', 'w-4');
      // Check for ghost variant classes (hover states)
      expect(chip).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
    });

    // Test chip text content
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
    expect(screen.getByText('c@d.com')).toBeInTheDocument();

    // Test chip container structure
    const chipContainers = root.querySelectorAll('span');
    chipContainers.forEach((container) => {
      expect(container).toHaveClass(
        'bg-bg-gray-2',
        'flex',
        'items-center',
        'rounded-lg',
        'border',
        'border-gray-400',
        'py-1',
        'pr-1',
        'pl-2',
      );
    });

    // Test input is still present
    const input = screen.getByTestId('input-to-chips-input');
    expect(input).toBeInTheDocument();
  });

  it('applies custom className to root element', () => {
    render(<EmailInputToChips value={[]} onChange={() => {}} className='custom-class' />);

    const root = screen.getByTestId('input-to-chips-root');
    expect(root).toHaveClass('custom-class');
    expect(root).toHaveClass('f-13-450', 'flex', 'flex-wrap', 'items-center', 'gap-2');
  });

  it('renders input with correct placeholder attribute', () => {
    render(<EmailInputToChips value={[]} onChange={() => {}} placeholder='Enter emails...' />);

    const input = screen.getByTestId('input-to-chips-input');
    expect(input).toHaveAttribute('placeholder', 'Enter emails...');
  });

  it('maintains proper accessibility attributes', () => {
    render(<EmailInputToChips value={['test@example.com']} onChange={() => {}} />);

    const input = screen.getByTestId('input-to-chips-input');
    expect(input).toHaveAttribute('aria-label', 'Add email');
    expect(input).toHaveAttribute('type', 'text');

    // Test that remove buttons are accessible and have correct styling
    const removeButtons = screen.getAllByRole('button');
    expect(removeButtons).toHaveLength(1);
    expect(removeButtons[0]).toHaveClass('h-4', 'w-4');
    expect(removeButtons[0]).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
  });

  it('renders correct number of chips based on value prop', () => {
    const { rerender } = render(<EmailInputToChips value={[]} onChange={() => {}} />);

    // Initially no chips
    expect(screen.queryAllByRole('button')).toHaveLength(0);

    // Add one chip
    rerender(<EmailInputToChips value={['a@b.com']} onChange={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);

    // Add multiple chips
    rerender(<EmailInputToChips value={['a@b.com', 'b@c.com', 'c@d.com']} onChange={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
});
