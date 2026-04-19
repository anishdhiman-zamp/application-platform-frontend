'use client';

import { forwardRef } from 'react';
import { Button, FileIcon, FolderClosedIcon, FolderOpenedIcon } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronRight, Loader } from 'lucide-react';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { FILE_TYPE, type FileItem } from '@/modules/pace/components/files/file-tree.types';
import { getFileExtension, getParentPath } from '@/modules/pace/components/files/file-tree.utils';
import { renderHighlightedName } from '@/modules/pace/components/files/HighlightedName';

interface SearchResultRowProps {
  node: FileItem;
  searchHighlight: string;
  isExpanded: boolean;
  isSelected: boolean;
  isLoadingChildren: boolean;
  onToggleExpand: (path: string) => void;
  onSelect: (path: string) => void;
}

const PathBreadcrumb = ({ path }: { path: string }) => {
  const parentPath = getParentPath(path);
  const hasParent = parentPath && parentPath !== '/';
  const segments = hasParent ? parentPath.split('/').filter(Boolean) : path.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <div className='f-11-450 text-GRAY_700 flex min-w-0 items-center gap-[2px]'>
      {segments.map((segment, index) => (
        <span key={`${segment}-${index}`} className='flex min-w-0 items-center gap-[2px]'>
          {index > 0 && <span className='text-GRAY_600 shrink-0 text-[10px]'>/</span>}
          <span className='truncate'>{segment}</span>
        </span>
      ))}
    </div>
  );
};

const SearchResultRow = forwardRef<HTMLDivElement, SearchResultRowProps>(
  ({ node, searchHighlight, isExpanded, isSelected, isLoadingChildren, onToggleExpand, onSelect }, ref) => {
    const isFolder = node.type === FILE_TYPE.DIRECTORY;
    const extension = isFolder ? '' : getFileExtension(node.name);

    const handleRowClick = () => {
      if (isFolder) {
        onToggleExpand(node.path);
      } else {
        onSelect(node.path);
      }
    };

    const handleChevronClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand(node.path);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) {
        e.preventDefault();
        handleRowClick();
      }
    };

    return (
      <div
        ref={ref}
        role='button'
        tabIndex={0}
        onClick={handleRowClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'hover:bg-GRAY_100 group flex cursor-pointer flex-col gap-0.5 px-2 py-1.5 transition-colors',
          isSelected && 'bg-GRAY_100',
        )}
      >
        <div className='flex items-center gap-1'>
          {isFolder ? (
            isLoadingChildren ? (
              <span className='flex size-4 shrink-0 items-center justify-center'>
                <Loader className='text-GRAY_600 size-3 animate-spin' />
              </span>
            ) : (
              <Button
                variant='ghost'
                size='xxsmall'
                onClick={handleChevronClick}
                className='size-4 shrink-0 p-0! hover:bg-transparent'
                aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
              >
                <ChevronRight
                  className={cn(
                    'text-GRAY_700 group-hover:text-GRAY_1000 size-3.5 transition-transform duration-100',
                    isExpanded && 'rotate-90',
                  )}
                />
              </Button>
            )
          ) : (
            <span className='size-4 shrink-0' />
          )}

          {isFolder ? (
            isExpanded ? (
              <FolderOpenedIcon size={16} weight='fill' className='text-BLUE_600 shrink-0 dark:opacity-70' />
            ) : (
              <FolderClosedIcon size={16} weight='fill' className='text-BLUE_600 shrink-0 dark:opacity-70' />
            )
          ) : (
            <FileIcon extension={extension || 'txt'} className='size-5 rounded-sm' iconClassName='size-4' />
          )}

          <span className='f-13-450 text-GRAY_1000 min-w-0 truncate select-none'>
            {renderHighlightedName(node.name, searchHighlight)}
          </span>
        </div>

        <div className='pl-[22px]'>
          <PathBreadcrumb path={node.path} />
        </div>
      </div>
    );
  },
);

SearchResultRow.displayName = 'SearchResultRow';

export default SearchResultRow;
