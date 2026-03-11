'use client';

import { forwardRef, useState } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FileIcon,
  FolderClosedIcon,
  FolderOpenedIcon,
  Input,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronRight, Loader, MoreVertical } from 'lucide-react';
import TooltipV2 from '@/components/common/TooltipV2';
import type { ContextMenuAction, TreeNode } from '@/modules/pace/components/files/file-tree.types';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import { SIDE_OPTIONS } from '@/types/commonTypes';

interface FileTreeNodeRowState {
  isFolder: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  isRenaming: boolean;
  isDuplicateName: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  isCutItem: boolean;
  isProtected: boolean;
  isUserPrivateFolder: boolean;
  isUploading: boolean;
}

interface FileTreeNodeRowRename {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onInputRef: (element: HTMLInputElement | null) => void;
}

interface FileTreeNodeRowHandlers {
  onRowClick: () => void;
  onRowDoubleClick?: () => void;
  onChevronClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

interface FileTreeNodeRowProps extends React.HTMLAttributes<HTMLDivElement> {
  node: TreeNode;
  depth: number;
  state: FileTreeNodeRowState;
  rename: FileTreeNodeRowRename;
  handlers: FileTreeNodeRowHandlers;
  actions: ContextMenuAction[];
  onActionClick: (actionId: string) => void;
}

const FileTreeNodeRow = forwardRef<HTMLDivElement, FileTreeNodeRowProps>(
  (
    { node, depth, state, rename, handlers, actions, onActionClick, className: externalClassName, ...restProps },
    ref,
  ) => {
    const extension = state.isFolder ? '' : getFileExtension(node.name);
    const isDisabled = state.isUploading;
    const isEmptyFolder = state.isFolder && (!node.children || node.children.length === 0);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
      <div
        ref={ref}
        role='button'
        tabIndex={isDisabled || state.isRenaming ? -1 : 0}
        draggable={!state.isRenaming && !state.isProtected && !isDisabled}
        onClick={isDisabled || isEmptyFolder ? undefined : handlers.onRowClick}
        onDoubleClick={isDisabled ? undefined : handlers.onRowDoubleClick}
        onDragStart={isDisabled ? undefined : handlers.onDragStart}
        onDragEnd={isDisabled ? undefined : handlers.onDragEnd}
        onDragOver={isDisabled ? undefined : handlers.onDragOver}
        onDragLeave={isDisabled ? undefined : handlers.onDragLeave}
        onDrop={isDisabled ? undefined : handlers.onDrop}
        onKeyDown={
          isDisabled || isEmptyFolder
            ? undefined
            : (e) => {
                if (state.isRenaming) return;

                if (e.key === 'Enter' || e.key === ' ') {
                  handlers.onRowClick();
                }
              }
        }
        {...restProps}
        className={cn(
          'hover:bg-GRAY_100 group flex h-9 cursor-pointer items-center gap-2 rounded-md pr-1',
          dropdownOpen && (state.isFolder || !state.isSelected) && 'bg-GRAY_100',
          state.isSelected && !state.isFolder && 'bg-GRAY_300 hover:bg-GRAY_300',
          (state.isDragging || state.isCutItem || state.isUploading) && 'opacity-50',
          state.isDragOver && 'bg-GRAY_200',
          (isDisabled || isEmptyFolder) && 'cursor-default',
          externalClassName,
        )}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {state.isFolder ? (
          <Button
            variant='ghost'
            size='xxsmall'
            onClick={isEmptyFolder ? undefined : handlers.onChevronClick}
            disabled={isEmptyFolder}
            className={cn('size-4 shrink-0 p-0! hover:bg-transparent', isEmptyFolder && 'cursor-default')}
            aria-label={state.isExpanded ? 'Collapse folder' : 'Expand folder'}
          >
            <ChevronRight
              className={cn(
                'size-3.5 transition-transform duration-100',
                isEmptyFolder ? 'text-GRAY_500' : 'text-GRAY_700 group-hover:text-GRAY_1000',
                state.isExpanded && 'rotate-90',
              )}
            />
          </Button>
        ) : (
          <span className='size-4 shrink-0' />
        )}

        {state.isFolder ? (
          state.isExpanded ? (
            <FolderOpenedIcon size={20} weight='fill' className='text-BLUE_600 shrink-0' />
          ) : (
            <FolderClosedIcon size={20} weight='fill' className='text-BLUE_600 shrink-0' />
          )
        ) : (
          <FileIcon extension={extension || 'txt'} className='text-GRAY_1000 size-4' />
        )}

        {state.isRenaming ? (
          <div className='flex min-w-0 flex-1 items-center'>
            <TooltipV2
              tooltipBody='A file or folder with this name already exists.'
              side={SIDE_OPTIONS.BOTTOM}
              open={state.isDuplicateName}
              delayDuration={0}
              tooltipClassName='bg-RED_100 text-RED_700 border-RED_300 border'
              asChildTrigger
            >
              <Input
                ref={rename.onInputRef}
                autoFocus
                autoComplete='off'
                value={rename.value}
                onChange={(e) => rename.onChange(e.target.value)}
                onBlur={rename.onSubmit}
                onKeyDown={rename.onKeyDown}
                size='small'
                className={cn(
                  'h-5! min-w-0 flex-1 p-0.5 text-[13px]! leading-4! font-normal!',
                  state.isDuplicateName && 'border-RED_700! focus:shadow-input-error-outline-shadow',
                )}
                onClick={(e) => e.stopPropagation()}
              />
            </TooltipV2>
            {extension && <span className='f-13-450 text-GRAY_600 shrink-0 select-none'>.{extension}</span>}
          </div>
        ) : (
          <span className='f-13-450 text-GRAY_1000 min-w-0 flex-1 truncate select-none'>
            {state.isUserPrivateFolder ? `${node.name} (Private)` : node.name}
          </span>
        )}

        {state.isFolder && !state.isRenaming && (
          <span className='f-13-450 text-GRAY_700 ml-auto shrink-0 opacity-0 select-none group-hover:opacity-100'>
            {node.children?.length ?? 0} {(node.children?.length ?? 0) === 1 ? 'item' : 'items'}
          </span>
        )}

        {state.isUploading ? (
          <Loader className='text-GRAY_600 ml-auto size-3.5 shrink-0 animate-spin' />
        ) : (
          !state.isRenaming &&
          actions.length > 0 && (
            <DropdownMenu onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <div
                  role='button'
                  tabIndex={0}
                  className={cn(
                    'flex size-5 shrink-0 cursor-pointer items-center justify-center rounded opacity-0 outline-none group-hover:opacity-100',
                    !state.isFolder && 'ml-auto',
                    dropdownOpen && 'opacity-100',
                  )}
                  onClick={(e) => e.stopPropagation()}
                  aria-label='More actions'
                >
                  <MoreVertical size={14} className='text-GRAY_700' />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='flex min-w-[180px] flex-col gap-y-[2px]'>
                {actions.map((action) => (
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
          )
        )}
      </div>
    );
  },
);

FileTreeNodeRow.displayName = 'FileTreeNodeRow';

export default FileTreeNodeRow;
