import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { Input } from '../ui/input';

describe('Input Component - Functional Tests', () => {
  it('renders with default props', () => {
    const { getByRole } = render(<Input placeholder='Enter text' />);
    const input = getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).not.toBeDisabled();
  });

  it('calls onChange handler when value changes', () => {
    const handleChange = jest.fn();
    const { getByRole } = render(<Input onChange={handleChange} />);
    const input = getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when `disabled` is true', () => {
    const { getByRole } = render(<Input disabled />);
    expect(getByRole('textbox')).toBeDisabled();
  });

  it('renders with error variant when `error` is true', () => {
    const { getByRole } = render(<Input error />);
    const input = getByRole('textbox');
    expect(input).toHaveClass('border-destructive');
  });

  it('renders with custom type', () => {
    const { getByDisplayValue } = render(<Input type='password' defaultValue='test' />);
    const input = getByDisplayValue('test');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders with icon in leading position', () => {
    const { container } = render(<Input icon={<span data-testid='icon'>🔍</span>} iconPosition='leading' />);
    const icon = container.querySelector('[data-testid="icon"]');
    expect(icon).toBeInTheDocument();
    expect(icon?.parentElement).toHaveClass('left-3'); // medium size default
  });

  it('renders with icon in trailing position', () => {
    const { container } = render(<Input icon={<span data-testid='icon'>🔍</span>} iconPosition='trailing' />);
    const icon = container.querySelector('[data-testid="icon"]');
    expect(icon).toBeInTheDocument();
    expect(icon?.parentElement).toHaveClass('right-3'); // medium size default
  });

  it('applies correct padding when icon is present', () => {
    const { getByRole } = render(<Input icon={<span>🔍</span>} iconPosition='leading' />);
    const input = getByRole('textbox');
    expect(input).toHaveClass('pl-9'); // medium size with leading icon
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <Input
        ref={(instance) => {
          ref.current = instance;
        }}
      />,
    );
    expect(ref.current?.tagName).toBe('INPUT');
  });

  it('applies custom className', () => {
    const { getByRole } = render(<Input className='custom-class' />);
    const input = getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('applies wrapperClassName to wrapper div', () => {
    const { container } = render(<Input wrapperClassName='wrapper-class' />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('wrapper-class');
  });

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
});

const variants = ['default', 'error'] as const;
const sizes = ['xlarge', 'large', 'medium', 'small', 'xsmall', 'xxsmall'] as const;

describe('Input Component - Snapshot Tests for variant & size', () => {
  variants.forEach((variant) => {
    sizes.forEach((size) => {
      it(`renders variant="${variant}" and size="${size}" correctly`, () => {
        const { container } = render(<Input variant={variant} size={size} placeholder={`${variant}-${size}`} />);
        expect(container.firstChild).toMatchSnapshot();
      });
    });
  });
});

describe('Input Component - Icon Position Tests', () => {
  const iconPositions = ['leading', 'trailing'] as const;

  iconPositions.forEach((position) => {
    sizes.forEach((size) => {
      it(`renders with icon position="${position}" and size="${size}" correctly`, () => {
        const { container } = render(
          <Input
            icon={<span data-testid='icon'>🔍</span>}
            iconPosition={position}
            size={size}
            placeholder={`${position}-${size}`}
          />,
        );
        expect(container.firstChild).toMatchSnapshot();
      });
    });
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
