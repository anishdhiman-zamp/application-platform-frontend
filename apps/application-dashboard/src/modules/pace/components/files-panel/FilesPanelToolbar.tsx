'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SearchInput,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowDown, ArrowUp, ChevronDownIcon, FoldVertical } from 'lucide-react';
import { SORT_DIRECTION, SortDirection, SortOption } from '@/modules/pace/components/files/file-tree.types';
import { SORT_OPTIONS } from '@/modules/pace/components/files/files.constants';

interface FilesPanelToolbarProps {
  variant?: 'panel' | 'page';
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onDebouncedSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortByChange: (value: SortOption) => void;
  sortDirection: SortDirection;
  onSortToggle: () => void;
  onCollapseAll: () => void;
}

const FilesPanelToolbar = ({
  variant = 'panel',
  searchQuery,
  onSearchChange,
  onDebouncedSearchChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortToggle,
  onCollapseAll,
}: FilesPanelToolbarProps) => {
  const selectedSortLabel = SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label;
  const isPageVariant = variant === 'page';
  const pageSearchWidthClass = 'w-[280px]';

  const searchControl = (
    <SearchInput
      placeholder='Search files'
      value={searchQuery}
      showSearchIcon
      debounceMs={500}
      onChange={onSearchChange}
      onDebouncedChange={onDebouncedSearchChange}
      size='small'
      wrapperClassName={cn('min-w-0', isPageVariant ? `${pageSearchWidthClass} flex-none` : 'flex-1')}
      className={cn(
        'placeholder:text-GRAY_500 placeholder:f-12-450 f-12-400 bg-BG_WHITE h-8 rounded-md',
        isPageVariant && pageSearchWidthClass,
      )}
      clearButtonClassName='text-GRAY_500'
      aria-label='Search files'
    />
  );

  const toolbarActions = (
    <div className={cn('flex items-center', isPageVariant ? 'shrink-0 gap-2' : 'justify-between')}>
      <div className='flex shrink-0 items-start gap-x-1.5'>
        <div className='flex items-center'>
          <Button
            variant='secondary'
            size='small'
            onClick={onSortToggle}
            aria-label='Toggle sort direction'
            className='border-GRAY_400 bg-BG_WHITE hover:bg-BG_WHITE h-8 gap-x-[2px] rounded-r-none! border-r-0 p-1.5!'
          >
            <ArrowUp
              className={cn('text-GRAY_1000 size-3.5', sortDirection === SORT_DIRECTION.ASC && 'text-GRAY_300')}
            />
            <ArrowDown
              className={cn('text-GRAY_1000 size-3.5', sortDirection === SORT_DIRECTION.DESC && 'text-GRAY_300')}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='secondary'
                size='small'
                trailingIcon={<ChevronDownIcon className='text-GRAY_1000 size-3.5' />}
                className='border-GRAY_400 bg-BG_WHITE hover:bg-BG_WHITE h-8 rounded-l-none! px-2.5! py-1.5! focus-visible:ring-0 focus-visible:ring-offset-0'
              >
                {selectedSortLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='bg-BG_WHITE flex min-w-[170px] flex-col gap-y-[2px]'>
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSortByChange(option.value)}
                  className={cn(
                    'hover:bg-GRAY_100 f-12-500 text-GRAY_900 cursor-pointer rounded-md',
                    sortBy === option.value && 'bg-GRAY_200 hover:bg-GRAY_200 text-GRAY_900',
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Button
        variant='secondary'
        size='small'
        onClick={onCollapseAll}
        className='border-GRAY_400 bg-BG_WHITE hover:bg-BG_WHITE size-8 p-1.5!'
        title='Collapse all'
        aria-label='Collapse all folders'
      >
        <FoldVertical className='text-GRAY_1000 size-3.5' />
      </Button>
    </div>
  );

  return (
    <div
      className={cn(
        'flex',
        isPageVariant
          ? 'border-GRAY_400 h-[54px] shrink-0 items-center gap-3 border-b px-4'
          : 'border-GRAY_400 flex-col gap-y-2.5 border-b p-3',
      )}
    >
      {isPageVariant ? (
        <>
          {toolbarActions}
          {searchControl}
        </>
      ) : (
        <>
          {searchControl}
          {toolbarActions}
        </>
      )}
    </div>
  );
};

export default FilesPanelToolbar;
