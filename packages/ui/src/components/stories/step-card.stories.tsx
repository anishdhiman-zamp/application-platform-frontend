import type { Meta, StoryObj } from '@storybook/nextjs';
import { StepCard } from '..';

const meta = {
  title: 'UI/StepCard',
  component: StepCard,
  argTypes: {
    stepNumber: {
      control: 'number',
      description: 'The step number to display',
    },
    onRemove: {
      action: 'removed',
      description: 'Callback when remove button is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    stepNumber: 1,
    children: 'Step content goes here',
  },
  render: (args) => <StepCard {...args} />,
} satisfies Meta<typeof StepCard>;

export default meta;
type Story = StoryObj<typeof StepCard>;

export const Default: Story = {};

export const WithRemoveButton: Story = {
  args: {
    onRemove: () => {},
  },
};

export const WithCustomClassName: Story = {
  args: {
    className: 'bg-gray-50',
  },
};
