import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from '..';

const meta = {
  title: 'UI/Tag',
  component: Tag,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'blue', 'yellow', 'orange', 'green', 'violet', 'outline', 'ghost', 'pink', 'gray'],
      description: 'Tag variant',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    children: 'Tag',
  },
  render: (args) => <Tag {...args} />,
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {};

export const Blue: Story = {
  args: {
    variant: 'blue',
  },
};

export const Yellow: Story = {
  args: {
    variant: 'yellow',
  },
};

export const Orange: Story = {
  args: {
    variant: 'orange',
  },
};

export const Green: Story = {
  args: {
    variant: 'green',
  },
};

export const Violet: Story = {
  args: {
    variant: 'violet',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
};

export const Pink: Story = {
  args: {
    variant: 'pink',
  },
};

export const Gray: Story = {
  args: {
    variant: 'gray',
  },
};

export const WithCustomClassName: Story = {
  args: {
    className: 'font-bold',
  },
};
