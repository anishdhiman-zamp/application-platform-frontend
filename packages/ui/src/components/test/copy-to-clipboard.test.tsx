import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { CopyToClipboard } from '../ui/copy-to-clipboard';

// Mock clipboard API at module level
const mockWriteText = jest.fn();

// Mock requestAnimationFrame helpers
let rafId = 0;
const rafCallbacks: FrameRequestCallback[] = [];

const flushRAF = () => {
  while (rafCallbacks.length > 0) {
    const cb = rafCallbacks.shift();
    if (cb) cb(performance.now());
  }
};

describe('CopyToClipboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
    rafId = 0;
    rafCallbacks.length = 0;

    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });

    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return ++rafId;
    }) as typeof requestAnimationFrame;
  });

  afterEach(() => {
    jest.clearAllMocks();
    rafCallbacks.length = 0;
  });

  it('renders children correctly', () => {
    render(
      <CopyToClipboard text='test text'>
        <button>Copy</button>
      </CopyToClipboard>,
    );
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    render(
      <CopyToClipboard text='test text' tooltipText='Click to copy'>
        <button>Copy</button>
      </CopyToClipboard>,
    );

    const button = screen.getByText('Copy');

    act(() => {
      fireEvent.mouseEnter(button);
    });

    // Flush RAF callbacks (component uses double RAF)
    act(() => {
      flushRAF();
      flushRAF();
    });

    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('copies text to clipboard on click', async () => {
    render(
      <CopyToClipboard text='test text'>
        <button>Copy</button>
      </CopyToClipboard>,
    );

    const button = screen.getByText('Copy');

    fireEvent.click(button);

    // Wait for the async clipboard call to complete
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('test text');
    });
  });

  it('shows "Copied!" message after copying', async () => {
    render(
      <CopyToClipboard text='test text' tooltipText='Click to copy'>
        <button>Copy</button>
      </CopyToClipboard>,
    );

    const button = screen.getByText('Copy');

    fireEvent.click(button);

    // Wait for clipboard call to complete
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
    });

    // Flush RAF callbacks (component uses double RAF)
    act(() => {
      flushRAF();
      flushRAF();
    });

    // Wait for tooltip to show "Copied!"
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('Copied!');
    });
  });

  it('resets tooltip text after 1 second', async () => {
    jest.useFakeTimers();

    render(
      <CopyToClipboard text='test text' tooltipText='Click to copy'>
        <button>Copy</button>
      </CopyToClipboard>,
    );

    const button = screen.getByText('Copy');

    fireEvent.click(button);

    // Wait for clipboard call to complete
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
    });

    // Flush RAF callbacks
    act(() => {
      flushRAF();
      flushRAF();
    });

    // Wait for "Copied!" to appear
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Copied!');
    });

    // Fast-forward 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for tooltip to reset (after 200ms delay)
    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      const tooltip = screen.queryByRole('tooltip');
      // Tooltip should be hidden after reset
      expect(tooltip).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('uses custom tooltip text', async () => {
    render(
      <CopyToClipboard text='test text' tooltipText='Custom tooltip'>
        <button>Copy</button>
      </CopyToClipboard>,
    );

    const button = screen.getByText('Copy');

    act(() => {
      fireEvent.mouseEnter(button);
    });

    // Flush RAF callbacks (component uses double RAF)
    act(() => {
      flushRAF();
      flushRAF();
    });

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Custom tooltip');
    });
  });

  it('does not show tooltip when copying is in progress', async () => {
    render(
      <CopyToClipboard text='test text' tooltipText='Click to copy'>
        <button>Copy</button>
      </CopyToClipboard>,
    );

    const button = screen.getByText('Copy');

    fireEvent.click(button);

    // Wait for clipboard call to complete
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
    });

    // Flush RAF callbacks
    act(() => {
      flushRAF();
      flushRAF();
    });

    // Wait for "Copied!" to appear first
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Copied!');
    });

    // Try to hover while copying
    act(() => {
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
    });

    // Tooltip should still show "Copied!" and not close
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('Copied!');
    });
  });

  it('cleans up timeouts on unmount', () => {
    jest.useFakeTimers();

    const { unmount } = render(
      <CopyToClipboard text='test text'>
        <button>Copy</button>
      </CopyToClipboard>,
    );

    const button = screen.getByText('Copy');
    fireEvent.click(button);

    // Unmount before timeout completes
    unmount();

    // Fast-forward time - should not cause errors
    jest.advanceTimersByTime(2000);

    jest.useRealTimers();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <CopyToClipboard text='test text' tooltipText='Click to copy'>
        <button>Copy Button</button>
      </CopyToClipboard>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with icon child', () => {
    const { container } = render(
      <CopyToClipboard text='test text'>
        <span>📋</span>
      </CopyToClipboard>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
