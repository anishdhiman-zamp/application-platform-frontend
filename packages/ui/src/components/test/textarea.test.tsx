import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../ui/textarea';

describe('Textarea', () => {
  it('renders with default styling', () => {
    render(<Textarea data-testid='textarea' />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('border-input');
  });

  it('applies custom className while preserving default styles', () => {
    render(<Textarea data-testid='textarea' className='custom-class' />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('custom-class', 'border-input');
  });

  it('supports placeholder and disabled props', () => {
    render(<Textarea placeholder='Enter text...' disabled data-testid='textarea' />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Enter text...');
    expect(textarea).toBeDisabled();
  });

  it('updates value on user input', async () => {
    const user = userEvent.setup();
    render(<Textarea data-testid='textarea' />);
    const textarea = screen.getByTestId('textarea');
    await user.type(textarea, 'Hello world');
    expect(textarea).toHaveValue('Hello world');
  });

  it('matches snapshot (default)', () => {
    const { container } = render(<Textarea placeholder='Type here' />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
