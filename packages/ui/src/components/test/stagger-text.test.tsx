import { render, screen } from '@testing-library/react';
import { StaggerText } from '../animations/StaggerText';

describe('StaggerText Component', () => {
  // Test for default props
  it('renders with default props', () => {
    render(<StaggerText text='Test' />);
    const container = screen.getByTestId('stagger-text-container');
    const letters = screen.getAllByTestId('stagger-letter');

    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('inline-flex');
    expect(container).toHaveClass('flex-wrap');
    expect(letters).toHaveLength(4); // 'T', 'e', 's', 't'
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
    const letters = screen.getAllByTestId('stagger-letter');
    const textContent = letters.map((letter) => (letter.innerHTML === '&nbsp;' ? ' ' : letter.textContent)).join('');
    expect(textContent).toBe('Hello World');
  });

  // Test with spaces
  it('handles spaces correctly', () => {
    render(<StaggerText text='a b' />);
    const letters = screen.getAllByTestId('stagger-letter');
    expect(letters[1].innerHTML).toBe('&nbsp;');
  });

  // Test animation variants when showAnimation is false
  it('applies correct animation variants when showAnimation is false', () => {
    render(<StaggerText text='Test' showAnimation={false} />);
    const container = screen.getByTestId('stagger-text-container');
    expect(container).toHaveAttribute('data-state', 'hidden');
  });
});
