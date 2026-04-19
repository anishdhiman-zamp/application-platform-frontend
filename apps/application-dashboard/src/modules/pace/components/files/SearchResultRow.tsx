'use client';

import { forwardRef, useState } from 'react';
import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FileIcon,
  FolderClosedIcon,
  FolderOpenedIcon,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronRight, Loader, MoreVertical } from 'lucide-react';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { type ContextMenuAction, FILE_TYPE, type FileItem } from '@/modules/pace/components/files/file-tree.types';
import { getFileExtension, getParentPath } from '@/modules/pace/components/files/file-tree.utils';
import { renderHighlightedName } from '@/modules/pace/components/files/HighlightedName';

interface SearchResultRowProps {
  node: FileItem;
  searchHighlight: string;
  isExpanded: boolean;
  isSelected: boolean;
  isLoadingChildren: boolean;
  actions?: ContextMenuAction[];
  onActionClick?: (actionId: string) => void;
  onToggleExpand: (path: string) => void;
  onSelect: (path: string) => void;
}

const MENU_CONTENT_CLASS = 'flex min-w-[180px] flex-col gap-y-[2px]';

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

const ActionMenuItems = ({
  actions,
  onActionClick,
  as: MenuItem,
}: {
  actions: ContextMenuAction[];
  onActionClick: (actionId: string) => void;
  as: React.ComponentType<{ className?: string; onClick?: (e: React.MouseEvent) => void; children?: React.ReactNode }>;
}) =>
  actions.map((action) => (
    <MenuItem
      key={action.id}
      onClick={(e) => {
        e.stopPropagation();
        onActionClick(action.id);
      }}
      className={cn(
        'hover:bg-GRAY_100 f-12-500 text-GRAY_900 cursor-pointer rounded-md',
        action.isDestructive && 'text-red-600 hover:text-red-600',
      )}
    >
      <action.icon className='size-4' />
      {action.label}
    </MenuItem>
  ));

const SearchResultRow = forwardRef<HTMLDivElement, SearchResultRowProps>(
  (
    {
      node,
      searchHighlight,
      isExpanded,
      isSelected,
      isLoadingChildren,
      actions,
      onActionClick,
      onToggleExpand,
      onSelect,
    },
    ref,
  ) => {
    const isFolder = node.type === FILE_TYPE.DIRECTORY;
    const extension = isFolder ? '' : getFileExtension(node.name);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const hasActions = !!actions && actions.length > 0 && !!onActionClick;

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

    const row = (
      <div
        ref={ref}
        role='button'
        tabIndex={0}
        onClick={handleRowClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'hover:bg-GRAY_100 group flex cursor-pointer flex-col gap-0.5 px-2 py-1.5 transition-colors',
          (isSelected || dropdownOpen) && 'bg-GRAY_100',
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

          <span className='f-13-450 text-GRAY_1000 min-w-0 flex-1 truncate select-none'>
            {renderHighlightedName(node.name, searchHighlight)}
          </span>

          {hasActions && (
            <DropdownMenu onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <div
                  role='button'
                  tabIndex={0}
                  className={cn(
                    'ml-auto flex size-5 shrink-0 cursor-pointer items-center justify-center rounded opacity-0 outline-none group-hover:opacity-100',
                    dropdownOpen && 'opacity-100',
                  )}
                  onClick={(e) => e.stopPropagation()}
                  aria-label='More actions'
                >
                  <MoreVertical size={14} className='text-GRAY_700' />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className={MENU_CONTENT_CLASS}>
                <ActionMenuItems actions={actions!} onActionClick={onActionClick!} as={DropdownMenuItem} />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className='pl-[22px]'>
          <PathBreadcrumb path={node.path} />
        </div>
      </div>
    );

    if (!hasActions) return row;

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
        <ContextMenuContent className={MENU_CONTENT_CLASS}>
          <ActionMenuItems actions={actions!} onActionClick={onActionClick!} as={ContextMenuItem} />
        </ContextMenuContent>
      </ContextMenu>
    );
  },
);

SearchResultRow.displayName = 'SearchResultRow';

export default SearchResultRow;
