import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronDown, Plus } from 'lucide-react';
import React, { FC, useState } from 'react';

import { DATASET_COLUMN_TYPES_LIST } from '../constants';

interface IColumnDropdownProps {
  onTypeSelect?: (type: string) => void;
  selectedType?: string;
  selectedClassName?: string;
  triggerClassName?: string;
  label?: string;
  disabled?: boolean;
}

const ColumnTypeDropdown: FC<IColumnDropdownProps> = ({
  onTypeSelect,
  selectedType,
  selectedClassName,
  triggerClassName,
  label = 'More inputs',
  disabled = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelect = (value: string) => {
    setIsDropdownOpen(false);
    // Small delay to allow dropdown to close before animation starts
    requestAnimationFrame(() => {
      onTypeSelect?.(value);
    });
  };

  const selectedItem = DATASET_COLUMN_TYPES_LIST.find((type) => type.value === selectedType);

  return (
    <DropdownMenu onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size='medium'
          disabled={disabled}
          className={cn(
            'f-12-500 text-GRAY_1000 border-GRAY_400 hover:bg-GRAY_100 active:bg-GRAY_50 bg-BG_WHITE flex cursor-pointer items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
            triggerClassName,
            isDropdownOpen && 'bg-GRAY_50',
            selectedType && 'border-GRAY_300 bg-GRAY_100',
            selectedType && selectedClassName,
          )}
        >
          {selectedItem ? (
            <div className='flex items-center justify-center gap-1'>
              <selectedItem.icon className='text-GRAY_700 h-3.5 w-3.5' />
              <span>{selectedItem?.label}</span>
              <ChevronDown className='text-GRAY_900 ml-1.5 h-3.5 w-3.5' />
            </div>
          ) : (
            <>
              <Plus className='h-4 w-4' />
              <span>{label}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='bg-BG_WHITE mt-1.5 w-40' align='start'>
        {DATASET_COLUMN_TYPES_LIST.map((type) => (
          <DropdownMenuItem
            key={type?.value}
            className='f-13-500 text-GRAY_900 hover:bg-GRAY_50 flex cursor-pointer items-center gap-2 rounded-md p-2'
            onClick={() => handleSelect(type?.value)}
          >
            <type.icon className='text-GRAY_700 h-3 w-3' />
            <span>{type?.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnTypeDropdown;
