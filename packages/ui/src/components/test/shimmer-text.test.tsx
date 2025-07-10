import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { ShimmerText } from '../animations';

// Mock the Web Animation API
beforeEach(() => {
  // @ts-ignore
  global.Element.prototype.animate = jest.fn(function () {
    return {
      onfinish: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      finish: jest.fn(),
    };
  });
});

describe('ShimmerText Component', () => {
  it('renders with default props', () => {
    const { container } = render(<ShimmerText text='Test Text' />);

    // Check if base text is rendered with correct classes
    const baseText = screen.getByText((content, element) => {
      return content === 'Test Text' && !element?.getAttribute('aria-hidden');
    });
    expect(baseText).toBeInTheDocument();
    expect(baseText).toHaveClass('text-[#C0C0C0]');

    // Check if shimmer element is present with correct classes
    const shimmerElement = container.querySelector('span[aria-hidden="true"]');
    expect(shimmerElement).toBeInTheDocument();
    expect(shimmerElement).toHaveClass('absolute', 'top-0', 'left-0');
    expect(shimmerElement).toHaveTextContent('Test Text');

    // Check if the component matches snapshot
    expect(container.firstChild).toMatchSnapshot();
  });

  it('applies custom class names correctly', () => {
    render(
      <ShimmerText
        text='Custom Class Test'
        baseTextClassName='custom-base-class'
        shimmerTextClassName='custom-shimmer-class'
      />,
    );

    // Check base text class
    const baseText = screen.getByText((content, element) => {
      return content === 'Custom Class Test' && !element?.getAttribute('aria-hidden');
    });
    expect(baseText).toHaveClass('custom-base-class');

    // Check shimmer text class
    const shimmerText = screen.getByText((content, element) => {
      return content === 'Custom Class Test' && element?.getAttribute('aria-hidden') === 'true';
    });
    expect(shimmerText).toHaveClass('custom-shimmer-class');
  });

  it('exposes animation control via ref', () => {
    const shimmerControlRef = React.createRef<(() => void) | null>();

    render(<ShimmerText text='Animated Text' shimmerControlRef={shimmerControlRef} />);

    // Check if the ref callback is set
    expect(shimmerControlRef.current).toBeDefined();

    // Trigger the animation
    if (shimmerControlRef.current) {
      shimmerControlRef.current();

      // Check if animate was called with correct parameters
      expect(Element.prototype.animate).toHaveBeenCalledWith(
        { backgroundPosition: ['120% 0%', '-20% 0%'] },
        { duration: 2000, easing: 'linear', fill: 'forwards' },
      );
    } else {
      throw new Error('shimmerControlRef.current is null');
    }
  });

  it('cleans up ref on unmount', () => {
    const shimmerControlRef = { current: null } as React.MutableRefObject<(() => void) | null>;

    const { unmount } = render(<ShimmerText text='Unmount Test' shimmerControlRef={shimmerControlRef} />);

    // Before unmount, ref should be set
    expect(shimmerControlRef.current).not.toBeNull();

    // After unmount, ref should be null
    unmount();
    expect(shimmerControlRef.current).toBeNull();
  });

  it('matches snapshot with default props', () => {
    const { container } = render(<ShimmerText text='Snapshot Test' />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom classes', () => {
    const { container } = render(
      <ShimmerText text='Snapshot Test' baseTextClassName='custom-base' shimmerTextClassName='custom-shimmer' />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
