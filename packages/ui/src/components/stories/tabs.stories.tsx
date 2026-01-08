import type { Meta, StoryObj } from '@storybook/nextjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '..';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  argTypes: {
    defaultValue: {
      control: 'text',
      description: 'Default selected tab value',
    },
    value: {
      control: 'text',
      description: 'Controlled selected tab value',
    },
    onValueChange: {
      action: 'value changed',
      description: 'Callback when selected tab changes',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    defaultValue: 'tab1',
  },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
        <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        <TabsTrigger value='tab3'>Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value='tab1'>Content for Tab 1</TabsContent>
      <TabsContent value='tab2'>Content for Tab 2</TabsContent>
      <TabsContent value='tab3'>Content for Tab 3</TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {};

export const WithCustomClassName: Story = {
  args: {
    className: 'w-[400px]',
  },
};

export const WithDifferentContent: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value='account'>Account</TabsTrigger>
        <TabsTrigger value='password'>Password</TabsTrigger>
      </TabsList>
      <TabsContent value='account'>
        <div className='space-y-4'>
          <h4 className='text-sm font-medium'>Account Settings</h4>
          <p className='text-sm text-gray-500'>Make changes to your account settings and preferences.</p>
        </div>
      </TabsContent>
      <TabsContent value='password'>
        <div className='space-y-4'>
          <h4 className='text-sm font-medium'>Password Settings</h4>
          <p className='text-sm text-gray-500'>Change your password and security preferences.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
