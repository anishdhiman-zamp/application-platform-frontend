import type { Meta, StoryObj } from '@storybook/nextjs';
import { Input } from '..';

const meta = {
  title: 'UI/Input',
  component: Input,
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url', 'search'],
      description: 'Input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    placeholder: 'Enter text...',
  },
  render: (args) => <Input {...args} />,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithType: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithCustomClassName: Story = {
  args: {
    className: 'bg-gray-50',
  },
};
