import type { Meta, StoryObj } from '@storybook/nextjs';
import { Switch } from '../ui/switch';

const meta = {
  title: 'UI/Switch',
  component: Switch,
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'small'],
      description: 'Switch size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
    },
    checked: {
      control: 'boolean',
      description: 'Whether the switch is checked',
    },
  },
  args: {
    size: 'default',
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Small: Story = {
  args: {
    size: 'small',
  },
};

export const SmallChecked: Story = {
  args: {
    size: 'small',
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
