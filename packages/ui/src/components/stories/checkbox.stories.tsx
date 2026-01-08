import type { Meta, StoryObj } from '@storybook/nextjs';
import { Checkbox, Label } from '..';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    onCheckedChange: {
      action: 'checked changed',
      description: 'Callback when checked state changes',
    },
    id: {
      control: 'text',
      description: 'ID of the checkbox',
    },
  },
  args: {
    id: 'terms',
  },
  decorators: [
    (Story) => (
      <div className='flex items-center space-x-2 rounded-lg bg-white p-4'>
        <Story />
        <Label htmlFor='terms'>Accept terms and conditions</Label>
      </div>
    ),
  ],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};
