import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import DisplayField from 'modules/process/artifacts/components/pdf-dataset-artifact/dataset-row/DisplayField';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('@zamp-platform/ui/assets', () => ({
  SvgSpriteLoader: ({ id, size, color }: { id: string; size: number; color: string }) => (
    <span data-testid={`svg-${id}`} data-size={size} data-color={color} />
  ),
}));

jest.mock('@zamp-platform/ui/utils', () => ({
  cn: (...classes: (string | boolean | undefined | Record<string, boolean>)[]) => {
    return classes
      .filter((c) => typeof c === 'string')
      .concat(
        classes
          .filter((c) => typeof c === 'object' && c !== null)
          .flatMap((c) =>
            Object.entries(c as Record<string, boolean>)
              .filter(([, v]) => v)
              .map(([k]) => k),
          ),
      )
      .join(' ');
  },
}));

jest.mock('@/components/common/TooltipV2', () => ({
  __esModule: true,
  default: ({ children, tooltipBody }: { children: React.ReactNode; tooltipBody: React.ReactNode }) => (
    <div data-testid='tooltip-wrapper'>
      <div data-testid='tooltip-body'>{tooltipBody}</div>
      {children}
    </div>
  ),
}));

jest.mock('@/modules/process/process.constant', () => ({
  N_A_VALUE: 'N/A',
}));

jest.mock('@/modules/process/process.utils', () => ({
  formatRowValue: (value: string) => value || 'N/A',
}));

// Mock clipboard API
const mockClipboard = {
  writeText: jest.fn().mockResolvedValue(undefined),
};

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

jest.mock('@/utils/common', () => ({
  copyToClipBoard: (text: string) => {
    navigator.clipboard.writeText(text);
  },
}));

describe('DisplayField', () => {
  const defaultProps = {
    value: 'Test Value',
    isCompleted: false,
    isClicked: false,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the field value correctly', () => {
      render(<DisplayField {...defaultProps} />);

      expect(screen.getByText('Test Value')).toBeInTheDocument();
    });

    it('should render N/A when value is empty', () => {
      render(<DisplayField {...defaultProps} value='' />);

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should apply completed styles when isCompleted is true', () => {
      render(<DisplayField {...defaultProps} isCompleted={true} />);

      const fieldElement = screen.getByText('Test Value').closest('div');

      expect(fieldElement).toHaveClass('bg-ORANGE_100');
    });

    it('should apply clicked styles when isClicked is true', () => {
      render(<DisplayField {...defaultProps} isClicked={true} />);

      const fieldElement = screen.getByText('Test Value').closest('div');

      expect(fieldElement).toHaveClass('border-BLUE_700');
    });

    it('should apply max-w-full when isPdfDataset is true', () => {
      render(<DisplayField {...defaultProps} isPdfDataset={true} />);

      const fieldElement = screen.getByText('Test Value').closest('div');

      expect(fieldElement).toHaveClass('max-w-full');
    });
  });

  describe('Tooltip', () => {
    it('should show "Click to copy" tooltip initially', () => {
      render(<DisplayField {...defaultProps} />);

      expect(screen.getByText('Click to copy')).toBeInTheDocument();
    });

    it('should show "Copied!" tooltip after clicking', async () => {
      render(<DisplayField {...defaultProps} />);

      const fieldElement = screen.getByText('Test Value').closest('div');

      fireEvent.click(fieldElement!);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('should show checkmark icon when copied', async () => {
      render(<DisplayField {...defaultProps} />);

      const fieldElement = screen.getByText('Test Value').closest('div');

      fireEvent.click(fieldElement!);

      await waitFor(() => {
        expect(screen.getByTestId('svg-check')).toBeInTheDocument();
      });
    });

    it('should revert to "Click to copy" after 2 seconds', async () => {
      render(<DisplayField {...defaultProps} />);

      const fieldElement = screen.getByText('Test Value').closest('div');

      fireEvent.click(fieldElement!);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Click to copy')).toBeInTheDocument();
      });
    });
  });

  describe('Copy Functionality', () => {
    it('should copy the value to clipboard when clicked', () => {
      render(<DisplayField {...defaultProps} />);

      const fieldElement = screen.getByText('Test Value').closest('div');

      fireEvent.click(fieldElement!);

      expect(mockClipboard.writeText).toHaveBeenCalledWith('Test Value');
    });

    it('should call onClick callback when clicked', () => {
      const mockOnClick = jest.fn();

      render(<DisplayField {...defaultProps} onClick={mockOnClick} />);

      const fieldElement = screen.getByText('Test Value').closest('div');

      fireEvent.click(fieldElement!);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should copy formatted value for complex data', () => {
      const complexValue = 'USD 2000';

      render(<DisplayField {...defaultProps} value={complexValue} />);

      const fieldElement = screen.getByText(complexValue).closest('div');

      fireEvent.click(fieldElement!);

      expect(mockClipboard.writeText).toHaveBeenCalledWith(complexValue);
    });
  });

  describe('Double Click', () => {
    it('should call onDoubleClick when provided and double-clicked', () => {
      const mockOnDoubleClick = jest.fn();

      render(<DisplayField {...defaultProps} onDoubleClick={mockOnDoubleClick} />);

      const fieldElement = screen.getByText('Test Value').closest('div');

      fireEvent.doubleClick(fieldElement!);

      expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have cursor-pointer class for clickable indication', () => {
      render(<DisplayField {...defaultProps} />);

      const fieldElement = screen.getByText('Test Value').closest('div');

      expect(fieldElement).toHaveClass('cursor-pointer');
    });

    it('should have select-none class to prevent text selection', () => {
      render(<DisplayField {...defaultProps} />);

      const fieldElement = screen.getByText('Test Value').closest('div');

      expect(fieldElement).toHaveClass('select-none');
    });
  });

  describe('Text Styling', () => {
    it('should apply custom textClassName when provided', () => {
      render(<DisplayField {...defaultProps} textClassName='custom-class' />);

      const spanElement = screen.getByText('Test Value');

      expect(spanElement).toHaveClass('custom-class');
    });
  });
});
