import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sheet,
  SHEET_ANIMATION_DURATION,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetHeaderActions,
  SheetHeaderTitle,
  SheetTrigger,
} from '../ui/sheet';

jest.useFakeTimers();

describe('Sheet Component - Functional Tests', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Controlled Behavior', () => {
    it('handles open/close with animation delay', async () => {
      const handleOpenChange = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <Sheet open onOpenChange={handleOpenChange}>
          <SheetContent showCloseButton>
            <p>Test Content</p>
          </SheetContent>
        </Sheet>,
      );

      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(handleOpenChange).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(SHEET_ANIMATION_DURATION);
      });

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('toggles visibility based on `open` prop', () => {
      const { rerender } = render(
        <Sheet open={false}>
          <SheetContent>
            <p>Test</p>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(
        <Sheet open>
          <SheetContent>
            <p>Test</p>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('SheetContent Variants', () => {
    it('applies custom className', () => {
      render(
        <Sheet open>
          <SheetContent className='custom-class'>
            <p>Test</p>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByRole('dialog')).toHaveClass('custom-class');
    });

    it('renders close button only when `showCloseButton` is true', () => {
      const { rerender } = render(
        <Sheet open>
          <SheetContent showCloseButton>
            <p>Test</p>
          </SheetContent>
        </Sheet>,
      );
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();

      rerender(
        <Sheet open>
          <SheetContent showCloseButton={false}>
            <p>Test</p>
          </SheetContent>
        </Sheet>,
      );
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });

    it('applies size and side variants correctly', () => {
      const { rerender } = render(
        <Sheet open>
          <SheetContent size='medium' side='right'>
            <p>Test</p>
          </SheetContent>
        </Sheet>,
      );
      let dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('w-[450px]', 'right-0');

      rerender(
        <Sheet open>
          <SheetContent size='large' side='left'>
            <p>Test</p>
          </SheetContent>
        </Sheet>,
      );
      dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('w-[600px]', 'left-0');
    });
  });

  describe('Layout Components', () => {
    it('renders header layout and custom classes', () => {
      render(
        <Sheet open>
          <SheetContent>
            <SheetHeader className='custom-header'>
              <SheetHeaderTitle className='custom-title'>Test Title</SheetHeaderTitle>
              <SheetHeaderActions className='custom-actions'>
                <button>Act</button>
              </SheetHeaderActions>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByText('Test Title')).toHaveClass('custom-title');
      expect(screen.getByText('Act').parentElement).toHaveClass('custom-actions');
    });

    it('renders SheetBody and supports custom class', () => {
      render(
        <Sheet open>
          <SheetContent>
            <SheetBody className='custom-body'>
              <p>Content</p>
            </SheetBody>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByText('Content').parentElement).toHaveClass('custom-body');
    });
  });

  describe('Integration', () => {
    it('opens via trigger and closes with animation', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent showCloseButton>
            <p>Content</p>
          </SheetContent>
        </Sheet>,
      );

      await user.click(screen.getByText('Open'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /close/i }));
      act(() => {
        jest.advanceTimersByTime(SHEET_ANIMATION_DURATION);
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // Critical snapshots that could break component usage
  it('matches snapshot for basic sheet', () => {
    const { container } = render(
      <Sheet open>
        <SheetContent>
          <p>Basic Sheet</p>
        </SheetContent>
      </Sheet>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for sheet with all components', () => {
    const { container } = render(
      <Sheet open>
        <SheetContent title='Title' description='Desc' showCloseButton>
          <SheetHeader>
            <SheetHeaderTitle>Header</SheetHeaderTitle>
            <SheetHeaderActions>
              <button>A</button>
            </SheetHeaderActions>
          </SheetHeader>
          <SheetBody>
            <p>Body</p>
          </SheetBody>
        </SheetContent>
      </Sheet>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for sheet with different sizes', () => {
    const { container } = render(
      <Sheet open>
        <SheetContent size='large' side='left'>
          <p>Large Left Sheet</p>
        </SheetContent>
      </Sheet>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for sheet with close button', () => {
    const { container } = render(
      <Sheet open>
        <SheetContent showCloseButton>
          <p>Sheet with Close</p>
        </SheetContent>
      </Sheet>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for sheet with custom classes', () => {
    const { container } = render(
      <Sheet open>
        <SheetContent className='custom-sheet'>
          <SheetHeader className='custom-header'>
            <SheetHeaderTitle>Custom Sheet</SheetHeaderTitle>
          </SheetHeader>
          <SheetBody className='custom-body'>
            <p>Custom Content</p>
          </SheetBody>
        </SheetContent>
      </Sheet>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
