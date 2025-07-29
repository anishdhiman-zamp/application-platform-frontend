import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

describe('DropdownMenu Components', () => {
  it('renders basic dropdown menu structure', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await userEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders item with inset class', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await userEvent.click(screen.getByText('Open'));
    const item = screen.getByText('Inset Item');
    expect(item).toHaveClass('pl-8');
  });

  it('renders checkbox item and toggles checked state', async () => {
    const handleSelect = jest.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked onSelect={handleSelect}>
            Enable Feature
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await userEvent.click(screen.getByText('Open'));
    await userEvent.click(screen.getByText('Enable Feature'));

    expect(handleSelect).toHaveBeenCalledTimes(1);
    // The checked state is controlled by the checked prop, not by clicking
    // So we should verify the checkbox is still checked after clicking
    expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('data-state', 'checked');
    expect(screen.getByText('Enable Feature')).toBeInTheDocument();
  });
  it('renders radio items inside a radio group', async () => {
    const onValueChange = jest.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value='option1' onValueChange={onValueChange}>
            <DropdownMenuRadioItem value='option1'>Option 1</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='option2'>Option 2</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await userEvent.click(screen.getByText('Open'));
    await userEvent.click(screen.getByText('Option 2'));

    expect(onValueChange).toHaveBeenCalledWith('option2');
    // After clicking, the dropdown closes, so we can't find the text anymore
    // Instead, verify the callback was called with the correct value
    expect(onValueChange).toHaveBeenCalledWith('option2');
  });

  it('renders sub menu with trigger and content', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await userEvent.click(screen.getByText('Open'));
    await userEvent.click(screen.getByText('More'));
    expect(screen.getByText('Sub Item')).toBeInTheDocument();
  });

  it('renders label, separator and shortcut', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Save <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await userEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('⌘S')).toBeInTheDocument();
  });

  it('matches full menu structure snapshot', async () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>Enable Setting</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value='b'>
            <DropdownMenuRadioItem value='a'>A</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='b'>B</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Option</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await userEvent.click(screen.getByText('Menu'));
    expect(container).toMatchSnapshot();
  });
});
