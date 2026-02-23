'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { MoreVertical } from 'lucide-react';
import { FILE_VIEWER_HEADER_ACTIONS } from '@/modules/pace/components/files/files.constants';

interface FileViewerHeaderMenuProps {
  onActionClick: (actionId: string) => void;
  disabled?: boolean;
}

const FileViewerHeaderMenu = ({ onActionClick, disabled = false }: FileViewerHeaderMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          className={cn(
            'hover:bg-GRAY_100 flex size-7 items-center justify-center rounded-md transition-colors',
            disabled && 'cursor-not-allowed opacity-50',
          )}
          disabled={disabled}
        >
          <MoreVertical size={16} className='text-GRAY_700' />
        </button>
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
};

export default FileViewerHeaderMenu;
