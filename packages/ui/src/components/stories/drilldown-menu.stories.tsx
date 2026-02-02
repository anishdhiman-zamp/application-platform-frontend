import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@zamp-platform/ui';
import { BarChart3, Settings, DollarSign, Users, User, CreditCard, Zap } from 'lucide-react';
import { type MenuNode, DrilldownMenu } from '../ui/DrilldownMenu';

const sampleMenu: MenuNode = {
  id: 'root',
  label: 'Root',
  children: [
    {
      id: 'analytics',
      label: 'Analytics',
      backText: 'Back to main menu',
      description: 'View analytics and reports',
      icon: <BarChart3 />,
      children: [
        {
          id: 'revenue',
          label: 'Revenue',
          description: 'Revenue reports and metrics',
          icon: <DollarSign />,
          action: () => {
            // eslint-disable-next-line no-console
            console.log('Revenue clicked');
          },
        },
        {
          id: 'customers',
          label: 'Customers',
          description: 'Customer analytics',
          icon: <Users />,
          action: () => {
            // eslint-disable-next-line no-console
            console.log('Customers clicked');
          },
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      backText: 'Back to main menu',
      description: 'Manage your settings',
      icon: <Settings />,
      children: [
        {
          id: 'profile',
          label: 'Profile',
          description: 'Update your profile',
          icon: <User />,
          action: () => {
            // eslint-disable-next-line no-console
            console.log('Profile clicked');
          },
        },
        {
          id: 'billing',
          label: 'Billing',
          description: 'Manage billing and payments',
          icon: <CreditCard />,
          action: () => {
            // eslint-disable-next-line no-console
            console.log('Billing clicked');
          },
        },
      ],
    },
    {
      id: 'event-based-trigger',
      label: 'Event-based trigger',
      backText: 'Back to main menu',
      description: 'Runs when an event occurs',
      icon: <Zap />,
      isHoverActionEnabled: true,
    },
  ],
};

const meta = {
  title: 'UI/DrilldownMenu',
  component: DrilldownMenu,
  args: {
    menuNode: sampleMenu,
    children: <Button>Open Menu</Button>,
    handleClick: (item: MenuNode) => {
      // eslint-disable-next-line no-console
      console.log('Item clicked:', item);
      if (item.action) {
        item.action();
      }
    },
    onPointerEnter: (item: MenuNode) => {
      // eslint-disable-next-line no-console
      console.log('Hovered over:', item.label);
    },
  },
  argTypes: {
    menuNode: {
      control: false,
      description: 'Root menu node defining the drilldown structure',
    },
    children: {
      control: false,
      description: 'Trigger element for the dropdown menu',
    },
    handleClick: {
      control: false,
      description: 'Callback function when a menu item is clicked',
    },
    onPointerEnter: {
      control: false,
      description: 'Callback function when hovering over a menu item with isHoverActionEnabled',
    },
    asChildTrigger: {
      control: 'boolean',
      description: 'Whether to use the children as a child trigger',
    },
    drilldownState: {
      control: false,
      description: 'Optional drilldown state management',
    },
  },
} satisfies Meta<typeof DrilldownMenu>;

export default meta;

type Story = StoryObj<typeof DrilldownMenu>;

export const Default: Story = {};

export const WithIcons: Story = {
  args: {
    menuNode: sampleMenu,
    children: <Button>Open Menu with Icons</Button>,
    handleClick: (item: MenuNode) => {
      // eslint-disable-next-line no-console
      console.log('Item clicked:', item);
      if (item.action) {
        item.action();
      }
    },
    onPointerEnter: (item: MenuNode) => {
      // eslint-disable-next-line no-console
      console.log('Hovered over:', item.label);
    },
  },
};
