'use client';

import { SearchInput } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';

interface ComponentSearchProps {
  value: string;
  onChange: (value: string) => void;
  total: number;
  filteredCount: number;
  className?: string;
}

const ComponentSearch = ({ value, onChange, total, filteredCount, className }: ComponentSearchProps) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className='flex-1'>
        <SearchInput
          value={value}
          onChange={onChange}
          placeholder='Search components by name, category, or file path…'
          showSearchIcon
        />
      </div>
      <span className='text-GRAY_700 shrink-0 text-xs'>
        {filteredCount} of {total}
      </span>
    </div>
  );
};

export default ComponentSearch;
