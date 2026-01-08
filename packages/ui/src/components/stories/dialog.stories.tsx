import type { Meta, StoryObj } from '@storybook/nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogHeaderTitle,
  DialogHeaderActions,
  DialogBody,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '../ui/dialog';
import { Button } from '../ui/button';

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the dialog is open',
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent title='Dialog Title' description='Dialog description'>
        <DialogHeader>
          <DialogHeaderTitle>Dialog Title</DialogHeaderTitle>
          <DialogHeaderActions>
            <DialogClose asChild>
              <Button variant='ghost' size='small'>
                Close
              </Button>
            </DialogClose>
          </DialogHeaderActions>
        </DialogHeader>
        <DialogBody className='p-4'>
          <p>This is the dialog body content. You can put any content here.</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Open Dialog with Close Button</Button>
      </DialogTrigger>
      <DialogContent showCloseButton title='Dialog with Close' description='Dialog with close button'>
        <DialogHeader>
          <DialogHeaderTitle>Dialog with Close Button</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='p-4'>
          <p>This dialog has a close button in the top right corner.</p>
        </DialogBody>
      </DialogContent>
    </Dialog>
  ),
};

export const LargeSize: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Open Large Dialog</Button>
      </DialogTrigger>
      <DialogContent size='large' title='Large Dialog' description='A large dialog'>
        <DialogHeader>
          <DialogHeaderTitle>Large Dialog</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='p-4'>
          <p>This is a large dialog with more width.</p>
        </DialogBody>
      </DialogContent>
    </Dialog>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Open Small Dialog</Button>
      </DialogTrigger>
      <DialogContent size='small' title='Small Dialog' description='A small dialog'>
        <DialogHeader>
          <DialogHeaderTitle>Small Dialog</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='p-4'>
          <p>This is a small dialog.</p>
        </DialogBody>
      </DialogContent>
    </Dialog>
  ),
};
