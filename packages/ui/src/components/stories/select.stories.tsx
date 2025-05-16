import type { Meta, StoryObj } from '@storybook/react';
import { Select, SelectOption } from '..';

const defaultOptions: SelectOption[] = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
  { label: 'Option 4', value: '4' },
  { label: 'Option 5', value: '5' },
];

const meta = {
  title: 'UI/Select',
  component: Select,
  argTypes: {
    variant: {
      control: 'select',
      options: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
      description: 'Size variant of the select input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no option is selected',
    },
    label: {
      control: 'text',
      description: 'Label text for the select input',
    },
    value: {
      control: 'text',
      description: 'Currently selected value',
    },
    onValueChange: {
      action: 'value changed',
      description: 'Callback when value changes',
    },
    onBlur: {
      action: 'blurred',
      description: 'Callback when select loses focus',
    },
  },
  args: {
    options: defaultOptions,
    placeholder: 'Select an option',
    variant: 'medium',
  },
  render: (args) => <Select {...args} />,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'Select Label',
  },
};

export const WithValue: Story = {
  args: {
    value: '2',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className='space-y-4'>
      <Select
        options={defaultOptions}
        placeholder='XLarge select'
        variant='xlarge'
        onValueChange={(value) => console.log('Selected value:', value)}
      />
      <Select
        options={defaultOptions}
        placeholder='Large select'
        variant='large'
        onValueChange={(value) => console.log('Selected value:', value)}
      />
      <Select
        options={defaultOptions}
        placeholder='Medium select'
        variant='medium'
        onValueChange={(value) => console.log('Selected value:', value)}
      />
      <Select
        options={defaultOptions}
        placeholder='Small select'
        variant='small'
        onValueChange={(value) => console.log('Selected value:', value)}
      />
      <Select
        options={defaultOptions}
        placeholder='XSmall select'
        variant='xsmall'
        onValueChange={(value) => console.log('Selected value:', value)}
      />
    </div>
  ),
};
