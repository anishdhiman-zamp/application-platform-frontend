'use client';

import { useRef, useState } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FileIcon,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronRight } from 'lucide-react';
import { FILE_TYPE, type FileTreeNodeProps } from 'modules/pace/components/files/file-tree.types';
import { getFileExtension } from 'modules/pace/components/files/file-tree.utils';
import { CONTEXT_MENU_ACTIONS } from 'modules/pace/components/files/files.constants';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';

const FileTreeNode = ({ node, depth, expandedPaths, selectedPath, onToggleExpand, onSelect }: FileTreeNodeProps) => {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const isFolder = node.type === FILE_TYPE.DIRECTORY;
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const extension = isFolder ? '' : getFileExtension(node.name);

  const handleClick = () => {
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

  const filteredActions = CONTEXT_MENU_ACTIONS.filter((action) => !action.fileOnly || !isFolder);

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
          {/* TODO: Add onClick handlers when file actions API is integrated */}
          {filteredActions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              className={cn(
                'hover:bg-GRAY_100 f-12-500 text-GRAY_900 cursor-pointer rounded-md',
                action.isDestructive && 'text-red-600',
              )}
            >
              <action.icon className='size-4' />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div
        role='button'
        tabIndex={0}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
        className={cn(
          'hover:bg-GRAY_100 flex cursor-pointer items-center gap-2 rounded-md py-2 pr-1',
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
            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }}>
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

        <span className='f-13-450 text-GRAY_1000 truncate'>{node.name}</span>
      </div>

      <AnimatePresence initial={false}>
        {isFolder && isExpanded && node.children && node.children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className='flex flex-col gap-0.5 overflow-hidden pt-0.5'
          >
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                expandedPaths={expandedPaths}
                selectedPath={selectedPath}
                onToggleExpand={onToggleExpand}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileTreeNode;
