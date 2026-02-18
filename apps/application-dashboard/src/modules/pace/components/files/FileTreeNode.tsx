'use client';

import { Button, FileIcon } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronRight } from 'lucide-react';
import { FILE_TYPE, type FileTreeNodeProps } from 'modules/pace/components/files/file-tree.types';
import { getFileExtension } from 'modules/pace/components/files/file-tree.utils';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';

const FileTreeNode = ({ node, depth, expandedPaths, selectedPath, onToggleExpand, onSelect }: FileTreeNodeProps) => {
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

  return (
    <div>
      <div
        role='button'
        tabIndex={0}
        onClick={handleClick}
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
