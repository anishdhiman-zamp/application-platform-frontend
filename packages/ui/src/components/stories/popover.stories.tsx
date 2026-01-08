import type { Meta, StoryObj } from '@storybook/nextjs';
import { Popover, PopoverContent, PopoverTrigger, PopoverMenuItem } from '../ui/popover';
import { Button } from '../ui/button';

const meta = {
  title: 'UI/Popover',
  component: Popover,
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the popover is open',
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className='text-sm'>This is a popover content.</p>
      </PopoverContent>
    </Popover>
  ),
};

export const WithMenuItems: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>Open Menu</Button>
      </PopoverTrigger>
      <PopoverContent className='w-48'>
        <PopoverMenuItem>Edit</PopoverMenuItem>
        <PopoverMenuItem>Duplicate</PopoverMenuItem>
        <PopoverMenuItem>Delete</PopoverMenuItem>
      </PopoverContent>
    </Popover>
  ),
};

export const CustomPosition: Story = {
  render: () => (
    <div className='flex gap-4'>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Top</Button>
        </PopoverTrigger>
        <PopoverContent side='top'>
          <p className='text-sm'>Popover on top</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Bottom</Button>
        </PopoverTrigger>
        <PopoverContent side='bottom'>
          <p className='text-sm'>Popover on bottom</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Left</Button>
        </PopoverTrigger>
        <PopoverContent side='left'>
          <p className='text-sm'>Popover on left</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Right</Button>
        </PopoverTrigger>
        <PopoverContent side='right'>
          <p className='text-sm'>Popover on right</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
