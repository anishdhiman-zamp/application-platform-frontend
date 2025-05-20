import type { Meta, StoryObj } from '@storybook/react';
import { Button, Toaster, toast } from '..';

const meta: Meta<typeof Toaster> = {
  title: 'UI/Toast',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Button onClick={() => toast('This is a default toast')}>Show Default Toast</Button>
      <Toaster />
    </div>
  ),
};

export const Success: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Button onClick={() => toast.success('This is a success toast')} variant='outline'>
        Show Success Toast
      </Button>
      <Toaster />
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Button onClick={() => toast.error('This is an error toast')} variant='destructive'>
        Show Error Toast
      </Button>
      <Toaster />
    </div>
  ),
};

export const Warning: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Button onClick={() => toast.warning('This is a warning toast')} variant='secondary'>
        Show Warning Toast
      </Button>
      <Toaster />
    </div>
  ),
};
