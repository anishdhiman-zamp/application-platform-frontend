import { cn } from '@zamp-platform/ui/utils';
import * as React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverAnchor, PopoverContent, PopoverPortal, PopoverTrigger } from './popover';
import { SelectOption } from './select';
import { Skeleton } from './skeleton';
import { Checkbox } from './checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

export type ComboboxOption = Omit<SelectOption, 'icon'> & { icon?: React.ReactNode };

interface BaseComboboxProps {
  options: Array<ComboboxOption>;
  open: boolean; // eslint-disable-line no-unused-vars
  onOpenChange: (open: boolean) => void; // eslint-disable-line no-unused-vars
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
  labelClassName?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  isAnchorPointNeeded?: boolean;
  disableSelectedOptions?: boolean;
  selectedValues?: Array<ComboboxOption['value']>;
  tooltipBody?: string;
  hideSearch?: boolean;
}

interface SingleSelectComboboxProps extends BaseComboboxProps {
  isMultiSelect?: false;
  onSelect: (option: ComboboxOption) => void; // eslint-disable-line no-unused-vars
  onMultiSelect?: never;
}

interface MultiSelectComboboxProps extends BaseComboboxProps {
  isMultiSelect: true;
  onMultiSelect: (selectedOptions: Array<ComboboxOption>) => void; // eslint-disable-line no-unused-vars
  onSelect?: never;
}

type ComboboxProps = SingleSelectComboboxProps | MultiSelectComboboxProps;

export function Combobox({
  options,
  onSelect,
  isMultiSelect = false,
  selectedValues = [],
  onMultiSelect,
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
  labelClassName,
  align = 'start',
  side = 'bottom',
  sideOffset = 5,
  isAnchorPointNeeded = false,
  disableSelectedOptions = false,
  tooltipBody,
  hideSearch = false,
}: ComboboxProps) {
  // Force portal usage for Safari to avoid transform context issues
  const shouldUsePortal = React.useMemo(() => {
    if (typeof window === 'undefined') return isPortalNeeded;

    // Detect Safari and force portal usage
    const userAgent = window.navigator.userAgent;
    const isSafariUA = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isWebKit = /webkit/i.test(userAgent);
    const isChrome = /chrome/i.test(userAgent);
    const isSafari = isSafariUA && isWebKit && !isChrome;

    return isPortalNeeded || isSafari;
  }, [isPortalNeeded]);

  const isValueEqual = React.useCallback((a: ComboboxOption['value'], b: ComboboxOption['value']): boolean => {
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      return a === b;
    }
    return JSON.stringify(a) === JSON.stringify(b);
  }, []);

  const isValueSelected = React.useCallback(
    (value: ComboboxOption['value']): boolean => {
      return selectedValues.some((selectedValue) => isValueEqual(selectedValue, value));
    },
    [selectedValues, isValueEqual],
  );

  const handleToggleSelection = React.useCallback(
    (option: ComboboxOption) => {
      if (!isMultiSelect || !onMultiSelect) return;

      const isSelected = isValueSelected(option.value);
      let newSelectedValues: Array<ComboboxOption['value']>;

      if (isSelected) {
        newSelectedValues = selectedValues.filter((value) => !isValueEqual(value, option.value));
      } else {
        newSelectedValues = [...selectedValues, option.value];
      }

      const selectedOptions = options.filter((opt) =>
        newSelectedValues.some((selectedValue) => isValueEqual(selectedValue, opt.value)),
      );
      onMultiSelect(selectedOptions);
    },
    [selectedValues, options, onMultiSelect, isMultiSelect, isValueSelected, isValueEqual],
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <TooltipAnchorOrTrigger
        tooltipBody={tooltipBody}
        isAnchorPointNeeded={isAnchorPointNeeded}
        triggerClassName={triggerClassName}
      >
        {children}
      </TooltipAnchorOrTrigger>
      <Portal isNeeded={shouldUsePortal}>
        <PopoverContent
          align={align}
          side={side}
          sideOffset={sideOffset}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          autoFocus={false}
          onWheel={(e) => e.stopPropagation()}
          className={cn('pointer-events-auto z-1003 min-w-(--radix-popover-trigger-width) p-0', contentClassName)}
          id={isMultiSelect ? 'multi-select-combobox-content' : 'combobox-content'}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          <Command shouldFilter={!hideSearch}>
            {!hideSearch && (
              <CommandInput placeholder={searchPlaceholder} className={cn('h-9', inputClassName)} autoFocus />
            )}
            <CommandList className={cn('', listClassName)}>
              {!optionsLoading && <CommandEmpty>{emptyText}</CommandEmpty>}
              <CommandGroup
                className={cn(
                  'max-h-60 overflow-auto [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent',
                  groupClassName,
                )}
              >
                {optionsLoading && (
                  <div className='space-y-2'>
                    {Array.from({ length: 10 }).map((_, index) => (
                      <Skeleton key={index} className='h-8 w-full' data-testid='skeleton' />
                    ))}
                  </div>
                )}
                {!optionsLoading &&
                  options?.map((option) => {
                    const isSelected = isValueSelected(option.value);

                    return (
                      <CommandItem
                        key={option?.id ?? option?.value?.toString()}
                        value={option?.label}
                        onSelect={() => {
                          if (isMultiSelect) {
                            handleToggleSelection(option);
                          } else {
                            onSelect?.(option);
                            // Close popover for single-select
                            onOpenChange(false);
                          }
                        }}
                        className={cn(
                          'flex items-center',
                          isMultiSelect ? 'justify-between gap-2 [&_svg]:size-2.5' : '',
                          itemClassName,
                        )}
                        disabled={disableSelectedOptions && isSelected}
                      >
                        <div className='flex items-center gap-2'>
                          {option?.icon && option?.icon}
                          <span className={labelClassName}>{option?.label}</span>
                        </div>
                        {isMultiSelect && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSelection(option)}
                            className='pointer-events-none' // Let the CommandItem handle clicks
                          />
                        )}
                      </CommandItem>
                    );
                  })}
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

const AnchorOrTrigger = ({
  isNeeded,
  className,
  children,
}: {
  isNeeded?: boolean;
  className?: string;
  children: React.ReactNode;
}) => {
  if (!isNeeded) {
    return (
      <PopoverTrigger asChild className={className}>
        {children}
      </PopoverTrigger>
    );
  }
  return <PopoverAnchor>{children}</PopoverAnchor>;
};

const TooltipAnchorOrTrigger = ({
  tooltipBody,
  children,
  triggerClassName,
  isAnchorPointNeeded,
}: {
  tooltipBody?: string;
  children: React.ReactNode;
  triggerClassName?: string;
  isAnchorPointNeeded?: boolean;
}) => {
  if (!tooltipBody)
    return (
      <AnchorOrTrigger className={triggerClassName} isNeeded={isAnchorPointNeeded}>
        {children}
      </AnchorOrTrigger>
    );

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <AnchorOrTrigger className={triggerClassName} isNeeded={isAnchorPointNeeded}>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
        </AnchorOrTrigger>
        <TooltipContent side='bottom'>{tooltipBody}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
