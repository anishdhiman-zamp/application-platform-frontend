import '@testing-library/jest-dom';
import { render, screen, cleanup } from '@testing-library/react';
import * as React from 'react';
import { ShimmerText } from '../animations';

// Mock the Web Animations API
beforeEach(() => {
  // @ts-ignore
  window.Element.prototype.animate = jest.fn().mockImplementation(() => ({
    cancel: jest.fn(),
    onfinish: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    finish: jest.fn(),
  }));

  // Mock getComputedStyle
  const mockGetComputedStyle = jest.fn().mockImplementation((element: HTMLElement) => {
    const style: Record<string, any> = {
      color: element.style.color || 'rgb(192, 192, 192)', // Use actual inline style if set
      backgroundImage: '',
      backgroundSize: '200% 100%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '120% 0%',
    };

    Object.defineProperty(style, 'getPropertyValue', {
      value: jest.fn((prop: string) => style[prop] || ''),
    });

    return style;
  });

  Object.defineProperty(window, 'getComputedStyle', {
    value: mockGetComputedStyle,
  });
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('ShimmerText', () => {
  // Test case 1: Base text color
  describe('Base Text Color', () => {
    it('applies custom base color when provided', () => {
      const customColor = '#ff0000';
      const { container } = render(<ShimmerText text='Test' baseColor={customColor} />);
      const baseText = container.firstChild?.firstChild as HTMLElement;
      expect(baseText).toBeInTheDocument();

      // Check that the color is applied by getting the computed style
      const computedColor = window.getComputedStyle(baseText).color;
      expect(computedColor).toBe('rgb(255, 0, 0)');
    });

    it('falls back to default color when not provided', () => {
      const { container } = render(<ShimmerText text='Test' />);
      const baseText = container.firstChild?.firstChild as HTMLElement;
      expect(baseText).toBeInTheDocument();

      // Check that some color is applied
      const computedColor = window.getComputedStyle(baseText).color;
      expect(computedColor).toBeTruthy();
    });
  });

  // Test case 2: Shimmer effect color
  describe('Shimmer Effect', () => {
    it('applies shimmer effect with custom color', () => {
      const shimmerColor = '#00ff00';
      const { container } = render(<ShimmerText text='Test' shimmerColor={shimmerColor} />);
      const shimmerElement = container.querySelector('span[aria-hidden="true"]') as HTMLElement;
      expect(shimmerElement).toBeInTheDocument();
      expect(shimmerElement).toHaveStyle({
        backgroundImage: expect.stringContaining('linear-gradient'),
      });
    });
  });

  // Test case 3: Animation duration
  describe('Animation', () => {
    it('respects custom animation duration', () => {
      const duration = 1000;
      render(<ShimmerText text='Test' animationDuration={duration} />);
      expect(window.Element.prototype.animate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          duration,
          easing: 'linear',
          fill: 'forwards',
        }),
      );
    });

    it('auto-animates when autoAnimate is true', () => {
      render(<ShimmerText text='Test' autoAnimate={true} />);
      expect(window.Element.prototype.animate).toHaveBeenCalled();
    });

    it('does not auto-animate when autoAnimate is false', () => {
      render(<ShimmerText text='Test' autoAnimate={false} />);
      expect(window.Element.prototype.animate).not.toHaveBeenCalled();
    });
  });

  // Test case 4: Class names
  describe('Class Names', () => {
    it('applies custom class to base text', () => {
      const customClass = 'custom-base-class';
      const { container } = render(<ShimmerText text='Test' baseTextClassName={customClass} />);
      const baseText = container.firstChild?.firstChild as HTMLElement;
      expect(baseText).toBeInTheDocument();
      expect(baseText).toHaveClass(customClass);
    });

    it('applies custom class to shimmer text', () => {
      const customClass = 'custom-shimmer-class';
      const { container } = render(<ShimmerText text='Test' shimmerTextClassName={customClass} />);
      const shimmerElement = container.querySelector('span[aria-hidden="true"]');
      expect(shimmerElement).toHaveClass(customClass);
    });
  });

  // Test case 5: Text content
  describe('Text Content', () => {
    it('renders the provided text', () => {
      const testText = 'Hello, World!';
      const { container } = render(<ShimmerText text={testText} />);
      const baseText = container.firstChild?.firstChild as HTMLElement;
      expect(baseText).toBeInTheDocument();
      expect(baseText).toHaveTextContent(testText);
    });

    it('handles empty string', () => {
      const { container } = render(<ShimmerText text='' />);
      const baseText = container.querySelector('span:not([aria-hidden])');
      expect(baseText).toBeInTheDocument();
      expect(baseText).toHaveTextContent('');
    });
  });

  // Test case 6: Ref control
  describe('Ref Control', () => {
    it('exposes animation control via ref', () => {
      const ref = React.createRef<any>();
      render(<ShimmerText text='Test' shimmerControlRef={ref} />);
      expect(typeof ref.current).toBe('function');
    });

    it('triggers animation when ref is called', () => {
      const ref = React.createRef<any>();
      render(<ShimmerText text='Test' shimmerControlRef={ref} />);

      // Clear any initial calls to animate
      (window.Element.prototype.animate as jest.Mock).mockClear();

      // Trigger animation via ref
      ref.current?.();

      // Verify animation was triggered
      expect(window.Element.prototype.animate).toHaveBeenCalled();
    });

    it('does not auto-animate when autoAnimate is false', () => {
      const shimmerControlRef = React.createRef<(() => void) | null>();

      // Spy on the animate method
      const animateSpy = jest.spyOn(Element.prototype, 'animate');

      render(<ShimmerText text='No Auto Animate Test' autoAnimate={false} shimmerControlRef={shimmerControlRef} />);

      // Animation should not be called automatically
      expect(animateSpy).not.toHaveBeenCalled();

      // Clean up
      animateSpy.mockRestore();
    });
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
