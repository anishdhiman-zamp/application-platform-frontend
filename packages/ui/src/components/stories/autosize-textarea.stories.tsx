import type { Meta, StoryObj } from '@storybook/nextjs';
import { AutoSizeTextarea } from '../ui/autosize-textarea';

const meta = {
  title: 'UI/AutoSizeTextarea',
  component: AutoSizeTextarea,
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    minRows: {
      control: 'number',
      description: 'Minimum number of rows',
    },
    maxHeight: {
      control: 'text',
      description: 'Maximum height (px, %, rem, etc.)',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
  },
  args: {
    placeholder: 'Type something...',
    minRows: 1,
  },
} satisfies Meta<typeof AutoSizeTextarea>;

export default meta;
type Story = StoryObj<typeof AutoSizeTextarea>;

export const Default: Story = {};

export const WithMinRows: Story = {
  args: {
    minRows: 3,
    placeholder: 'This textarea has a minimum of 3 rows',
  },
};

export const WithMaxHeight: Story = {
  args: {
    maxHeight: 150,
    placeholder: 'This textarea has a max height of 150px. Try typing a lot of text...',
  },
};

export const WithDefaultValue: Story = {
  args: {
    defaultValue:
      'This is some default text that demonstrates the auto-sizing behavior. Try adding more lines to see it grow!',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'This textarea is disabled',
  },
};
