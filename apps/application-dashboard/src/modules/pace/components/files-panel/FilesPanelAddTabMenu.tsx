'use client';

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Globe, Plus } from 'lucide-react';

interface FilesPanelAddTabMenuProps {
  align?: 'start' | 'end';
  triggerClassName?: string;
}

const FilesPanelAddTabMenu = ({ align = 'start', triggerClassName }: FilesPanelAddTabMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={cn(
            'text-GRAY_700 hover:text-GRAY_1000 hover:bg-GRAY_100 size-7 shrink-0 rounded p-1.5',
            triggerClassName,
          )}
          title='Add tab'
          aria-label='Add tab'
        >
          <Plus size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className='bg-BG_WHITE flex min-w-[180px] flex-col gap-y-[2px]'>
        <DropdownMenuItem
          onClick={() => {}}
          className='hover:bg-GRAY_100 f-12-500 text-GRAY_900 cursor-pointer rounded-md'
        >
          <Plus className='text-GRAY_900 mr-2 size-3.5' />
          Open file
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {}}
          className='hover:bg-GRAY_100 f-12-500 text-GRAY_900 cursor-pointer rounded-md'
        >
          <Globe className='text-GRAY_900 mr-2 size-3.5' />
          Open browser instance
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilesPanelAddTabMenu;
