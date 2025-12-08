import React, { FC, useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronDown, Plus } from 'lucide-react';
import { DATASET_COLUMN_TYPES_LIST } from 'modules/process/process.constant';

interface IColumnDropdownProps {
  onTypeSelect?: (type: string) => void;
  selectedType?: string;
  selectedClassName?: string;
  triggerClassName?: string;
}

const ColumnTypeDropdown: FC<IColumnDropdownProps> = ({
  onTypeSelect,
  selectedType,
  selectedClassName,
  triggerClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    onTypeSelect?.(value);
    setIsOpen(false);
  };

  const selectedItem = DATASET_COLUMN_TYPES_LIST.find((type) => type.value === selectedType);

  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size='medium'
          className={cn(
            'f-12-500 text-gray-1000 border-GRAY_400 hover:bg-GRAY_50 active:bg-GRAY_50 flex cursor-pointer items-center gap-1 rounded-md border bg-white px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
            triggerClassName,
            isOpen && 'bg-GRAY_50',
            selectedType && 'border-GRAY_300 bg-GRAY_100',
            selectedType && selectedClassName,
          )}
        >
          {selectedItem ? (
            <div className='flex items-center gap-1'>
              <selectedItem.icon className='text-GRAY_700 h-3.5 w-3.5' />
              <span>{selectedItem.label}</span>
              <ChevronDown className='text-GRAY_900 ml-1.5 h-3.5 w-3.5' />
            </div>
          ) : (
            <>
              <Plus className='h-4 w-4' />
              <span>More inputs</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='mt-1.5 w-40 bg-white' align='start'>
        {DATASET_COLUMN_TYPES_LIST.map((type) => (
          <DropdownMenuItem
            key={type.value}
            className='f-13-500 text-GRAY_900 hover:bg-GRAY_50 flex cursor-pointer items-center gap-2 rounded-md p-2'
            onClick={() => handleSelect(type.value)}
          >
            <type.icon className='text-GRAY_700 h-3 w-3' />
            <span>{type.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnTypeDropdown;
