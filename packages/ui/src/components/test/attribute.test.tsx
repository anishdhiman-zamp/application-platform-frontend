import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { Attribute } from '../ui/attribute';

describe('Attribute Component - Functional Tests', () => {
  it('renders with required props', () => {
    const { getByRole, getByText } = render(<Attribute label='Name' displayValue='John Doe' />);
    expect(getByRole('button')).toBeInTheDocument();
    expect(getByText('Name')).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
  });

  it('renders with React node as displayValue', () => {
    const { getByText, getByTestId } = render(
      <Attribute label='Status' displayValue={<span data-testid='status-icon'>✅</span>} />,
    );
    expect(getByText('Status')).toBeInTheDocument();
    expect(getByTestId('status-icon')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Attribute label='Name' displayValue='John Doe' onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies data-context-id attribute when provided', () => {
    const { getByRole } = render(<Attribute label='Name' displayValue='John Doe' dataContextId='user-123' />);
    expect(getByRole('button')).toHaveAttribute('data-context-id', 'user-123');
  });

  it('applies custom className', () => {
    const { getByRole } = render(<Attribute label='Name' displayValue='John Doe' className='custom-class' />);
    expect(getByRole('button')).toHaveClass('custom-class');
  });
});

describe('Attribute Component - Styling & Compatibility', () => {
  it('renders correct styling classes for label and value', () => {
    const { getByText } = render(<Attribute label='Name' displayValue='John Doe' />);
    expect(getByText('Name')).toHaveClass('text-BG_WHITE', 'f-12-400', 'whitespace-nowrap');
    expect(getByText('John Doe')).toHaveClass('f-12-500', 'whitespace-nowrap', 'text-black');
  });

  it('renders safely with long text to test truncation or overflow handling', () => {
    const longLabel = 'This is a very long label that might get truncated in the UI';
    const longValue = 'This is a very long value that should still render correctly without breaking the layout';

    const { getByText } = render(<Attribute label={longLabel} displayValue={longValue} />);
    expect(getByText(longLabel)).toBeInTheDocument();
    expect(getByText(longValue)).toBeInTheDocument();
  });
});

describe('Attribute Component - Edge Cases', () => {
  it('handles special characters in label and value', () => {
    const { getByText } = render(<Attribute label='Name & Title' displayValue='John & Jane' />);
    expect(getByText('Name & Title')).toBeInTheDocument();
    expect(getByText('John & Jane')).toBeInTheDocument();
  });

  it('handles null and undefined displayValue gracefully', () => {
    const { getByText, queryByText } = render(<Attribute label='Status' displayValue={null} />);
    expect(getByText('Status')).toBeInTheDocument();
    expect(queryByText('null')).not.toBeInTheDocument();
  });
});

describe('Attribute Component - Snapshot Tests', () => {
  it('matches snapshot for default props', () => {
    const { container } = render(<Attribute label='Name' displayValue='John Doe' />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when disabled', () => {
    const { container } = render(<Attribute label='Name' displayValue='John Doe' disabled />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
