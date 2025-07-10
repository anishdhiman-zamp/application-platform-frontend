import { render, screen } from '@testing-library/react';
import { RevealElement } from '../animations/RevealElement';
import { motion } from 'motion/react';

// Mock the useInView hook
const mockUseInView = jest.fn();

jest.mock('motion/react', () => ({
  ...jest.requireActual('motion/react'),
  useInView: () => mockUseInView(),
}));

describe('RevealElement', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Default mock implementation
    mockUseInView.mockReturnValue(false);
  });

  it('renders children with default props', () => {
    render(
      <RevealElement>
        <div>Test Child</div>
      </RevealElement>,
    );

    const child = screen.getByText('Test Child');
    const container = screen.getByTestId('reveal-element');
    const childContainer = screen.getByTestId('reveal-element-child');

    expect(container).toBeInTheDocument();
    expect(childContainer).toBeInTheDocument();
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test Child');
  });

  it('applies custom className', () => {
    const { container } = render(
      <RevealElement className='custom-class'>
        <div>Test</div>
      </RevealElement>,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders multiple children with proper keys', () => {
    render(
      <RevealElement>
        <div key='1'>First</div>
        <div key='2'>Second</div>
      </RevealElement>,
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('handles non-element children', () => {
    render(
      <RevealElement>
        {null}
        {undefined}
        {false}
        {'string child'}
        {123}
      </RevealElement>,
    );

    // Only string and number children should be rendered
    expect(screen.getByText('string child')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('applies animation variants when in view', () => {
    // Set the mock to return true for inView
    mockUseInView.mockReturnValue(true);

    const { container } = render(
      <RevealElement>
        <div>Test</div>
      </RevealElement>,
    );

    // The animation state should be 'visible' when in view
    const motionDiv = container.firstChild as HTMLElement;
    expect(motionDiv).toHaveAttribute('style');
    // The style will be set by framer-motion, we can't directly test the exact values
    // as they're handled by the animation library
  });
});
