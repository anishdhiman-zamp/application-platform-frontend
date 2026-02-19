'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FileIcon,
  Input,
  toast,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronRight } from 'lucide-react';
import { useFileActions } from 'modules/pace/hooks/useFileActions';
import { motion } from 'motion/react';
import Image from 'next/image';
import TooltipV2 from '@/components/common/TooltipV2';
import CreateItemModal from '@/modules/pace/components/files/CreateItemModal';
import {
  CREATE_ITEM_TYPE,
  type CreateItemType,
  FILE_TYPE,
  type FileTreeNodeProps,
} from '@/modules/pace/components/files/file-tree.types';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import { CONTEXT_MENU_ACTIONS } from '@/modules/pace/components/files/files.constants';
import { SIDE_OPTIONS } from '@/types/commonTypes';

const FileTreeNode = ({
  node,
  depth,
  expandedPaths,
  selectedPath,
  originalNodeMap,
  siblingNames,
  onToggleExpand,
  onSelect,
}: FileTreeNodeProps) => {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [createModalType, setCreateModalType] = useState<CreateItemType | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const triggerRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  const { createFile, createFolder, deleteItem, duplicateItem, renameItem } = useFileActions();

  const isFolder = node.type === FILE_TYPE.DIRECTORY;
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const extension = isFolder ? '' : getFileExtension(node.name);

  const originalNode = originalNodeMap.get(node.path);
  const childrenToRender = originalNode?.children ?? node.children;

  const filteredActions = useMemo(
    () =>
      CONTEXT_MENU_ACTIONS.filter((action) => {
        if (action.fileOnly && isFolder) return false;
        if (action.folderOnly && !isFolder) return false;

        return true;
      }),
    [isFolder],
  );

  const handleClick = () => {
    if (isRenaming) return;

    onSelect(node.path);
    if (isFolder) {
      onToggleExpand(node.path);
    }
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      onToggleExpand(node.path);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  const isDuplicateName = useMemo(() => {
    if (!renameValue.trim() || renameValue === node.name) return false;

    return siblingNames.filter((name) => name !== node.name).some((name) => name === renameValue.trim());
  }, [renameValue, siblingNames, node.name]);

  const handleActionClick = async (actionId: string) => {
    setContextMenuOpen(false);

    try {
      switch (actionId) {
        case 'create-file':
          setCreateModalType(CREATE_ITEM_TYPE.FILE);
          break;
        case 'create-folder':
          setCreateModalType(CREATE_ITEM_TYPE.FOLDER);
          break;
        case 'rename':
          setRenameValue(node.name);
          setIsRenaming(true);
          break;
        case 'delete':
          await deleteItem(node.path);
          break;
        case 'duplicate':
          await duplicateItem(node.path);
          break;
        default:
          break;
      }
    } catch (error) {
      captureException(error);
      toast.error(`Failed to ${actionId.replace('-', ' ')}`);
    }
  };

  const handleRenameSubmit = async () => {
    const trimmedValue = renameValue.trim();

    if (!trimmedValue || trimmedValue === node.name || isDuplicateName) {
      setIsRenaming(false);
      setRenameValue(node.name);

      return;
    }

    try {
      await renameItem(node.path, trimmedValue);
      setIsRenaming(false);
    } catch (error) {
      captureException(error);
      toast.error('Failed to rename');
      setRenameValue(node.name);
      setIsRenaming(false);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setRenameValue(node.name);
    }
  };

  const handleRenameInputRef = useCallback((element: HTMLInputElement | null) => {
    renameInputRef.current = element;
  }, []);

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      const name = node.name;
      const lastDotIndex = name.lastIndexOf('.');
      const selectionEnd = lastDotIndex > 0 ? lastDotIndex : name.length;

      renameInputRef.current.setSelectionRange(0, selectionEnd);
    }
  }, [isRenaming, node.name]);

  const handleCreate = async (name: string, parentPath: string) => {
    try {
      if (createModalType === CREATE_ITEM_TYPE.FILE) {
        await createFile(name, parentPath);
      } else {
        await createFolder(name, parentPath);
      }

      if (!isExpanded) {
        onToggleExpand(node.path);
      }
    } catch (error) {
      captureException(error);
      toast.error('Failed to create item');
    }
  };

  return (
    <div>
      <DropdownMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div ref={triggerRef} className='hidden' aria-hidden='true' />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='start'
          className='flex min-w-[180px] flex-col gap-y-[2px]'
          style={{
            position: 'fixed',
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
          {filteredActions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              className={cn(
                'hover:bg-GRAY_100 f-12-500 text-GRAY_900 cursor-pointer rounded-md',
                action.isDestructive && 'text-red-600',
              )}
              onClick={() => handleActionClick(action.id)}
            >
              <action.icon className='size-4' />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {createModalType && (
        <CreateItemModal
          isOpen={!!createModalType}
          onOpenChange={(open) => !open && setCreateModalType(null)}
          itemType={createModalType}
          onCreate={(name) => handleCreate(name, node.path)}
          existingNames={childrenToRender?.map((child) => child.name) ?? []}
        />
      )}

      <div
        role='button'
        tabIndex={0}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onKeyDown={(e) => {
          if (isRenaming) return;

          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
        className={cn(
          'hover:bg-GRAY_100 flex cursor-pointer items-center gap-2 rounded-md py-2 pr-1',
          contextMenuOpen && !isSelected && 'bg-GRAY_100',
          isSelected && 'bg-GRAY_300 hover:bg-GRAY_300',
        )}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {isFolder ? (
          <Button
            variant='ghost'
            size='xxsmall'
            onClick={handleChevronClick}
            className='size-4 shrink-0 p-0! hover:bg-transparent'
            aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
            >
              <ChevronRight className='text-GRAY_1000 size-3.5' />
            </motion.div>
          </Button>
        ) : (
          <span className='size-4 shrink-0' />
        )}

        {isFolder ? (
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

        {isRenaming ? (
          <TooltipV2
            tooltipBody='A file or folder with this name already exists.'
            side={SIDE_OPTIONS.BOTTOM}
            open={isDuplicateName}
            delayDuration={0}
            tooltipClassName='bg-RED_100 text-RED_700 border-RED_300 border'
            asChildTrigger
          >
            <Input
              ref={handleRenameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleRenameKeyDown}
              size='small'
              className={cn(
                'h-5! min-w-0 flex-1 p-0.5 text-[13px]! leading-4! font-normal!',
                isDuplicateName && 'border-RED_700! focus:shadow-input-error-outline-shadow',
              )}
              onClick={(e) => e.stopPropagation()}
            />
          </TooltipV2>
        ) : (
          <span className='f-13-450 text-GRAY_1000 truncate select-none'>{node.name}</span>
        )}
      </div>

      {isFolder && childrenToRender && childrenToRender.length > 0 && (
        <div
          className='grid transition-[grid-template-rows] duration-100 ease-out'
          style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
        >
          <div className='flex flex-col gap-0.5 overflow-hidden pt-0.5'>
            {childrenToRender.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                expandedPaths={expandedPaths}
                selectedPath={selectedPath}
                originalNodeMap={originalNodeMap}
                siblingNames={childrenToRender.map((c) => c.name)}
                onToggleExpand={onToggleExpand}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;
