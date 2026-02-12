'use client';

/**
 * Combobox V2 – shadcn-style combobox (trigger = search input).
 * Built from Popover + Command only; no reference to the legacy combobox.
 * Styled with the current design system (border-GRAY_400, f-13-400, etc.).
 */

import { cn } from '@zamp-platform/ui/utils';
import * as React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverAnchor, PopoverContent, PopoverPortal } from './popover';
import { SelectOption } from './select';

export type ComboboxV2Option = Omit<SelectOption, 'icon'> & { icon?: React.ReactNode };

export interface ComboboxV2Props {
  options: Array<ComboboxV2Option>;
  value: ComboboxV2Option['value'] | undefined;
  onSelect: (option: ComboboxV2Option) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  /** Rendered at the bottom of the list (e.g. "+ Add connection"). */
  footer?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  isPortalNeeded?: boolean;
  disabled?: boolean;
}

const isValueEqual = (a: ComboboxV2Option['value'], b: ComboboxV2Option['value']): boolean => {
  if (a == null || b == null) return a === b;
  if (typeof a !== 'object' || typeof b !== 'object') return a === b;
  return JSON.stringify(a) === JSON.stringify(b);
};

export function ComboboxV2({
  options,
  value,
  onSelect,
  open,
  onOpenChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search',
  emptyText = 'No results found.',
  triggerClassName,
  contentClassName,
  itemClassName,
  footer,
  align = 'start',
  side = 'bottom',
  sideOffset = 4,
  isPortalNeeded = false,
  disabled = false,
}: ComboboxV2Props) {
  const [search, setSearch] = React.useState('');
  const openScheduled = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedOption = React.useMemo(
    () => (value != null ? (options.find((o) => isValueEqual(o.value, value)) ?? null) : null),
    [options, value],
  );

  const scheduleOpen = React.useCallback(() => {
    if (disabled) return;
    setSearch('');
    if (openScheduled.current) clearTimeout(openScheduled.current);
    openScheduled.current = setTimeout(() => {
      openScheduled.current = null;
      onOpenChange(true);
    }, 0);
  }, [disabled, onOpenChange]);

  React.useEffect(
    () => () => {
      if (openScheduled.current) clearTimeout(openScheduled.current);
    },
    [],
  );

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) setSearch('');
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const handleSelect = React.useCallback(
    (option: ComboboxV2Option) => {
      setSearch('');
      onSelect(option);
      onOpenChange(false);
    },
    [onSelect, onOpenChange],
  );

  const triggerValue = open ? search : (selectedOption?.label ?? '');

  const usePortal = React.useMemo(() => {
    if (typeof window === 'undefined') return isPortalNeeded;
    const ua = window.navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua) && /webkit/i.test(ua) && !/chrome/i.test(ua);
    return isPortalNeeded || isSafari;
  }, [isPortalNeeded]);

  const content = (
    <PopoverContent
      align={align}
      side={side}
      sideOffset={sideOffset}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onCloseAutoFocus={(e) => e.preventDefault()}
      className={cn(
        'z-1003 flex max-h-[min(16rem,60vh)] w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] flex-col overflow-hidden p-0',
        'border-GRAY_400 shadow-menu-shadow rounded-[6px] bg-white',
        contentClassName,
      )}
    >
      <Command shouldFilter>
        <CommandInput
          value={search}
          onValueChange={setSearch}
          placeholder={searchPlaceholder}
          className='sr-only m-0 h-0 overflow-hidden border-0 p-0'
          aria-hidden
        />
        <CommandList
          className={cn(
            'max-h-[min(14rem,50vh)] overflow-y-auto p-1',
            '[&::-webkit-scrollbar-thumb]:bg-GRAY_300 [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-track]:bg-transparent',
          )}
        >
          <CommandEmpty className='f-12-500 text-GRAY_600 py-4 text-center'>{emptyText}</CommandEmpty>
          <CommandGroup className='max-h-none overflow-visible border-0 p-0'>
            {options.map((option) => (
              <CommandItem
                key={option?.id ?? String(option?.value)}
                value={String(option?.label)}
                onSelect={() => handleSelect(option)}
                className={cn(
                  'f-13-400 text-GRAY_900 flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 outline-hidden',
                  'hover:bg-GRAY_100 focus:bg-GRAY_100 data-[selected=true]:bg-GRAY_100',
                  itemClassName,
                )}
              >
                {option?.icon != null && <span className='text-GRAY_500 shrink-0 [&_svg]:size-4'>{option.icon}</span>}
                <span className='min-w-0 flex-1 truncate'>{option?.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
      {footer != null && <div className='border-GRAY_400 shrink-0 border-t bg-white'>{footer}</div>}
    </PopoverContent>
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <input
          type='text'
          value={triggerValue}
          onChange={(e) => {
            setSearch(e.target.value);
            onOpenChange(true);
          }}
          onFocus={scheduleOpen}
          onClick={() => {
            if (!open) scheduleOpen();
          }}
          placeholder={placeholder}
          readOnly={!open}
          disabled={disabled}
          className={cn(
            'f-13-400 border-GRAY_400 placeholder:text-GRAY_700 flex h-8 w-full min-w-0 rounded-md border bg-white px-3 outline-hidden',
            'hover:border-GRAY_500 focus:border-GRAY_600 focus:ring-GRAY_400 focus:ring-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            triggerClassName,
          )}
          aria-expanded={open}
          aria-haspopup='listbox'
          aria-autocomplete='list'
        />
      </PopoverAnchor>
      {usePortal ? <PopoverPortal>{content}</PopoverPortal> : content}
    </Popover>
  );
}
