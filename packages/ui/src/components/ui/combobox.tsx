import { cn } from '@zamp-platform/ui/lib/utils';
import * as React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

type ComboboxProps = {
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>;
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
  inputClassName?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  children: React.ReactNode;
  itemClassName?: string;
  overLayContent?: React.ReactNode;
};

export function Combobox({
  options,
  value,
  onChange,
  open,
  onOpenChange,
  triggerClassName,
  contentClassName,
  inputClassName,
  itemClassName,
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  children,
  overLayContent,
}: ComboboxProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild className={triggerClassName}>
        {children}
      </PopoverTrigger>
      <PopoverContent className={cn('w-[200px] p-0 relative', contentClassName)} align='start' sideOffset={4}>
        <Command shouldFilter={true}>
          <CommandInput placeholder={searchPlaceholder} className={cn('h-9', inputClassName)} />
          <CommandList className={cn(overLayContent && 'pb-12')}>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option?.value}
                  value={option?.label}
                  onSelect={(currentValue: string) => {
                    const selectedOption = options.find((opt) => opt?.label === currentValue);
                    if (selectedOption) {
                      onChange(selectedOption.value === value ? '' : selectedOption.value);
                    }
                  }}
                  className={itemClassName}
                >
                  {option?.icon && option?.icon}
                  {option?.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {overLayContent && (
            <div className='absolute bottom-0 left-0 right-0 bg-GRAY_50 py-4 px-[14px]'>{overLayContent}</div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
