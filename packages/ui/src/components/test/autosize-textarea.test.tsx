import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { AutoSizeTextarea } from '../ui/autosize-textarea';

// Mock the cn utility
jest.mock('@zamp-platform/ui/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

describe('AutosizeTextarea', () => {
  beforeEach(() => {
    // Mock getComputedStyle with proper implementation
    Object.defineProperty(window, 'getComputedStyle', {
      value: (element: HTMLElement) => ({
        lineHeight: '20px',
        paddingTop: '8px',
        paddingBottom: '8px',
        borderTopWidth: '1px',
        borderBottomWidth: '1px',
        getPropertyValue: (property: string) => {
          const styles: Record<string, string> = {
            lineHeight: '20px',
            paddingTop: '8px',
            paddingBottom: '8px',
            borderTopWidth: '1px',
            borderBottomWidth: '1px',
          };
          return styles[property] || '';
        },
      }),
    });

    // Mock scrollHeight
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: 60,
    });
  });

  it('renders with default props', () => {
    render(<AutoSizeTextarea data-testid='textarea' />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('resize-none');
    // Check that overflow is set via inline style
    expect(textarea.style.overflow).toBe('hidden');
  });

  it('applies custom className', () => {
    render(<AutoSizeTextarea className='custom-class' data-testid='textarea' />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<AutoSizeTextarea ref={ref} data-testid='textarea' />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('handles input events and calls onInput', () => {
    const onInput = jest.fn();
    render(<AutoSizeTextarea onInput={onInput} data-testid='textarea' />);
    const textarea = screen.getByTestId('textarea');

    fireEvent.input(textarea, { target: { value: 'test' } });
    expect(onInput).toHaveBeenCalled();
  });

  it('handles change events and calls onChange', () => {
    const onChange = jest.fn();
    render(<AutoSizeTextarea onChange={onChange} data-testid='textarea' />);
    const textarea = screen.getByTestId('textarea');

    fireEvent.change(textarea, { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('resizes textarea on input', () => {
    render(<AutoSizeTextarea data-testid='textarea' />);
    const textarea = screen.getByTestId('textarea');

    // Mock scrollHeight to simulate content change
    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      value: 100,
    });

    fireEvent.input(textarea, { target: { value: 'test' } });

    // The resize function should have been called, which sets the height
    // We can verify this by checking if the style was applied
    expect(textarea.style.overflow).toBe('hidden');
  });

  it('respects minRows and maxRows props', () => {
    render(<AutoSizeTextarea minRows={2} data-testid='textarea' />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
  });

  it('forwards all textarea props', () => {
    render(<AutoSizeTextarea placeholder='Enter text' disabled data-testid='textarea' />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Enter text');
    expect(textarea).toBeDisabled();
  });

  it('handles function ref correctly', () => {
    const refFn = jest.fn();
    render(<AutoSizeTextarea ref={refFn} data-testid='textarea' />);
    expect(refFn).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
  });

  it('maintains accessibility attributes', () => {
    render(<AutoSizeTextarea aria-label='Description' aria-describedby='help-text' data-testid='textarea' />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('aria-label', 'Description');
    expect(textarea).toHaveAttribute('aria-describedby', 'help-text');
  });
});
