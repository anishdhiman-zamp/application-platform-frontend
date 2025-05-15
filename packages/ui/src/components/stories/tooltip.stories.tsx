import type { Meta, StoryObj } from '@storybook/react';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '..';

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  argTypes: {
    defaultOpen: {
      control: 'boolean',
      description: 'Whether the tooltip is open by default',
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state of the tooltip',
    },
    onOpenChange: {
      action: 'open changed',
      description: 'Callback when open state changes',
    },
    delayDuration: {
      control: 'number',
      description: 'Duration from when the mouse enters the trigger until the tooltip opens',
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant='outline'>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithCustomContent: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant='outline'>Hover for more info</Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className='space-y-1'>
          <p className='font-medium'>Important Information</p>
          <p className='text-xs'>This is a detailed tooltip with multiple lines of text.</p>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
};

export const DifferentPositions: Story = {
  render: (args) => (
    <div className='flex flex-wrap gap-8 p-8'>
      <div className='flex flex-col items-center gap-4'>
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button variant='outline'>Top Tooltip</Button>
          </TooltipTrigger>
          <TooltipContent side='top' sideOffset={8}>
            <p>Tooltip on top</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className='flex flex-col items-center gap-4'>
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button variant='outline'>Right Tooltip</Button>
          </TooltipTrigger>
          <TooltipContent side='right' sideOffset={8}>
            <p>Tooltip on right</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className='flex flex-col items-center gap-4'>
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button variant='outline'>Bottom Tooltip</Button>
          </TooltipTrigger>
          <TooltipContent side='bottom' sideOffset={8}>
            <p>Tooltip on bottom</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className='flex flex-col items-center gap-4'>
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button variant='outline'>Left Tooltip</Button>
          </TooltipTrigger>
          <TooltipContent side='left' sideOffset={8}>
            <p>Tooltip on left</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  ),
};
