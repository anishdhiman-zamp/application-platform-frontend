import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { DrilldownMenu, type MenuNode } from '../ui/DrilldownMenu';

describe('DrilldownMenu Component', () => {
  const mockHandleClick = jest.fn();
  const mockOnPointerEnter = jest.fn();

  const basicMenu: MenuNode = {
    id: 'root',
    label: 'Root',
    children: [
      {
        id: 'item1',
        label: 'Item 1',
        action: jest.fn(),
      },
      {
        id: 'item2',
        label: 'Item 2',
        action: jest.fn(),
      },
    ],
  };

  const nestedMenu: MenuNode = {
    id: 'root',
    label: 'Root',
    children: [
      {
        id: 'settings',
        label: 'Settings',
        backText: 'Back to main',
        children: [
          {
            id: 'profile',
            label: 'Profile',
            action: jest.fn(),
          },
          {
            id: 'account',
            label: 'Account',
            action: jest.fn(),
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the trigger button', () => {
      render(
        <DrilldownMenu menuNode={basicMenu} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      expect(screen.getByText('Open Menu')).toBeInTheDocument();
    });

    it('does not show menu content initially', () => {
      render(
        <DrilldownMenu menuNode={basicMenu} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });

    it('opens menu when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DrilldownMenu menuNode={basicMenu} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
      });
    });
  });

  describe('Menu Navigation', () => {
    it('navigates forward when clicking an item with children', async () => {
      const user = userEvent.setup();
      render(
        <DrilldownMenu menuNode={nestedMenu} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Settings'));
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Account')).toBeInTheDocument();
      });
    });

    it('shows back button when navigated to child menu', async () => {
      const user = userEvent.setup();
      render(
        <DrilldownMenu menuNode={nestedMenu} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Settings'));
      await waitFor(() => {
        expect(screen.getByText('Back to main')).toBeInTheDocument();
      });
    });

    it('navigates back when back button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DrilldownMenu menuNode={nestedMenu} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Settings'));
      await waitFor(() => {
        expect(screen.getByText('Back to main')).toBeInTheDocument();
      });

      // Find the back button by its accessible role and partial text match
      const backButton = screen.getByRole('button', { name: /back to main/i });
      await user.click(backButton);

      // Wait for Profile to disappear (animation exit completes)
      await waitFor(
        () => {
          expect(screen.queryByText('Profile')).not.toBeInTheDocument();
        },
        { timeout: 2000 },
      );

      // Then verify the menu shows root level items
      await waitFor(
        () => {
          expect(screen.getByText('Settings')).toBeInTheDocument();
          expect(screen.queryByText('Back to main')).not.toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  });

  describe('Item Clicking', () => {
    it('calls handleClick when clicking a leaf item', async () => {
      const user = userEvent.setup();
      render(
        <DrilldownMenu menuNode={basicMenu} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Item 1'));

      await waitFor(() => {
        expect(mockHandleClick).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'item1',
            label: 'Item 1',
          }),
        );
      });
    });

    it('calls item action when clicking a leaf item', async () => {
      const user = userEvent.setup();
      const itemAction = jest.fn();
      const menuWithAction: MenuNode = {
        id: 'root',
        label: 'Root',
        children: [
          {
            id: 'action-item',
            label: 'Action Item',
            action: itemAction,
          },
        ],
      };

      render(
        <DrilldownMenu menuNode={menuWithAction} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('Action Item')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Action Item'));

      await waitFor(() => {
        expect(itemAction).toHaveBeenCalled();
      });
    });

    it('closes menu after clicking a leaf item', async () => {
      const user = userEvent.setup();
      render(
        <DrilldownMenu menuNode={basicMenu} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Item 1'));

      await waitFor(() => {
        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Icons', () => {
    it('renders icon when provided as ReactNode', async () => {
      const user = userEvent.setup();
      const menuWithIcon: MenuNode = {
        id: 'root',
        label: 'Root',
        children: [
          {
            id: 'icon-item',
            label: 'Icon Item',
            icon: createElement(Settings),
          },
        ],
      };

      render(
        <DrilldownMenu menuNode={menuWithIcon} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('Icon Item')).toBeInTheDocument();
        // Find SVG by looking for it within the menu item
        const menuItem = screen.getByText('Icon Item').closest('[role="menuitem"]');
        expect(menuItem).toBeInTheDocument();
        const svg = menuItem?.querySelector('svg');
        expect(svg).toBeTruthy();
      });
    });

    it('renders iconSrc when provided', async () => {
      const user = userEvent.setup();
      const menuWithIconSrc: MenuNode = {
        id: 'root',
        label: 'Root',
        children: [
          {
            id: 'icon-src-item',
            label: 'Icon Src Item',
            iconSrc: '/test-icon.png',
          },
        ],
      };

      render(
        <DrilldownMenu menuNode={menuWithIconSrc} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        const image = screen.getByAltText('Icon Src Item');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/test-icon.png');
      });
    });

    it('prioritizes iconSrc over icon', async () => {
      const user = userEvent.setup();
      const menuWithBoth: MenuNode = {
        id: 'root',
        label: 'Root',
        children: [
          {
            id: 'both-icons',
            label: 'Both Icons',
            icon: createElement(Settings),
            iconSrc: '/test-icon.png',
          },
        ],
      };

      render(
        <DrilldownMenu menuNode={menuWithBoth} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        const image = screen.getByAltText('Both Icons');
        expect(image).toBeInTheDocument();
        // Should show image, not the ReactNode icon
        const menuItem = screen.getByText('Both Icons').closest('[role="menuitem"]');
        expect(menuItem).toBeInTheDocument();
        const img = menuItem?.querySelector('img');
        expect(img).toBeTruthy();
        // Verify no SVG is present (iconSrc should take priority)
        const svg = menuItem?.querySelector('svg');
        expect(svg).toBeFalsy();
      });
    });
  });

  describe('Descriptions', () => {
    it('renders description when provided', async () => {
      const user = userEvent.setup();
      const menuWithDescription: MenuNode = {
        id: 'root',
        label: 'Root',
        children: [
          {
            id: 'desc-item',
            label: 'Item with Description',
            description: 'This is a description',
          },
        ],
      };

      render(
        <DrilldownMenu menuNode={menuWithDescription} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('This is a description')).toBeInTheDocument();
      });
    });

    it('does not render description when not provided', async () => {
      const user = userEvent.setup();
      render(
        <DrilldownMenu menuNode={basicMenu} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        // No description elements should be present
        const descriptions = screen.queryAllByText(/description/i);
        expect(descriptions).toHaveLength(0);
      });
    });
  });

  describe('Hover Actions', () => {
    it('calls onPointerEnter when hovering over item with isHoverActionEnabled', async () => {
      const user = userEvent.setup();
      const menuWithHover: MenuNode = {
        id: 'root',
        label: 'Root',
        children: [
          {
            id: 'hover-item',
            label: 'Hover Item',
            isHoverActionEnabled: true,
          },
        ],
      };

      render(
        <DrilldownMenu menuNode={menuWithHover} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('Hover Item')).toBeInTheDocument();
      });

      const hoverItem = screen.getByText('Hover Item');
      await user.hover(hoverItem);

      await waitFor(() => {
        expect(mockOnPointerEnter).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'hover-item',
            label: 'Hover Item',
            isHoverActionEnabled: true,
          }),
        );
      });
    });

    it('does not call onPointerEnter when hovering over item without isHoverActionEnabled', async () => {
      const user = userEvent.setup();
      render(
        <DrilldownMenu menuNode={basicMenu} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      const item1 = screen.getByText('Item 1');
      await user.hover(item1);

      // Should not be called since isHoverActionEnabled is not set
      expect(mockOnPointerEnter).not.toHaveBeenCalled();
    });
  });

  describe('Custom Render Function', () => {
    it('renders custom content when render function is provided', async () => {
      const user = userEvent.setup();
      const menuWithRender: MenuNode = {
        id: 'root',
        label: 'Root',
        render: ({ goBack }) => (
          <div>
            <button onClick={goBack}>Custom Back</button>
            <div>Custom Content</div>
          </div>
        ),
      };

      render(
        <DrilldownMenu menuNode={menuWithRender} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('Custom Content')).toBeInTheDocument();
        expect(screen.getByText('Custom Back')).toBeInTheDocument();
      });
    });

    it('provides goBack function in render context', async () => {
      const user = userEvent.setup();
      const goBackSpy = jest.fn();
      const menuWithRender: MenuNode = {
        id: 'root',
        label: 'Root',
        render: ({ goBack }) => {
          goBackSpy(goBack);
          return <div>Custom</div>;
        },
      };

      render(
        <DrilldownMenu menuNode={menuWithRender} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(goBackSpy).toHaveBeenCalled();
        expect(typeof goBackSpy.mock.calls[0][0]).toBe('function');
      });
    });
  });

  describe('Menu Reset', () => {
    it('resets to root when menu is closed', async () => {
      const user = userEvent.setup();
      render(
        <DrilldownMenu menuNode={nestedMenu} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Open Menu</Button>
        </DrilldownMenu>,
      );

      // Open menu and navigate to child
      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Settings'));
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
      });

      // Close menu (by clicking outside or pressing escape)
      await user.keyboard('{Escape}');

      // Reopen menu - should be at root
      await user.click(screen.getByText('Open Menu'));
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.queryByText('Profile')).not.toBeInTheDocument();
      });
    });
  });

  describe('Trigger rendering', () => {
    it('renders custom trigger without nested button (uses asChild)', () => {
      render(
        <DrilldownMenu menuNode={basicMenu} handleClick={mockHandleClick} onPointerEnter={mockOnPointerEnter}>
          <Button>Custom Trigger</Button>
        </DrilldownMenu>,
      );

      expect(screen.getByText('Custom Trigger')).toBeInTheDocument();
    });
  });
});
