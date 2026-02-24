'use client';

import { forwardRef } from 'react';
import { Button, FileIcon, Input } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronRight, Loader } from 'lucide-react';
import Image from 'next/image';
import TooltipV2 from '@/components/common/TooltipV2';
import type { TreeNode } from '@/modules/pace/components/files/file-tree.types';
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
  contextMenuOpen: boolean;
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
}

const FileTreeNodeRow = forwardRef<HTMLDivElement, FileTreeNodeRowProps>(
  ({ node, depth, state, rename, handlers, className: externalClassName, ...restProps }, ref) => {
    const extension = state.isFolder ? '' : getFileExtension(node.name);
    const isDisabled = state.isUploading;

    return (
      <div
        ref={ref}
        role='button'
        tabIndex={isDisabled ? -1 : 0}
        draggable={!state.isRenaming && !state.isProtected && !isDisabled}
        onClick={isDisabled ? undefined : handlers.onRowClick}
        onDragStart={isDisabled ? undefined : handlers.onDragStart}
        onDragEnd={isDisabled ? undefined : handlers.onDragEnd}
        onDragOver={isDisabled ? undefined : handlers.onDragOver}
        onDragLeave={isDisabled ? undefined : handlers.onDragLeave}
        onDrop={isDisabled ? undefined : handlers.onDrop}
        onKeyDown={
          isDisabled
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
          'hover:bg-GRAY_100 flex h-9 cursor-pointer items-center gap-2 rounded-md pr-1',
          state.contextMenuOpen && (state.isFolder || !state.isSelected) && 'bg-GRAY_100',
          state.isSelected && !state.isFolder && 'bg-GRAY_300 hover:bg-GRAY_300',
          (state.isDragging || state.isCutItem || state.isUploading) && 'opacity-50',
          state.isDragOver && 'bg-GRAY_200',
          isDisabled && 'pointer-events-none',
          externalClassName,
        )}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {state.isFolder ? (
          <Button
            variant='ghost'
            size='xxsmall'
            onClick={handlers.onChevronClick}
            className='size-4 shrink-0 p-0! hover:bg-transparent'
            aria-label={state.isExpanded ? 'Collapse folder' : 'Expand folder'}
          >
            <ChevronRight
              className={cn(
                'text-GRAY_1000 size-3.5 transition-transform duration-100',
                state.isExpanded && 'rotate-90',
              )}
            />
          </Button>
        ) : (
          <span className='size-4 shrink-0' />
        )}

        {state.isFolder ? (
          <Image
            src='/images/files/folder-icon.png'
            alt='Folder'
            width={20}
            height={20}
            className='shrink-0'
            unoptimized
          />
        ) : (
          <FileIcon extension={extension || 'txt'} size='sm' />
        )}

        {state.isRenaming ? (
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
        ) : (
          <span className='f-13-450 text-GRAY_1000 truncate select-none'>
            {state.isUserPrivateFolder ? `${node.name} (Private)` : node.name}
          </span>
        )}

        {state.isUploading && <Loader className='text-GRAY_600 ml-auto size-3.5 shrink-0 animate-spin' />}
      </div>
    );
  },
);

FileTreeNodeRow.displayName = 'FileTreeNodeRow';

export default FileTreeNodeRow;
