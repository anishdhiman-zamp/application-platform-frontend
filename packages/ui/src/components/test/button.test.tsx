import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { Button } from '../ui/button';

describe('Button Component - Functional Tests', () => {
  it('renders with default props', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const button = getByRole('button');
    expect(button).toHaveTextContent('Click me');
    expect(button).not.toBeDisabled();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('is disabled when `disabled` is true', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    expect(getByRole('button')).toBeDisabled();
  });

  it('shows loader and disables button when `isLoading` is true', () => {
    const { getByRole } = render(<Button isLoading>Loading</Button>);
    const button = getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument(); // Loader2 icon
  });

  it('renders correctly with `asChild`', () => {
    const { getByText } = render(
      <Button asChild>
        <a href='/link'>Go to Link</a>
      </Button>,
    );
    const anchor = getByText('Go to Link');
    expect(anchor.tagName).toBe('A');
    expect(anchor).toHaveAttribute('href', '/link');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>With Ref</Button>);
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('matches snapshot for default button', () => {
    const { container } = render(<Button>Snapshot</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when loading', () => {
    const { container } = render(<Button isLoading>Snapshot</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });
});

const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
const sizes = ['default', 'large', 'medium', 'small', 'xsmall', 'xxsmall', 'icon'] as const;

describe('Button Component - Snapshot Tests for variant & size', () => {
  variants.forEach((variant) => {
    sizes.forEach((size) => {
      it(`renders variant="${variant}" and size="${size}" correctly`, () => {
        const { container } = render(
          <Button variant={variant} size={size}>
            {variant}-{size}
          </Button>,
        );
        expect(container.firstChild).toMatchSnapshot();
      });
    });
  });
});
