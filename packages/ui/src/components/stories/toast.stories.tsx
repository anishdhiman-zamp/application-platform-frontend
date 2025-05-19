import type { Meta, StoryObj } from '@storybook/react';
import { Button, Toaster, toast } from '..';
import { X } from 'lucide-react';

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
      <div className='flex gap-2'>
        <Button onClick={() => toast('This is a default toast')}>Default Toast</Button>
        <Button onClick={() => toast.success('This is a success toast')} variant='outline'>
          Success Toast
        </Button>
        <Button onClick={() => toast.error('This is an error toast')} variant='destructive'>
          Error Toast
        </Button>
      </div>
      <Toaster />
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Button
        onClick={() =>
          toast('Event saved', {
            description: 'Your event has been saved successfully.',
          })
        }
      >
        Toast with Description
      </Button>
      <Toaster />
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Button
        onClick={() =>
          toast('Undo changes', {
            action: {
              label: 'Undo',
              onClick: () => console.log('Undo clicked'),
            },
          })
        }
      >
        Toast with Action
      </Button>
      <Toaster />
    </div>
  ),
};

export const PromiseToast: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Button
        onClick={() => {
          const promise = new Promise((resolve) => setTimeout(resolve, 2000));
          toast.promise(promise, {
            loading: 'Loading...',
            success: 'Successfully loaded!',
            error: 'Something went wrong.',
          });
        }}
      >
        Promise Toast
      </Button>
      <Toaster />
    </div>
  ),
};

export const CustomToast: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Button
        onClick={() =>
          toast.custom((t) => (
            <div className='flex items-center justify-between gap-1.5 p-5'>
              <p className='f-14-400 text-gray-950'>The evil rabbit jumped over the fence.</p>
              <X size={16} onClick={() => toast.dismiss(t)} className='cursor-pointer' />
            </div>
          ))
        }
      >
        Custom Toast
      </Button>
      <Toaster />
    </div>
  ),
};
