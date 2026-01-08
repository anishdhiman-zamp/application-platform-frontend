import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { SelectButton, SelectButtonOption } from '../ui/select-button';

const meta = {
  title: 'UI/SelectButton',
  component: SelectButton,
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'large', 'medium', 'small', 'xsmall', 'xxsmall', 'icon'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select button is disabled',
    },
  },
} satisfies Meta<typeof SelectButton>;

export default meta;
type Story = StoryObj<typeof SelectButton>;

const basicOptions: SelectButtonOption[] = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

const SelectButtonDemo = ({ options = basicOptions, ...props }: Partial<React.ComponentProps<typeof SelectButton>>) => {
  const [value, setValue] = useState(options[0]?.value);

  return (
    <SelectButton
      options={options}
      value={value}
      onValueChange={setValue}
      className='rounded-lg bg-gray-100 p-1'
      {...props}
    />
  );
};

export const Default: Story = {
  render: () => <SelectButtonDemo />,
};

export const WithTooltips: Story = {
  render: () => {
    const optionsWithTooltips: SelectButtonOption[] = [
      { label: 'Edit', value: 'edit', tooltipBody: 'Edit this item' },
      { label: 'View', value: 'view', tooltipBody: 'View details' },
      { label: 'Delete', value: 'delete', tooltipBody: 'Delete this item' },
    ];
    return <SelectButtonDemo options={optionsWithTooltips} />;
  },
};

export const SmallSize: Story = {
  render: () => <SelectButtonDemo size='small' />,
};

export const Disabled: Story = {
  render: () => <SelectButtonDemo disabled />,
};

export const TwoOptions: Story = {
  render: () => {
    const twoOptions: SelectButtonOption[] = [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ];
    return <SelectButtonDemo options={twoOptions} />;
  },
};
