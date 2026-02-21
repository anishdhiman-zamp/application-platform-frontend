'use client';

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import type { ContextMenuAction } from '@/modules/pace/components/files/file-tree.types';

interface FileTreeNodeContextMenuProps {
  children: React.ReactNode;
  actions: ContextMenuAction[];
  onOpenChange?: (open: boolean) => void;
  onActionClick: (actionId: string) => void;
}

const FileTreeNodeContextMenu = ({ children, actions, onOpenChange, onActionClick }: FileTreeNodeContextMenuProps) => {
  return (
    <ContextMenu onOpenChange={onOpenChange}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className='flex min-w-[180px] flex-col gap-y-[2px]'>
        {actions.map((action) => (
          <ContextMenuItem
            key={action.id}
            className={cn(
              'hover:bg-GRAY_100 f-12-500 text-GRAY_900 cursor-pointer rounded-md',
              action.isDestructive && 'text-red-600',
            )}
            onClick={() => onActionClick(action.id)}
          >
            <action.icon className='size-4' />
            {action.label}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default FileTreeNodeContextMenu;
