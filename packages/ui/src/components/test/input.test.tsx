import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { Input } from '../ui/input';

describe('Input Component - Functional Tests', () => {
  it('renders with default props', () => {
    const { getByTestId } = render(<Input placeholder='Enter text' data-testid='input' />);
    const input = getByTestId('input');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).not.toBeDisabled();
  });

  it('calls onChange handler when value changes', () => {
    const handleChange = jest.fn();
    const { getByTestId } = render(<Input onChange={handleChange} data-testid='input' />);
    const input = getByTestId('input');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when `disabled` is true', () => {
    const { getByTestId } = render(<Input disabled data-testid='input' />);
    expect(getByTestId('input')).toBeDisabled();
  });

  it('renders with error variant when `error` is true', () => {
    const { getByTestId } = render(<Input error data-testid='input' />);
    const input = getByTestId('input');
    expect(input).toHaveClass('border-destructive');
  });

  it('renders with custom type', () => {
    const { getByTestId } = render(<Input type='password' defaultValue='test' data-testid='input' />);
    const input = getByTestId('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders with icon in leading position', () => {
    const { getByTestId } = render(
      <Input icon={<span data-testid='icon'>🔍</span>} iconPosition='leading' data-testid='input' />,
    );
    const icon = getByTestId('icon');
    expect(icon).toBeInTheDocument();
    expect(icon?.parentElement).toHaveClass('left-3'); // medium size default
  });

  it('renders with icon in trailing position', () => {
    const { getByTestId } = render(
      <Input icon={<span data-testid='icon'>🔍</span>} iconPosition='trailing' data-testid='input' />,
    );
    const icon = getByTestId('icon');
    expect(icon).toBeInTheDocument();
    expect(icon?.parentElement).toHaveClass('right-3'); // medium size default
  });

  it('applies correct padding when icon is present', () => {
    const { getByTestId } = render(<Input icon={<span>🔍</span>} iconPosition='leading' data-testid='input' />);
    const input = getByTestId('input');
    expect(input).toHaveClass('pl-9'); // medium size with leading icon
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <Input
        ref={(instance) => {
          ref.current = instance;
        }}
        data-testid='input'
      />,
    );
    expect(ref.current?.tagName).toBe('INPUT');
  });

  it('applies custom className', () => {
    const { getByTestId } = render(<Input className='custom-class' data-testid='input' />);
    const input = getByTestId('input');
    expect(input).toHaveClass('custom-class');
  });

  it('applies wrapperClassName to wrapper div', () => {
    const { container } = render(<Input wrapperClassName='wrapper-class' data-testid='input' />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('wrapper-class');
  });

  // Critical snapshots that could break component usage
  it('matches snapshot for default input', () => {
    const { container } = render(<Input placeholder='Snapshot' />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when error is true', () => {
    const { container } = render(<Input error placeholder='Error' />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with icon', () => {
    const { container } = render(<Input icon={<span>🔍</span>} placeholder='With Icon' />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for large size', () => {
    const { container } = render(<Input size='large' placeholder='Large Input' />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for small size', () => {
    const { container } = render(<Input size='small' placeholder='Small Input' />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

// Removed excessive variant/size combinations - keeping only critical ones
describe('Input Component - Critical Variant Tests', () => {
  it('renders all variants correctly', () => {
    const variants = ['default', 'error'] as const;

    variants.forEach((variant) => {
      const { container } = render(<Input variant={variant} placeholder={`${variant} variant`} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  it('renders all sizes correctly', () => {
    const sizes = ['xlarge', 'large', 'medium', 'small', 'xsmall', 'xxsmall'] as const;

    sizes.forEach((size) => {
      const { container } = render(<Input size={size} placeholder={`${size} size`} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});

describe('Input Component - Icon Position Tests', () => {
  it('renders with leading icon correctly', () => {
    const { container } = render(
      <Input icon={<span data-testid='icon'>🔍</span>} iconPosition='leading' placeholder='Leading Icon' />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with trailing icon correctly', () => {
    const { container } = render(
      <Input icon={<span data-testid='icon'>🔍</span>} iconPosition='trailing' placeholder='Trailing Icon' />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('Input Component - Backward Compatibility Tests', () => {
  it('works with legacy size prop', () => {
    const { getByRole } = render(<Input size='large' />);
    const input = getByRole('textbox');
    expect(input).toHaveClass('h-12'); // large size class
  });

  it('works with legacy variant prop', () => {
    const { getByRole } = render(<Input variant='default' />);
    const input = getByRole('textbox');
    expect(input).toHaveClass('border-input'); // default variant class
  });

  it('maintains all HTML input attributes', () => {
    const { getByDisplayValue } = render(
      <Input
        name='test-input'
        id='test-id'
        value='test-value'
        placeholder='test placeholder'
        required
        readOnly
        maxLength={10}
        minLength={2}
        pattern='[A-Za-z]{3}'
        autoComplete='email'
      />,
    );
    const input = getByDisplayValue('test-value');
    expect(input).toHaveAttribute('name', 'test-input');
    expect(input).toHaveAttribute('id', 'test-id');
    expect(input).toHaveAttribute('value', 'test-value');
    expect(input).toHaveAttribute('placeholder', 'test placeholder');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('maxlength', '10');
    expect(input).toHaveAttribute('minlength', '2');
    expect(input).toHaveAttribute('pattern', '[A-Za-z]{3}');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('handles controlled input correctly', () => {
    const { getByDisplayValue } = render(<Input value='controlled value' onChange={() => {}} />);
    const input = getByDisplayValue('controlled value');
    expect(input).toHaveAttribute('value', 'controlled value');
  });

  it('handles uncontrolled input correctly', () => {
    const { getByDisplayValue } = render(<Input defaultValue='uncontrolled value' />);
    const input = getByDisplayValue('uncontrolled value');
    expect(input).toHaveAttribute('value', 'uncontrolled value');
  });
});
