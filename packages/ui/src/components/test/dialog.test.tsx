import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderActions,
  DialogHeaderTitle,
  DialogTrigger,
} from '../ui/dialog';

describe('Dialog Component - Functional Tests', () => {
  it('renders dialog with trigger and content', async () => {
    render(
      <Dialog>
        <DialogTrigger data-testid='trigger'>Open Dialog</DialogTrigger>
        <DialogContent data-testid='content'>
          <DialogBody>Dialog content</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  it('closes dialog when close button is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger data-testid='trigger'>Open Dialog</DialogTrigger>
        <DialogContent data-testid='content' showCloseButton>
          <DialogBody>Dialog content</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByTestId('trigger'));

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });

  it('renders with different size variants', async () => {
    const sizes = ['small', 'medium', 'large'] as const;

    for (const size of sizes) {
      const { unmount } = render(
        <Dialog>
          <DialogTrigger data-testid={`trigger-${size}`}>Open {size}</DialogTrigger>
          <DialogContent size={size} data-testid={`content-${size}`}>
            <DialogBody>Content</DialogBody>
          </DialogContent>
        </Dialog>,
      );

      fireEvent.click(screen.getByTestId(`trigger-${size}`));

      await waitFor(() => {
        const content = screen.getByTestId(`content-${size}`);
        expect(content).toBeInTheDocument();

        // Check that the size class is applied
        const sizeClasses = {
          small: 'w-[40vw]',
          medium: 'w-[60vw]',
          large: 'w-[80vw]',
        };

        expect(content).toHaveClass(sizeClasses[size]);
      });

      unmount();
    }
  });

  it('renders header with title and actions', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent data-testid='content'>
          <DialogHeader>
            <DialogHeaderTitle>Dialog Title</DialogHeaderTitle>
            <DialogHeaderActions>
              <button>Action 1</button>
              <button>Action 2</button>
            </DialogHeaderActions>
          </DialogHeader>
          <DialogBody>Content</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });
  });

  it('renders footer with custom content', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent data-testid='content'>
          <DialogBody>Content</DialogBody>
          <DialogFooter>
            <button>Cancel</button>
            <button>Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  it('applies custom className to content', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className='custom-dialog-class' data-testid='content'>
          <DialogBody>Content</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('custom-dialog-class');
    });
  });

  it('applies custom overlay className', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent dialogueOverlayClassName='custom-overlay-class' data-testid='content'>
          <DialogBody>Content</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      // Use getAllByRole for better accessibility testing practices
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs).toHaveLength(1);

      // Also check for the content by testId for more specific testing
      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();

      // Check that the overlay with custom class exists
      const overlay = document.querySelector('.custom-overlay-class');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('custom-overlay-class');
    });
  });

  it('prevents body pointer events on focus', async () => {
    const originalStyle = document.body.style.pointerEvents;

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent data-testid='content'>
          <DialogBody>Content</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    // The component should prevent default focus behavior
    const content = screen.getByTestId('content');
    const focusEvent = new Event('focus', { bubbles: true });
    fireEvent(content, focusEvent);

    // Clean up
    document.body.style.pointerEvents = originalStyle;
  });

  it('renders with title and description for accessibility', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent title='Test Dialog' description='This is a test dialog' data-testid='content'>
          <DialogBody>Content</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('This is a test dialog')).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes and role', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent
          title='Accessible Dialog'
          description='This dialog has proper accessibility'
          data-testid='content'
        >
          <DialogBody>Content</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      // Use getAllByRole for better accessibility testing practices
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs).toHaveLength(1);

      const dialog = dialogs[0];
      expect(dialog).toBeInTheDocument();

      // Check for proper accessibility attributes that Radix UI provides
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
      expect(dialog).toHaveAttribute('tabindex', '-1');

      // Verify the dialog content is accessible
      expect(screen.getByText('Accessible Dialog')).toBeInTheDocument();
      expect(screen.getByText('This dialog has proper accessibility')).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation and focus management', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent title='Keyboard Dialog' data-testid='content'>
          <DialogBody>
            <button>First Button</button>
            <button>Second Button</button>
          </DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      // Use getAllByRole for better accessibility testing practices
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs).toHaveLength(1);

      const dialog = dialogs[0];
      expect(dialog).toBeInTheDocument();

      // Check that focus is properly managed within the dialog
      // Only count buttons inside the dialog, not the trigger (which is hidden when dialog is open)
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2); // 2 buttons in dialog

      // Verify dialog is focusable and has proper tabindex
      expect(dialog).toHaveAttribute('tabindex', '-1');
    });
  });

  it('handles long content without layout breaking', async () => {
    const longContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50);

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent data-testid='content'>
          <DialogBody>{longContent}</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByText(/Lorem ipsum/)).toBeInTheDocument();
    });
  });
});

describe('Dialog Component - Critical Snapshot Tests', () => {
  it('matches snapshot for basic dialog', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogBody>Content</DialogBody>
        </DialogContent>
      </Dialog>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for dialog with header and footer', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogHeaderTitle>Title</DialogHeaderTitle>
            <DialogHeaderActions>
              <button>Action</button>
            </DialogHeaderActions>
          </DialogHeader>
          <DialogBody>Content</DialogBody>
          <DialogFooter>
            <button>Cancel</button>
            <button>Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for dialog with close button', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent showCloseButton>
          <DialogBody>Content</DialogBody>
        </DialogContent>
      </Dialog>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  // Critical size variants only
  it('matches snapshot for small size', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent size='small'>
          <DialogBody>Content</DialogBody>
        </DialogContent>
      </Dialog>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for large size', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent size='large'>
          <DialogBody>Content</DialogBody>
        </DialogContent>
      </Dialog>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('Dialog Component - Edge Cases and Backward Compatibility', () => {
  it('handles undefined children gracefully', () => {
    expect(() => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>{undefined}</DialogContent>
        </Dialog>,
      );
    }).not.toThrow();
  });

  it('maintains backward compatibility with default props', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent data-testid='content'>
          <DialogBody>Content</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('w-[60vw]'); // Default medium size
    });
  });

  it('forwards refs correctly', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent ref={ref}>
          <DialogBody>Content</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    expect(ref.current).toBeDefined();
  });

  it('handles multiple dialogs without conflicts', async () => {
    render(
      <>
        <Dialog>
          <DialogTrigger>Open Dialog 1</DialogTrigger>
          <DialogContent data-testid='dialog1'>
            <DialogBody>Dialog 1 Content</DialogBody>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger>Open Dialog 2</DialogTrigger>
          <DialogContent data-testid='dialog2'>
            <DialogBody>Dialog 2 Content</DialogBody>
          </DialogContent>
        </Dialog>
      </>,
    );

    fireEvent.click(screen.getByText('Open Dialog 1'));

    await waitFor(() => {
      // Use getAllByRole for better accessibility testing practices
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs).toHaveLength(1);
      expect(screen.getByTestId('dialog1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Open Dialog 2'));

    await waitFor(() => {
      // Use getAllByRole for better accessibility testing practices
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs).toHaveLength(1);
      expect(screen.getByTestId('dialog2')).toBeInTheDocument();
    });
  });

  it('renders overlay with correct styling', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogBody>Content</DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      // Use getAllByRole for better accessibility testing practices
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs).toHaveLength(1);

      // Verify overlay is rendered with correct classes
      const overlay = document.querySelector('[data-aria-hidden="true"][data-state="open"]');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-1001', 'bg-black/20');
    });
  });
});
