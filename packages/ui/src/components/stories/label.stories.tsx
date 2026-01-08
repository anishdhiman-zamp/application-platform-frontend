import type { Meta, StoryObj } from '@storybook/nextjs';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';

const meta = {
  title: 'UI/Label',
  component: Label,
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    children: 'Label text',
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {};

export const WithInput: Story = {
  render: () => (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      <Label htmlFor='email'>Email</Label>
      <Input type='email' id='email' placeholder='Enter your email' />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className='flex items-center space-x-2'>
      <Checkbox id='terms' />
      <Label htmlFor='terms'>Accept terms and conditions</Label>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      <Label htmlFor='name'>
        Name <span className='text-red-500'>*</span>
      </Label>
      <Input type='text' id='name' placeholder='Enter your name' />
    </div>
  ),
};
