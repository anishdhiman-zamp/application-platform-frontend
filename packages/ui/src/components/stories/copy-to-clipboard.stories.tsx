import type { Meta, StoryObj } from '@storybook/react';
import { Button, CopyToClipboard } from '..';
import { Copy } from 'lucide-react';

const meta = {
  title: 'UI/CopyToClipboard',
  component: CopyToClipboard,
  argTypes: {
    text: {
      control: 'text',
      description: 'Text to copy to clipboard',
    },
    tooltipText: {
      control: 'text',
      description: 'Tooltip text shown on hover',
    },
    children: {
      control: false,
      description: 'Child element that triggers the copy action',
    },
  },
  args: {
    text: 'This is the text that will be copied',
    tooltipText: 'Click to copy',
  },
} satisfies Meta<typeof CopyToClipboard>;

export default meta;
type Story = StoryObj<typeof CopyToClipboard>;

export const Default: Story = {
  render: (args) => (
    <div className='flex items-center gap-4 p-8'>
      <CopyToClipboard {...args}>
        <Button variant='outline'>Copy Text</Button>
      </CopyToClipboard>
    </div>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <div className='flex items-center gap-4 p-8'>
      <CopyToClipboard {...args}>
        <Button variant='ghost' size='icon' aria-label='Copy to clipboard'>
          <Copy className='h-4 w-4' />
        </Button>
      </CopyToClipboard>
    </div>
  ),
};

export const WithCustomTooltip: Story = {
  args: {
    tooltipText: 'Copy this text',
  },
  render: (args) => (
    <div className='flex items-center gap-4 p-8'>
      <CopyToClipboard {...args}>
        <Button variant='outline'>Copy with Custom Tooltip</Button>
      </CopyToClipboard>
    </div>
  ),
};

export const WithLongText: Story = {
  args: {
    text: 'This is a very long text that will be copied to the clipboard when you click the button. It contains multiple sentences and demonstrates how the component handles longer content.',
  },
  render: (args) => (
    <div className='flex items-center gap-4 p-8'>
      <CopyToClipboard {...args}>
        <Button variant='outline'>Copy Long Text</Button>
      </CopyToClipboard>
    </div>
  ),
};

export const WithCode: Story = {
  args: {
    text: 'npm install @zamp-platform/ui',
    tooltipText: 'Copy command',
  },
  render: (args) => (
    <div className='flex items-center gap-4 p-8'>
      <CopyToClipboard {...args}>
        <code className='cursor-pointer rounded bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200'>
          npm install @zamp-platform/ui
        </code>
      </CopyToClipboard>
    </div>
  ),
};

export const WithEmail: Story = {
  args: {
    text: 'user@example.com',
    tooltipText: 'Copy email',
  },
  render: (args) => (
    <div className='flex items-center gap-4 p-8'>
      <CopyToClipboard {...args}>
        <Button variant='ghost' size='icon' aria-label='Copy email'>
          <Copy className='h-4 w-4' />
        </Button>
      </CopyToClipboard>
      <span className='text-sm text-gray-600'>user@example.com</span>
    </div>
  ),
};

export const WithLink: Story = {
  args: {
    text: 'https://example.com/very/long/url/path',
    tooltipText: 'Copy link',
  },
  render: (args) => (
    <div className='flex max-w-md items-center gap-4 p-8'>
      <CopyToClipboard {...args}>
        <Button variant='ghost' size='icon' aria-label='Copy link'>
          <Copy className='h-4 w-4' />
        </Button>
      </CopyToClipboard>
      <span className='truncate text-sm text-gray-600'>https://example.com/very/long/url/path</span>
    </div>
  ),
};

export const MultipleInstances: Story = {
  render: () => (
    <div className='flex flex-col gap-4 p-8'>
      <div className='flex items-center gap-2'>
        <CopyToClipboard text='First text to copy' tooltipText='Copy first'>
          <Button variant='outline' size='small'>
            Copy 1
          </Button>
        </CopyToClipboard>
      </div>
      <div className='flex items-center gap-2'>
        <CopyToClipboard text='Second text to copy' tooltipText='Copy second'>
          <Button variant='outline' size='small'>
            Copy 2
          </Button>
        </CopyToClipboard>
      </div>
      <div className='flex items-center gap-2'>
        <CopyToClipboard text='Third text to copy' tooltipText='Copy third'>
          <Button variant='outline' size='small'>
            Copy 3
          </Button>
        </CopyToClipboard>
      </div>
    </div>
  ),
};
