'use client';

import { useState } from 'react';
import { Button, Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronDown, Trash2 } from 'lucide-react';
import { ROLE_OPTIONS } from '@/modules/integrations/constants/integrations.constant';
import {
  type ConnectionRoleDropdownPropsType,
  type ConnectionRoleType,
} from '@/modules/integrations/types/integrations.types';

const ConnectionRoleDropdown = ({ value, onChange, onRemove }: ConnectionRoleDropdownPropsType) => {
  const [open, setOpen] = useState(false);
  const selectedOption = ROLE_OPTIONS.find((opt) => opt.value === value) ?? ROLE_OPTIONS[0];

  const handleSelect = (role: ConnectionRoleType) => {
    onChange(role);
    setOpen(false);
  };

  const handleRemoveClick = () => {
    setOpen(false);
    onRemove?.();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='xsmall'
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'text-GRAY_700 hover:bg-GRAY_100 flex cursor-pointer items-center gap-1',
            open && 'bg-GRAY_100',
          )}
        >
          <span className='f-12-500'>{selectedOption.label}</span>
          <ChevronDown size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent align='end' className='w-40 p-1' sideOffset={4}>
          {ROLE_OPTIONS.map((option) => {
            const isSelected = option.value === value;

            return (
              <div
                key={option.value}
                role='button'
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'flex h-8 w-full cursor-pointer items-center justify-start rounded-md px-2.5 outline-none focus-visible:outline-none',
                  isSelected ? 'bg-GRAY_100 text-GRAY_1000' : 'text-GRAY_900 hover:bg-GRAY_100',
                )}
              >
                <span className='f-12-500'>{option.label}</span>
              </div>
            );
          })}

          {onRemove && (
            <>
              <div className='bg-GRAY_200 my-1 h-px w-full' />
              <div
                role='button'
                onClick={handleRemoveClick}
                className='text-RED_700 hover:bg-RED_50 flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2.5 outline-none focus-visible:outline-none'
              >
                <Trash2 size={12} />
                <span className='f-12-500'>Remove access</span>
              </div>
            </>
          )}
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};

export default ConnectionRoleDropdown;
