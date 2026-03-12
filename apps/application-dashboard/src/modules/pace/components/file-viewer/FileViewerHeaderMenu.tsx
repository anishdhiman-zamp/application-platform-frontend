'use client';

import { memo } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { MoreVertical } from 'lucide-react';
import { FILE_VIEWER_HEADER_ACTIONS } from '@/modules/pace/components/files/files.constants';

interface FileViewerHeaderMenuProps {
  onActionClick: (actionId: string) => void;
  disabled?: boolean;
}

const FileViewerHeaderMenu = memo(({ onActionClick, disabled = false }: FileViewerHeaderMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button variant='ghost' size='icon' className='h-6 w-6 shrink-0' disabled={disabled}>
          <MoreVertical size={16} className='text-GRAY_700' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='flex min-w-[140px] flex-col gap-y-[2px]'>
        {FILE_VIEWER_HEADER_ACTIONS.map((action) => (
          <DropdownMenuItem
            key={action.id}
            onClick={() => onActionClick(action.id)}
            className={cn(
              'hover:bg-GRAY_100 f-12-500 text-GRAY_900 cursor-pointer rounded-md',
              action.isDestructive && 'text-red-600 hover:text-red-600',
            )}
          >
            <action.icon className='size-4' />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

FileViewerHeaderMenu.displayName = 'FileViewerHeaderMenu';

export default FileViewerHeaderMenu;
