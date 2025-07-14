import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Label } from '../ui/label';

describe('Label', () => {
  it('renders label content correctly', () => {
    render(<Label htmlFor='username'>Username</Label>);
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Username').tagName.toLowerCase()).toBe('label');
  });

  it('merges custom className with base styles', () => {
    render(<Label className='custom-class'>Email</Label>);
    const label = screen.getByText('Email');
    expect(label).toHaveClass('f-12-500 text-gray-900');
    expect(label).toHaveClass('custom-class');
  });

  it('applies peer-disabled styles when associated input is disabled', () => {
    render(
      <div>
        <Label htmlFor='disabled-input'>Disabled Label</Label>
        <input id='disabled-input' disabled />
      </div>,
    );
    const label = screen.getByText('Disabled Label');
    expect(label.className).toMatch(/peer-disabled:opacity-70/);
    expect(label.className).toMatch(/peer-disabled:cursor-not-allowed/);
  });

  it('has proper ARIA attributes when associated with disabled input', () => {
    render(
      <div>
        <Label htmlFor='disabled-input'>Disabled Label</Label>
        <input id='disabled-input' disabled aria-describedby='error-message' />
        <div id='error-message'>This field is required</div>
      </div>,
    );
    const label = screen.getByText('Disabled Label');
    const input = screen.getByRole('textbox');

    expect(input).toBeDisabled();
    expect(label).toHaveAttribute('for', 'disabled-input');
  });

  it('maintains accessibility when label is associated with disabled control', () => {
    render(
      <div>
        <Label htmlFor='test-input'>Test Label</Label>
        <input id='test-input' disabled />
      </div>,
    );

    const label = screen.getByText('Test Label');
    const input = screen.getByRole('textbox');

    // Verify the label is properly associated with the input
    expect(label).toHaveAttribute('for', 'test-input');
    expect(input).toHaveAttribute('id', 'test-input');
    expect(input).toBeDisabled();
  });

  it('handles click events appropriately when associated input is disabled', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <div>
        <Label htmlFor='disabled-input' onClick={handleClick}>
          Clickable Label
        </Label>
        <input id='disabled-input' disabled />
      </div>,
    );

    const label = screen.getByText('Clickable Label');
    await user.click(label);

    // Click should still work on the label even when input is disabled
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('matches snapshot', () => {
    const { container } = render(<Label htmlFor='test'>Test Label</Label>);
    expect(container).toMatchSnapshot();
  });
});
