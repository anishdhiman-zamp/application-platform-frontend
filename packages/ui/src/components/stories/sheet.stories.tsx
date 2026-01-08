import type { Meta, StoryObj } from '@storybook/nextjs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetHeaderTitle,
  SheetHeaderActions,
  SheetBody,
  SheetTrigger,
  SheetClose,
} from '../ui/sheet';
import { Button } from '../ui/button';

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the sheet is open',
    },
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open Sheet</Button>
      </SheetTrigger>
      <SheetContent title='Sheet Title' description='Sheet description'>
        <SheetHeader>
          <SheetHeaderTitle>Sheet Title</SheetHeaderTitle>
          <SheetHeaderActions>
            <SheetClose asChild>
              <Button variant='ghost' size='small'>
                Close
              </Button>
            </SheetClose>
          </SheetHeaderActions>
        </SheetHeader>
        <SheetBody>
          <p>This is the sheet body content. Sheets slide in from the side.</p>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};

export const LeftSide: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open Left Sheet</Button>
      </SheetTrigger>
      <SheetContent side='left' title='Left Sheet' description='Sheet from left'>
        <SheetHeader>
          <SheetHeaderTitle>Left Sheet</SheetHeaderTitle>
        </SheetHeader>
        <SheetBody>
          <p>This sheet slides in from the left side.</p>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};

export const LargeSize: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open Large Sheet</Button>
      </SheetTrigger>
      <SheetContent size='large' title='Large Sheet' description='A large sheet'>
        <SheetHeader>
          <SheetHeaderTitle>Large Sheet</SheetHeaderTitle>
        </SheetHeader>
        <SheetBody>
          <p>This is a large sheet with more width (600px).</p>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};

export const WithCloseButton: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open Sheet with Close Button</Button>
      </SheetTrigger>
      <SheetContent showCloseButton title='Sheet with Close' description='Sheet with close button'>
        <SheetHeader>
          <SheetHeaderTitle>Sheet with Close Button</SheetHeaderTitle>
        </SheetHeader>
        <SheetBody>
          <p>This sheet has a close button in the top right corner.</p>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};
