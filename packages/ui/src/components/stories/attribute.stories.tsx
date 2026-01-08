import type { Meta, StoryObj } from '@storybook/nextjs';
import { Attribute } from '..';

const meta = {
  title: 'UI/Attribute',
  component: Attribute,
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the attribute',
    },
    displayValue: {
      control: 'text',
      description: 'Value to display',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    dataContextId: {
      control: 'text',
      description: 'Data context ID for the attribute',
    },
  },
  args: {
    label: 'Status',
    displayValue: 'Active',
  },
  render: (args) => <Attribute {...args} />,
} satisfies Meta<typeof Attribute>;

export default meta;
type Story = StoryObj<typeof Attribute>;

export const Default: Story = {};

export const WithCustomClassName: Story = {
  args: {
    className: 'bg-green-50 border-green-200',
  },
};

export const WithDataContext: Story = {
  args: {
    label: 'ID',
    displayValue: '12345',
    dataContextId: 'user-id',
  },
};

export const WithReactNode: Story = {
  render: (args) => <Attribute {...args} displayValue={<span className='text-green-500'>● Active</span>} />,
};
