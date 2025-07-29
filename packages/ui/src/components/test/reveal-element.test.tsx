import { render, screen } from '@testing-library/react';
import { RevealElement } from '../animations/RevealElement';

// Mock the useInView hook
const mockUseInView = jest.fn();

jest.mock('motion/react', () => ({
  ...jest.requireActual('motion/react'),
  useInView: () => mockUseInView(),
  motion: {
    ...jest.requireActual('motion/react').motion,
    div: jest.fn().mockImplementation(({ children, ...props }) => {
      // Mock motion.div for snapshot testing
      return (
        <div data-testid='motion-div' {...props}>
          {children}
        </div>
      );
    }),
  },
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

    render(
      <RevealElement>
        <div>Test</div>
      </RevealElement>,
    );

    // Verify the animation state through data attributes
    const container = screen.getByTestId('reveal-element');
    expect(container).toHaveAttribute('data-animate-state', 'visible');
  });

  // Snapshot test - hidden state (not in view)
  it('matches snapshot when not in view', () => {
    mockUseInView.mockReturnValue(false);

    const { container } = render(
      <RevealElement className='test-container'>
        <div>Child 1</div>
        <div>Child 2</div>
      </RevealElement>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  // Snapshot test - visible state (in view)
  it('matches snapshot when in view', () => {
    mockUseInView.mockReturnValue(true);

    const { container } = render(
      <RevealElement className='test-container'>
        <div>Visible Child 1</div>
        <div>Visible Child 2</div>
      </RevealElement>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  // Snapshot test - with custom class and multiple children
  it('matches snapshot with custom class and multiple children', () => {
    mockUseInView.mockReturnValue(true);

    const { container } = render(
      <RevealElement className='custom-class'>
        <div className='child-1'>First</div>
        <div className='child-2'>Second</div>
        <div className='child-3'>Third</div>
      </RevealElement>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
