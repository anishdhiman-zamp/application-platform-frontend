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
import { useFileClipboard } from 'modules/pace/hooks/useFileClipboard';
import { motion } from 'motion/react';
import Image from 'next/image';
import TooltipV2 from '@/components/common/TooltipV2';
import CreateItemModal from '@/modules/pace/components/files/CreateItemModal';
import {
  CLIPBOARD_OPERATION,
  CONFLICT_RESOLUTION,
  type ConflictResolution,
  CREATE_ITEM_TYPE,
  type CreateItemType,
  FILE_TYPE,
  type FileConflict,
  type FileTreeNodeProps,
} from '@/modules/pace/components/files/file-tree.types';
import { generateKeepBothName, getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import FileConflictModal from '@/modules/pace/components/files/FileConflictModal';
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
  onDropToSibling,
}: FileTreeNodeProps) => {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [createModalType, setCreateModalType] = useState<CreateItemType | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragOverTop, setIsDragOverTop] = useState(false);
  const [fileConflict, setFileConflict] = useState<FileConflict | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const { createFile, createFolder, deleteItem, duplicateItem, renameItem, copyItem, moveItem } = useFileActions();
  const { clipboard, setCopyClipboard, setCutClipboard, clearClipboard } = useFileClipboard();

  const isFolder = node.type === FILE_TYPE.DIRECTORY;
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const extension = isFolder ? '' : getFileExtension(node.name);

  const originalNode = originalNodeMap.get(node.path);
  const childrenToRender = originalNode?.children ?? node.children;
  const childrenNames = useMemo(() => childrenToRender?.map((child) => child.name) ?? [], [childrenToRender]);

  const filteredActions = useMemo(
    () =>
      CONTEXT_MENU_ACTIONS.filter((action) => {
        if (action.fileOnly && isFolder) return false;
        if (action.folderOnly && !isFolder) return false;
        if (action.id === 'paste' && !clipboard) return false;

        return true;
      }),
    [isFolder, clipboard],
  );

  const isDuplicateName = useMemo(() => {
    if (!renameValue.trim() || renameValue === node.name) return false;

    return siblingNames.filter((name) => name !== node.name).some((name) => name === renameValue.trim());
  }, [renameValue, siblingNames, node.name]);

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
        case 'copy':
          setCopyClipboard(node.path, node.name, node.type);
          break;
        case 'cut':
          setCutClipboard(node.path, node.name, node.type);
          break;
        case 'paste':
          if (clipboard) {
            const destinationPath = `${node.path}/${clipboard.name}`;

            // Skip if cutting/moving to the same location (no-op)
            if (clipboard.operation === CLIPBOARD_OPERATION.CUT && clipboard.path === destinationPath) {
              break;
            }

            const isInvalidTarget = node.path === clipboard.path || node.path.startsWith(`${clipboard.path}/`);

            if (isInvalidTarget) {
              toast.error('Cannot paste a folder into itself');
              break;
            }

            const hasConflict = childrenNames.includes(clipboard.name);

            if (hasConflict) {
              setFileConflict({
                sourcePath: clipboard.path,
                sourceName: clipboard.name,
                destinationPath,
                operation: clipboard.operation,
              });
              break;
            }

            if (!isExpanded) {
              onToggleExpand(node.path);
            }

            if (clipboard.operation === CLIPBOARD_OPERATION.COPY) {
              await copyItem(clipboard.path, destinationPath);
            } else {
              await moveItem(clipboard.path, destinationPath);
              clearClipboard();
            }
          }
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

  const handleCreate = async (name: string, parentPath: string) => {
    if (!isExpanded) {
      onToggleExpand(node.path);
    }

    try {
      if (createModalType === CREATE_ITEM_TYPE.FILE) {
        await createFile(name, parentPath);
      } else {
        await createFolder(name, parentPath);
      }
    } catch (error) {
      captureException(error);
      toast.error('Failed to create item');
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        path: node.path,
        name: node.name,
        type: node.type,
      }),
    );
    e.dataTransfer.effectAllowed = 'copyMove';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = nodeRef.current?.getBoundingClientRect();

    if (rect) {
      const topThreshold = rect.top + rect.height * 0.25;
      const isOverTop = e.clientY < topThreshold;

      if (isOverTop && onDropToSibling) {
        e.dataTransfer.dropEffect = e.altKey ? 'copy' : 'move';
        setIsDragOverTop(true);
        setIsDragOver(false);

        return;
      }
    }

    setIsDragOverTop(false);

    if (isFolder) {
      e.dataTransfer.dropEffect = e.altKey ? 'copy' : 'move';
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (nodeRef.current && !nodeRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setIsDragOverTop(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsDragOverTop(false);

    try {
      const rawData = e.dataTransfer.getData('application/json');

      if (!rawData) {
        return;
      }

      const data = JSON.parse(rawData);

      if (!data?.path || !data?.name) {
        return;
      }

      const sourcePath = data.path;
      const sourceName = data.name;
      const sourceType = data.type;

      const rect = nodeRef.current?.getBoundingClientRect();

      if (rect && onDropToSibling) {
        const topThreshold = rect.top + rect.height * 0.25;
        const isOverTop = e.clientY < topThreshold;

        if (isOverTop) {
          onDropToSibling({
            sourcePath,
            sourceName,
            sourceType,
            isCopy: e.altKey,
          });

          return;
        }
      }

      if (!isFolder) return;

      const destinationPath = `${node.path}/${sourceName}`;

      // Skip if moving to the same location (no-op)
      if (!e.altKey && sourcePath === destinationPath) {
        return;
      }

      const isInvalidTarget = node.path === sourcePath || node.path.startsWith(`${sourcePath}/`);

      if (isInvalidTarget) {
        toast.error('Cannot move a folder into itself');

        return;
      }

      const hasConflict = childrenNames.includes(sourceName);
      const operation = e.altKey ? CLIPBOARD_OPERATION.COPY : 'move';

      if (hasConflict) {
        setFileConflict({
          sourcePath,
          sourceName,
          destinationPath,
          operation,
        });

        return;
      }

      if (!isExpanded) {
        onToggleExpand(node.path);
      }

      if (e.altKey) {
        await copyItem(sourcePath, destinationPath);
      } else {
        await moveItem(sourcePath, destinationPath);
      }
    } catch (error) {
      captureException(error);
      toast.error('Failed to move/copy');
    }
  };

  const isCutItem = clipboard?.operation === CLIPBOARD_OPERATION.CUT && clipboard.path === node.path;

  const handleConflictResolve = async (resolution: ConflictResolution) => {
    if (!fileConflict) return;

    const { sourcePath, sourceName, destinationPath, operation } = fileConflict;

    // Close dialog immediately for better UX
    setFileConflict(null);

    try {
      if (!isExpanded) {
        onToggleExpand(node.path);
      }

      if (resolution === CONFLICT_RESOLUTION.KEEP_BOTH) {
        const newName = generateKeepBothName(sourceName, childrenNames);
        const parentPath = destinationPath.slice(0, destinationPath.lastIndexOf('/'));
        const newDestinationPath = `${parentPath}/${newName}`;

        if (operation === CLIPBOARD_OPERATION.COPY) {
          await copyItem(sourcePath, newDestinationPath);
        } else {
          await moveItem(sourcePath, newDestinationPath);
          if (operation === CLIPBOARD_OPERATION.CUT) {
            clearClipboard();
          }
        }
      } else if (resolution === CONFLICT_RESOLUTION.REPLACE) {
        deleteItem(destinationPath);

        if (operation === CLIPBOARD_OPERATION.COPY) {
          await copyItem(sourcePath, destinationPath);
        } else {
          await moveItem(sourcePath, destinationPath);
          if (operation === CLIPBOARD_OPERATION.CUT) {
            clearClipboard();
          }
        }
      }
    } catch (error) {
      captureException(error);
      toast.error('Failed to resolve conflict');
    }
  };

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      const name = node.name;
      const lastDotIndex = name.lastIndexOf('.');
      const selectionEnd = lastDotIndex > 0 ? lastDotIndex : name.length;

      renameInputRef.current.setSelectionRange(0, selectionEnd);
    }
  }, [isRenaming, node.name]);

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
          existingNames={childrenNames}
        />
      )}

      <FileConflictModal
        isOpen={!!fileConflict}
        conflict={fileConflict}
        onResolve={handleConflictResolve}
        onCancel={() => setFileConflict(null)}
      />

      {isDragOverTop && (
        <div className='bg-GRAY_500 -mb-0.5 h-0.5 rounded-full' style={{ marginLeft: `${depth * 24 + 8}px` }} />
      )}
      <div
        ref={nodeRef}
        role='button'
        tabIndex={0}
        draggable={!isRenaming}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (isRenaming) return;

          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
        className={cn(
          'hover:bg-GRAY_100 flex cursor-pointer items-center gap-2 rounded-md py-2 pr-1',
          contextMenuOpen && !isSelected && 'bg-GRAY_100',
          isSelected && !isFolder && 'bg-GRAY_300 hover:bg-GRAY_300',
          (isDragging || isCutItem) && 'opacity-50',
          isDragOver && 'bg-GRAY_200',
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
                parentPath={node.path}
                onToggleExpand={onToggleExpand}
                onSelect={onSelect}
                onDropToSibling={onDropToSibling}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;
