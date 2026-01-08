import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Combobox, ComboboxOption } from '../ui/combobox';
import { Button } from '../ui/button';

const meta = {
  title: 'UI/Combobox',
  component: Combobox,
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the trigger',
    },
    searchPlaceholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
    emptyText: {
      control: 'text',
      description: 'Text shown when no results found',
    },
    isMultiSelect: {
      control: 'boolean',
      description: 'Whether multiple options can be selected',
    },
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof Combobox>;

const sampleOptions: ComboboxOption[] = [
  { id: '1', label: 'Apple', value: 'apple' },
  { id: '2', label: 'Banana', value: 'banana' },
  { id: '3', label: 'Cherry', value: 'cherry' },
  { id: '4', label: 'Date', value: 'date' },
  { id: '5', label: 'Elderberry', value: 'elderberry' },
];

const SingleSelectCombobox = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ComboboxOption | null>(null);

  return (
    <Combobox
      options={sampleOptions}
      open={open}
      onOpenChange={setOpen}
      onSelect={(option) => {
        setSelected(option);
        setOpen(false);
      }}
      searchPlaceholder='Search fruits...'
      emptyText='No fruits found.'
    >
      <Button variant='outline' className='w-[200px] justify-between'>
        {selected ? selected.label : 'Select a fruit...'}
      </Button>
    </Combobox>
  );
};

const MultiSelectCombobox = () => {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  return (
    <Combobox
      options={sampleOptions}
      open={open}
      onOpenChange={setOpen}
      isMultiSelect
      selectedValues={selectedValues}
      onMultiSelect={(options) => {
        setSelectedValues(options.map((o) => o.value as string));
      }}
      searchPlaceholder='Search fruits...'
      emptyText='No fruits found.'
    >
      <Button variant='outline' className='w-[200px] justify-between'>
        {selectedValues.length > 0 ? `${selectedValues.length} selected` : 'Select fruits...'}
      </Button>
    </Combobox>
  );
};

export const Default: Story = {
  render: () => <SingleSelectCombobox />,
};

export const MultiSelect: Story = {
  render: () => <MultiSelectCombobox />,
};

const LoadingCombobox = () => {
  const [open, setOpen] = useState(false);

  return (
    <Combobox
      options={[]}
      open={open}
      onOpenChange={setOpen}
      onSelect={() => {}}
      optionsLoading
      searchPlaceholder='Loading...'
    >
      <Button variant='outline' className='w-[200px] justify-between'>
        Loading options...
      </Button>
    </Combobox>
  );
};

export const Loading: Story = {
  render: () => <LoadingCombobox />,
};
