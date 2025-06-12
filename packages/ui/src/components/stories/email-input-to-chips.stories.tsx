import type { Meta, StoryObj } from '@storybook/react';
import { EmailInputToChips } from '..';
import { useState } from 'react';

const meta: Meta<typeof EmailInputToChips> = {
  title: 'UI/EmailInputToChips',
  component: EmailInputToChips,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmailInputToChips>;

const EmailInputToChipsWithState = (args: any) => {
  const [emails, setEmails] = useState<string[]>(args.value || []);
  return (
    <EmailInputToChips
      {...args}
      value={emails}
      onChange={(newEmails) => {
        setEmails(newEmails);
        args.onChange?.(newEmails);
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <EmailInputToChipsWithState {...args} />,
  args: {
    placeholder: 'Add email addresses...',
  },
};

export const WithInitialEmails: Story = {
  render: (args) => <EmailInputToChipsWithState {...args} />,
  args: {
    placeholder: 'Add email addresses...',
  },
};

export const WithCustomClassName: Story = {
  render: (args) => <EmailInputToChipsWithState {...args} />,
  args: {
    placeholder: 'Add email addresses...',
    className: 'bg-gray-100 p-4 rounded-lg',
  },
};
