import type { Meta, StoryObj } from '@storybook/react';
import { MoreVertical } from 'lucide-react';
import { ListCard } from '..';
import { Button } from '../ui/button';

const meta = {
  title: 'UI/ListCard',
  component: ListCard,
  argTypes: {
    header: {
      control: 'text',
      description: 'Header text of the list card',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    header: 'List Card',
    children: 'List content goes here',
  },
  render: (args) => <ListCard {...args} />,
} satisfies Meta<typeof ListCard>;

export default meta;
type Story = StoryObj<typeof ListCard>;

export const Default: Story = {};

export const WithRightComponent: Story = {
  args: {
    header: 'With Right Component',
    rightComponent: (
      <Button variant='ghost' size='icon'>
        <MoreVertical className='h-4 w-4' />
      </Button>
    ),
  },
};

export const WithDropdownOptions: Story = {
  args: {
    header: 'With Dropdown Options',
    rightComponent: (
      <div className='flex items-center gap-2'>
        <Button variant='ghost' size='small'>
          Edit
        </Button>
        <Button variant='ghost' size='small'>
          Delete
        </Button>
      </div>
    ),
  },
};

export const WithCustomClassName: Story = {
  args: {
    className: 'bg-gray-50',
  },
};
