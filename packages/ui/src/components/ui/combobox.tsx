import { cn } from '@zamp-platform/ui/utils';
import * as React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from './popover';
import { SelectOption } from './select';
import { Skeleton } from './skeleton';

type ComboboxOption = Omit<SelectOption, 'icon'> & { icon?: React.ReactNode };

type ComboboxProps = {
  options: Array<ComboboxOption>;
  onSelect: (option: ComboboxOption) => void;
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
  groupClassName?: string;
  optionsLoading?: boolean;
  isPortalNeeded?: boolean;
  listClassName?: string;
};

export function Combobox({
  options,
  onSelect,
  open,
  onOpenChange,
  triggerClassName,
  contentClassName,
  inputClassName,
  itemClassName,
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  optionsLoading = false,
  children,
  overLayContent,
  isPortalNeeded = false,
  listClassName,
  groupClassName,
}: ComboboxProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild className={triggerClassName}>
        {children}
      </PopoverTrigger>
      <Portal isNeeded={isPortalNeeded}>
        <PopoverContent
          align='start'
          sideOffset={5}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          autoFocus={false}
          onWheel={(e) => e.stopPropagation()}
          className={cn('z-1003 min-w-(--radix-popover-trigger-width) pointer-events-auto p-0', contentClassName)}
        >
          <Command shouldFilter={true}>
            <CommandInput placeholder={searchPlaceholder} className={cn('h-9', inputClassName)} />
            <CommandList className={cn('', listClassName)}>
              {!optionsLoading && <CommandEmpty>{emptyText}</CommandEmpty>}
              <CommandGroup
                className={cn(
                  'max-h-60 overflow-auto [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-0.5',
                  groupClassName,
                )}
              >
                {optionsLoading && (
                  <div className='space-y-2'>
                    {Array.from({ length: 10 }).map((_, index) => (
                      <Skeleton key={index} className='h-8 w-full' />
                    ))}
                  </div>
                )}
                {!optionsLoading &&
                  options?.map((option) => (
                    <CommandItem
                      key={option?.id ?? option?.value.toString()}
                      value={option?.label}
                      onSelect={() => onSelect(option)}
                      className={cn('flex items-center', itemClassName)}
                    >
                      {option?.icon && option?.icon}
                      {option?.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
          {overLayContent && overLayContent}
        </PopoverContent>
      </Portal>
    </Popover>
  );
}

const Portal = ({ isNeeded, children }: { isNeeded: boolean; children: React.ReactNode }) => {
  if (!isNeeded) {
    return children;
  }
  return <PopoverPortal>{children}</PopoverPortal>;
};
