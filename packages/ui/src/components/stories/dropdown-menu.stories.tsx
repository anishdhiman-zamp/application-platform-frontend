import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const meta = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  argTypes: {
    defaultOpen: {
      control: 'boolean',
      description: 'Whether the dropdown is open by default',
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state',
    },
    onOpenChange: {
      action: 'open changed',
      description: 'Callback when open state changes',
    },
  },
  args: {
    children: (
      <>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
        </DropdownMenuContent>
      </>
    ),
  },
  render: (args) => <DropdownMenu {...args} />,
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {};

export const WithCheckboxes: Story = {
  args: {
    children: (
      <>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Checkbox Items</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>Show Status Bar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Show Activity Bar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Show Panel</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </>
    ),
  },
};

export const WithRadioGroup: Story = {
  args: {
    children: (
      <>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Radio Items</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value='pedro'>
            <DropdownMenuRadioItem value='pedro'>Pedro</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='colm'>Colm</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </>
    ),
  },
};

export const WithSubMenu: Story = {
  args: {
    children: (
      <>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Sub Menu Example</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More Tools</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Save As...</DropdownMenuItem>
              <DropdownMenuItem>Create a Copy</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </>
    ),
  },
};
