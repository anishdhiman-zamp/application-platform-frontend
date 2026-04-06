'use client';

import { useState } from 'react';
import { Button, Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronDown } from 'lucide-react';
import { ACCESS_LEVEL_OPTIONS } from 'modules/pace/components/agents/constants/agents.constants';
import { ACCESS_LEVEL, type AccessLevelType } from 'modules/pace/components/agents/types/agents.types';

interface AccessLevelDropdownPropsType {
  value: AccessLevelType;
  onChange: (value: AccessLevelType) => void;
}

const AccessLevelDropdown = ({ value, onChange }: AccessLevelDropdownPropsType) => {
  const [open, setOpen] = useState(false);
  const selectedOption = ACCESS_LEVEL_OPTIONS.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label ?? 'Custom';

  const handleSelect = (accessLevel: AccessLevelType) => {
    if (accessLevel === ACCESS_LEVEL.CUSTOM) return;
    onChange(accessLevel);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='xsmall'
          onClick={(e) => e.stopPropagation()}
          className='text-GRAY_700 flex cursor-pointer items-center gap-1.5'
        >
          <span className='f-13-500'>{displayLabel}</span>
          <ChevronDown size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent align='end' className='w-40 p-1' sideOffset={4}>
          {ACCESS_LEVEL_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = option.value === value;
            const isCustom = option.value === ACCESS_LEVEL.CUSTOM;

            return (
              <Button
                key={option.value}
                variant='ghost'
                onClick={() => handleSelect(option.value)}
                disabled={isCustom}
                className={cn(
                  'flex w-full justify-start gap-1.5 rounded-md px-2.5 py-2',
                  isSelected ? 'bg-GRAY_200 text-GRAY_1000' : 'text-GRAY_900',
                  isCustom ? 'cursor-default opacity-50' : 'hover:bg-GRAY_100 cursor-pointer',
                )}
              >
                <Icon size={12} />
                <span className='f-12-500'>{option.label}</span>
              </Button>
            );
          })}
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};

export default AccessLevelDropdown;
