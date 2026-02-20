'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import type { ContextMenuAction } from '@/modules/pace/components/files/file-tree.types';

interface FileTreeNodeContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  actions: ContextMenuAction[];
  triggerRef: React.RefObject<HTMLDivElement | null>;
  onOpenChange: (open: boolean) => void;
  onActionClick: (actionId: string) => void;
}

const FileTreeNodeContextMenu = ({
  isOpen,
  position,
  actions,
  triggerRef,
  onOpenChange,
  onActionClick,
}: FileTreeNodeContextMenuProps) => {
  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <div ref={triggerRef} className='hidden' aria-hidden='true' />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='flex min-w-[180px] flex-col gap-y-[2px]'
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
        }}
      >
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            className={cn(
              'hover:bg-GRAY_100 f-12-500 text-GRAY_900 cursor-pointer rounded-md',
              action.isDestructive && 'text-red-600',
            )}
            onClick={() => onActionClick(action.id)}
          >
            <action.icon className='size-4' />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FileTreeNodeContextMenu;
