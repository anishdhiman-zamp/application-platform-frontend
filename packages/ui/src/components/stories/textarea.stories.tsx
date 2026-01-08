import type { Meta, StoryObj } from '@storybook/nextjs';
import { Textarea } from '../ui/textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    placeholder: 'Type your message here...',
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue: 'This is some default text in the textarea.',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'This textarea is disabled',
  },
};

export const CustomSize: Story = {
  args: {
    className: 'min-h-[120px]',
    placeholder: 'This textarea has a custom minimum height',
  },
};
