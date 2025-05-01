import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Skeleton } from './skeleton';
import { SizeType } from '@zamp-platform/ui/types';

export interface SelectOption {
  label: string;
  richLabel?: React.ReactNode;
  value: string;
  icon?: React.ReactNode;
}

export interface SelectProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>, 'children'> {
  options: SelectOption[];
  placeholder?: string;
  variant?: SizeType;
  className?: string;
  label?: string;
  fetchOptions?: (page: number) => Promise<{ options: SelectOption[]; hasMore: boolean }>;
  value?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  clearOptions?: boolean;
  setShouldClearOptions?: (shouldClearOptions: boolean) => void;
}

const Select = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Root>, SelectProps>(
  (
    {
      options: initialOptions,
      placeholder,
      variant = 'medium',
      className,
      label,
      fetchOptions,
      value,
      onValueChange,
      clearOptions,
      onBlur,
      setShouldClearOptions,
      ...props
    },
    ref,
  ) => {
    const [page, setPage] = React.useState(1);
    const [loading, setLoading] = React.useState(false);
    const [dynamicOptions, setDynamicOptions] = React.useState<SelectOption[]>([]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedOption, setSelectedOption] = React.useState<SelectOption | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const fetchMoreOptions = React.useCallback(async () => {
      if (!fetchOptions) return;
      setLoading(true);
      try {
        const result = await fetchOptions(page);
        setDynamicOptions((prev) => [...prev, ...result.options]);
      } catch (error) {
        console.log('Error loading options:', error);
      } finally {
        setLoading(false);
      }
    }, [fetchOptions, page]);

    const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (open && dynamicOptions.length === 0) {
        fetchMoreOptions?.();
      }
      if (!open) {
        setSearchQuery('');
        inputRef.current?.blur();
      } else {
        inputRef.current?.focus();
      }
      if (props.onOpenChange) {
        props.onOpenChange(open);
      }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      setSearchQuery(e.target.value);
    };

    const handleSearchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setSelectedOption(null);
      setSearchQuery('');
      e.stopPropagation();
      e.preventDefault();
      if (isOpen) {
        inputRef.current?.focus();
      } else {
        inputRef.current?.blur();
      }
    };

    const handleBlur = (e: React.FocusEvent) => {
      // Only close if we're not focusing within the dropdown
      const relatedTarget = e.relatedTarget as HTMLElement;
      const isWithinDropdown = relatedTarget?.closest('[data-radix-popper-content-wrapper]');

      if (!isWithinDropdown) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    const options = fetchOptions ? dynamicOptions : initialOptions;
    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()));

    const getVariantStyles = (variant: SizeType) => {
      switch (variant) {
        case 'small':
          return 'h-8';
        case 'medium':
          return 'h-10';
        case 'large':
          return 'h-12 text-lg';
        case 'xlarge':
          return 'h-14 text-xl';
        case 'xsmall':
          return 'h-6 text-xs';
        default:
          return 'h-10 text-base';
      }
    };

    React.useEffect(() => {
      if (clearOptions) {
        setDynamicOptions([]);
        setPage(1);
        setShouldClearOptions?.(false);
      }
    }, [clearOptions, setShouldClearOptions]);

    return (
      <DropdownMenuPrimitive.Root {...props} open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuPrimitive.Trigger
          ref={ref}
          onClick={handleSearchClick}
          onBlur={handleBlur}
          className={cn(
            'f-13-400 flex w-full items-center justify-between rounded-md border border-input focus:border-gray-600 bg-white px-3 outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
            value ? 'text-primary' : 'text-gray-700',
            'data-[state=open]:border-gray-600 data-[state=open]:ring-2 data-[state=open]:ring-gray-400',
            getVariantStyles(variant),
            className,
          )}
        >
          <Search className='h-4 w-4 text-gray-400 mr-2' />
          <input
            ref={inputRef}
            type='text'
            placeholder={placeholder}
            value={selectedOption?.label || searchQuery}
            onChange={handleSearchChange}
            className='h-full w-full bg-transparent border-none outline-none text-sm placeholder:text-gray-700 text-primary'
          />
          <ChevronDown
            className={cn('h-4 w-4 opacity-50 transition-transform duration-200 text-gray-900', isOpen && 'rotate-180')}
          />
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            className={cn(
              'relative z-[1002] min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-scroll rounded-md border border-gray-200 bg-white shadow-lg',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[300px]',
            )}
            sideOffset={6}
            align='start'
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <div className='p-1'>
              {filteredOptions.map((option, index) => (
                <DropdownMenuPrimitive.Item
                  key={`${option.value}_${index}`}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                    'hover:bg-gray-100 focus:bg-gray-100',
                    'data-[state=checked]:bg-gray-100',
                  )}
                  onSelect={() => {
                    setSelectedOption(option);
                    onValueChange?.(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.icon && (
                    <span className='mr-2 flex h-4 w-4 items-center justify-center text-gray-400'>{option.icon}</span>
                  )}
                  {option.label}
                </DropdownMenuPrimitive.Item>
              ))}
              {loading && (
                <div className='space-y-2 p-2'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className='h-6 w-full' />
                  ))}
                </div>
              )}
            </div>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    );
  },
);
Select.displayName = 'Select';

export { Select };
