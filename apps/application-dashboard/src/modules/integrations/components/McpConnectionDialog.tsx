'use client';

import { type FC, useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  DialogTrigger,
  Input,
  Label,
} from '@zamp-platform/ui';
import { Plus } from 'lucide-react';

const McpConnectionDialog: FC = () => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const handleAdd = () => {
    // TODO: Implement MCP server connection logic
    console.log('Adding MCP server:', { url, name });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUrl('');
      setName('');
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant='outline' size='small' className='gap-1.5'>
          <Plus className='h-4 w-4' />
          Add MCP server
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton
        closeButtonClassName='top-[22px]'
        title='Add MCP server'
        description='Add a new MCP server connection'
        className='max-h-fit w-[500px]'
      >
        <DialogHeader className='h-fit border-none px-5 pt-5'>
          <DialogHeaderTitle className='f-16-600'>Add MCP server</DialogHeaderTitle>
        </DialogHeader>

        <DialogBody className='space-y-2.5 px-5 pt-4 pb-6'>
          <div className='flex flex-col gap-y-2'>
            <Label htmlFor='mcp-url' className='f-12-500 text-GRAY_900'>
              URL
            </Label>
            <Input
              id='mcp-url'
              type='url'
              placeholder='https://...'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              size='medium'
            />
          </div>

          <div className='flex flex-col gap-y-2'>
            <Label htmlFor='mcp-name' className='f-12-500 text-GRAY_900'>
              Name
            </Label>
            <Input
              id='mcp-name'
              type='text'
              placeholder='Integration name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              size='medium'
            />
          </div>
        </DialogBody>

        <DialogFooter className='flex justify-end gap-2.5 px-5 py-4'>
          <DialogClose asChild>
            <Button variant='outline' size='default' className='rounded-md'>
              Close
            </Button>
          </DialogClose>
          <Button variant='default' size='default' onClick={handleAdd} className='rounded-md'>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default McpConnectionDialog;
