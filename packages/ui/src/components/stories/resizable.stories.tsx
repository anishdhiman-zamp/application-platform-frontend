import type { Meta, StoryObj } from '@storybook/nextjs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../ui/resizable';

const meta = {
  title: 'UI/Resizable',
  component: ResizablePanelGroup,
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Direction of the resizable panels',
    },
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof ResizablePanelGroup>;

export const Horizontal: Story = {
  render: () => (
    <ResizablePanelGroup direction='horizontal' className='min-h-[200px] max-w-md rounded-lg border'>
      <ResizablePanel defaultSize={50}>
        <div className='flex h-full items-center justify-center p-6'>
          <span className='font-semibold'>Panel One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className='flex h-full items-center justify-center p-6'>
          <span className='font-semibold'>Panel Two</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup direction='vertical' className='min-h-[300px] max-w-md rounded-lg border'>
      <ResizablePanel defaultSize={50}>
        <div className='flex h-full items-center justify-center p-6'>
          <span className='font-semibold'>Top Panel</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className='flex h-full items-center justify-center p-6'>
          <span className='font-semibold'>Bottom Panel</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const ThreePanels: Story = {
  render: () => (
    <ResizablePanelGroup direction='horizontal' className='min-h-[200px] max-w-lg rounded-lg border'>
      <ResizablePanel defaultSize={25}>
        <div className='flex h-full items-center justify-center p-6'>
          <span className='font-semibold'>Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className='flex h-full items-center justify-center p-6'>
          <span className='font-semibold'>Content</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25}>
        <div className='flex h-full items-center justify-center p-6'>
          <span className='font-semibold'>Details</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const WithoutHandle: Story = {
  render: () => (
    <ResizablePanelGroup direction='horizontal' className='min-h-[200px] max-w-md rounded-lg border'>
      <ResizablePanel defaultSize={50}>
        <div className='flex h-full items-center justify-center p-6'>
          <span className='font-semibold'>Panel One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className='flex h-full items-center justify-center p-6'>
          <span className='font-semibold'>Panel Two</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
