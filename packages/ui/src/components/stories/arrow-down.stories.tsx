import type { Meta, StoryObj } from '@storybook/nextjs';
import { useRef } from 'react';
import { ArrowDownIcon, ArrowDownIconHandle } from '../ui/arrow-down';
import { Button } from '../ui/button';

const meta = {
  title: 'UI/ArrowDownIcon',
  component: ArrowDownIcon,
  argTypes: {
    size: {
      control: 'number',
      description: 'Size of the icon in pixels',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    size: 28,
  },
} satisfies Meta<typeof ArrowDownIcon>;

export default meta;
type Story = StoryObj<typeof ArrowDownIcon>;

export const Default: Story = {
  render: (args) => (
    <div className='p-4'>
      <p className='mb-2 text-sm text-gray-500'>Hover over the icon to see the animation</p>
      <ArrowDownIcon {...args} />
    </div>
  ),
};

export const SmallSize: Story = {
  args: {
    size: 16,
  },
  render: (args) => (
    <div className='p-4'>
      <p className='mb-2 text-sm text-gray-500'>Small icon (16px)</p>
      <ArrowDownIcon {...args} />
    </div>
  ),
};

export const LargeSize: Story = {
  args: {
    size: 48,
  },
  render: (args) => (
    <div className='p-4'>
      <p className='mb-2 text-sm text-gray-500'>Large icon (48px)</p>
      <ArrowDownIcon {...args} />
    </div>
  ),
};

const ControlledArrowDemo = () => {
  const arrowRef = useRef<ArrowDownIconHandle>(null);

  return (
    <div className='space-y-4 p-4'>
      <p className='text-sm text-gray-500'>Use the buttons to control the animation programmatically</p>
      <ArrowDownIcon ref={arrowRef} size={32} />
      <div className='flex gap-2'>
        <Button variant='outline' size='small' onClick={() => arrowRef.current?.startAnimation()}>
          Start Animation
        </Button>
        <Button variant='outline' size='small' onClick={() => arrowRef.current?.stopAnimation()}>
          Stop Animation
        </Button>
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledArrowDemo />,
};

export const WithCustomColor: Story = {
  args: {
    className: 'text-blue-500',
  },
  render: (args) => (
    <div className='p-4'>
      <p className='mb-2 text-sm text-gray-500'>Custom color (blue)</p>
      <ArrowDownIcon {...args} />
    </div>
  ),
};
