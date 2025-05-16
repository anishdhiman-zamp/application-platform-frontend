import type { Meta, StoryObj } from '@storybook/react';
import { Label, Radio, RadioGroup } from '..';

const meta = {
  title: 'UI/Radio',
  component: Radio,
  argTypes: {
    value: {
      control: 'text',
      description: 'Value of the radio button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the radio is disabled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  decorators: [
    (Story) => (
      <RadioGroup defaultValue='option-1'>
        <div className='flex items-center space-x-2'>
          <Story />
          <Label htmlFor='option-1'>Option 1</Label>
        </div>
      </RadioGroup>
    ),
  ],
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  args: {
    value: 'option-1',
    id: 'option-1',
  },
};

export const Disabled: Story = {
  args: {
    value: 'option-1',
    id: 'option-1',
    disabled: true,
  },
};

export const MultipleOptions: Story = {
  render: () => (
    <RadioGroup defaultValue='option-1'>
      <div className='flex flex-col space-y-2'>
        <div className='flex items-center space-x-2'>
          <Radio value='option-1' id='option-1' />
          <Label htmlFor='option-1'>Option 1</Label>
        </div>
        <div className='flex items-center space-x-2'>
          <Radio value='option-2' id='option-2' />
          <Label htmlFor='option-2'>Option 2</Label>
        </div>
        <div className='flex items-center space-x-2'>
          <Radio value='option-3' id='option-3' disabled />
          <Label htmlFor='option-3'>Option 3 (Disabled)</Label>
        </div>
      </div>
    </RadioGroup>
  ),
};
