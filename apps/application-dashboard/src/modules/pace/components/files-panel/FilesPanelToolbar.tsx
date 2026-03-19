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
import { ArrowDown, ArrowUp, ChevronDownIcon, FoldVertical, Pin } from 'lucide-react';
import { SORT_DIRECTION, SortDirection, SortOption } from '@/modules/pace/components/files/file-tree.types';
import { SORT_OPTIONS } from '@/modules/pace/components/files/files.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

interface FilesPanelToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortByChange: (value: SortOption) => void;
  sortDirection: SortDirection;
  onSortToggle: () => void;
  onCollapseAll: () => void;
}

const FilesPanelToolbar = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortToggle,
  onCollapseAll,
}: FilesPanelToolbarProps) => {
  const { filesPanelPinned, setFilesPanelPinned } = usePaceContext();

  const selectedSortLabel = SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ?? 'Date modified';

  return (
    <div className='border-GRAY_400 flex flex-col gap-y-2.5 border-b p-3'>
      <SearchInput
        placeholder='Search files'
        value={searchQuery}
        showSearchIcon
        debounceMs={500}
        onChange={onSearchChange}
        size='small'
        wrapperClassName='min-w-0 flex-1'
        className='placeholder:text-GRAY_500 placeholder:f-12-450 f-12-400 bg-BG_WHITE h-8 rounded-md'
        clearButtonClassName='text-GRAY_500'
        aria-label='Search files'
      />
      <div className='flex items-center justify-between'>
        <div className='flex shrink-0 items-start gap-x-1.5'>
          <div className='flex items-center'>
            <Button
              variant='secondary'
              size='small'
              onClick={onSortToggle}
              className='border-GRAY_400 bg-BG_WHITE hover:bg-BG_WHITE gap-x-[2px] rounded-r-none! border-r-0 p-1.5!'
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
                  className='border-GRAY_400 bg-BG_WHITE hover:bg-BG_WHITE rounded-l-none! px-2.5! py-1.5! focus-visible:ring-0 focus-visible:ring-offset-0'
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
          <Button
            variant='secondary'
            size='small'
            onClick={onCollapseAll}
            className='border-GRAY_400 bg-BG_WHITE hover:bg-BG_WHITE size-[25px] p-1.5!'
            title='Collapse all'
          >
            <FoldVertical className='text-GRAY_1000 size-3.5' />
          </Button>
        </div>
        <Button
          variant='secondary'
          size='small'
          onClick={() => setFilesPanelPinned(!filesPanelPinned)}
          className={cn(
            'border-GRAY_400 bg-BG_WHITE hover:bg-BG_WHITE size-[25px] p-1.5!',
            filesPanelPinned && 'bg-GRAY_200 hover:bg-GRAY_200',
          )}
          title={filesPanelPinned ? 'Unpin sidebar' : 'Pin as sidebar'}
        >
          <Pin className={cn('text-GRAY_1000 size-3', filesPanelPinned && 'fill-current')} />
        </Button>
      </div>
    </div>
  );
};

export default FilesPanelToolbar;
