import { render, screen } from '@testing-library/react';
import { StaggerText } from '../animations/StaggerText';

describe('StaggerText Component', () => {
  // Test for default props
  it('renders with default props', () => {
    render(<StaggerText text='Test' />);
    const container = screen.getByTestId('stagger-text-container');
    const letters = screen.getAllByTestId('stagger-letter');

    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('break-words');
    expect(container).toHaveClass('text-GRAY_1000');
    expect(letters).toHaveLength(4); // 'T', 'e', 's', 't'
  });

  // Snapshot test
  it('matches snapshot with default props', () => {
    const { container } = render(<StaggerText text='Test Snapshot' />);
    expect(container.firstChild).toMatchSnapshot();
  });

  // Snapshot test with custom class
  it('matches snapshot with custom class', () => {
    const { container } = render(<StaggerText text='Custom Class' className='custom-class' />);
    expect(container.firstChild).toMatchSnapshot();
  });

  // Test with custom class
  it('applies custom className', () => {
    render(<StaggerText text='Test' className='custom-class' />);
    const container = screen.getByTestId('stagger-text-container');
    expect(container).toHaveClass('custom-class');
  });

  // Test text content
  it('displays the correct text', () => {
    render(<StaggerText text='Hello World' />);
    const container = screen.getByTestId('stagger-text-container');
    // The component uses &nbsp; which becomes \u00A0 in textContent
    expect(container.textContent).toBe('Hello\u00A0World');
  });

  // Test with spaces - spaces are not stagger-letter elements in current implementation
  it('handles spaces correctly', () => {
    render(<StaggerText text='a b' />);
    const letters = screen.getAllByTestId('stagger-letter');
    // Only 'a' and 'b' should be stagger-letter elements, space is separate
    expect(letters).toHaveLength(2);
    expect(letters[0].textContent).toBe('a');
    expect(letters[1].textContent).toBe('b');

    // Verify the full text content includes the space (as non-breaking space)
    const container = screen.getByTestId('stagger-text-container');
    expect(container.textContent).toBe('a\u00A0b');
  });

  // Test animation variants when showAnimation is false
  it('applies correct animation variants when showAnimation is false', () => {
    render(<StaggerText text='Test' showAnimation={false} />);
    const container = screen.getByTestId('stagger-text-container');
    expect(container).toHaveAttribute('data-state', 'hidden');
  });
});
