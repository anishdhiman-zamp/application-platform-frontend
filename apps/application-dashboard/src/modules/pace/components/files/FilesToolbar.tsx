'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowDown, ArrowUp, ChevronDownIcon, ListFilter, SearchIcon } from 'lucide-react';

export type SortOption = 'date_modified' | 'date_created' | 'name' | 'size' | 'type';
export type SortDirection = 'asc' | 'desc';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_modified', label: 'Date modified' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
  { value: 'type', label: 'Type' },
];

interface FilesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortByChange: (value: SortOption) => void;
  sortDirection: SortDirection;
  onSortDirectionToggle: () => void;
}

const FilesToolbar = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionToggle,
}: FilesToolbarProps) => {
  const selectedSortLabel = SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ?? 'Date modified';

  return (
    <div className='border-GRAY_400 flex flex-col gap-y-2.5 border-b p-3'>
      {/* Search Input */}
      <Input
        size='small'
        placeholder='Search'
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        icon={<SearchIcon className='text-GRAY_500 size-3.5' />}
        iconPosition='leading'
        className='placeholder:text-GRAY_500 placeholder:f-12-450 f-12-400 h-8 rounded-md bg-white'
      />

      {/* Sort and Filter Controls */}
      <div className='flex items-center gap-x-2'>
        {/* Sort Direction Toggle + Sort Dropdown */}
        <div className='flex items-center'>
          <Button
            variant='secondary'
            size='small'
            onClick={onSortDirectionToggle}
            className='border-GRAY_400 gap-x-[2px] rounded-r-none! border-r-0 bg-white p-1.5! hover:bg-white'
          >
            <ArrowUp className={cn('text-GRAY_1000 size-3.5', sortDirection === 'desc' && 'text-GRAY_300')} />
            <ArrowDown className={cn('text-GRAY_1000 size-3.5', sortDirection === 'asc' && 'text-GRAY_300')} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='secondary'
                size='small'
                trailingIcon={<ChevronDownIcon className='text-GRAY_1000 size-3.5' />}
                className='border-GRAY_400 rounded-l-none! bg-white px-2.5! py-1.5! hover:bg-white focus-visible:ring-0 focus-visible:ring-offset-0'
              >
                {selectedSortLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='flex min-w-[170px] flex-col gap-y-[2px]'>
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

        {/* Filter Button */}
        <Button variant='secondary' size='small' className='border-GRAY_400 bg-white px-2.5! hover:bg-white'>
          <ListFilter className='text-GRAY_1000 size-3.5' />
        </Button>
      </div>
    </div>
  );
};

export default FilesToolbar;
