import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Skeleton } from './skeleton';
import { SizeType } from '@zamp-platform/ui/types';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface SelectOption {
  label: string;
  richLabel?: React.ReactNode;
  value: string | boolean | { type: string; id: string };
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  placeholder?: string;
  variant?: SizeType;
  className?: string;
  label?: string;
  fetchOptions?: (page: number) => Promise<{ options: SelectOption[]; hasMore: boolean }>;
  value?: string | { type: string; id: string } | boolean;
  onValueChange?: (value: string | { type: string; id: string } | boolean) => void;
  onBlur?: () => void;
  clearOptions?: boolean;
  setShouldClearOptions?: (shouldClearOptions: boolean) => void;
}

const Select = React.forwardRef<HTMLInputElement, SelectProps>(
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
      onBlur,
      clearOptions,
      setShouldClearOptions,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [dynamicOptions, setDynamicOptions] = useState<SelectOption[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    useEffect(() => {
      if (clearOptions) {
        setDynamicOptions([]);
        setPage(1);
        setShouldClearOptions?.(false);
      }
    }, [clearOptions, setShouldClearOptions]);

    useEffect(() => {
      if (isOpen && fetchOptions && dynamicOptions.length === 0 && !loading) {
        fetchMoreOptions();
      }
    }, [isOpen]);

    const fetchMoreOptions = async () => {
      if (!fetchOptions) return;
      setLoading(true);
      try {
        const result = await fetchOptions(page);
        setDynamicOptions((prev) => [...prev, ...result.options]);
        if (result.hasMore) setPage((p) => p + 1);
      } catch (error) {
        console.log('Error loading options:', error);
      } finally {
        setLoading(false);
      }
    };

    const options = fetchOptions ? dynamicOptions : initialOptions;
    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()));

    useEffect(() => {
      setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1);
    }, [searchQuery, isOpen, filteredOptions.length]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    };

    const handleOptionClick = (option: SelectOption) => {
      onValueChange?.(option.value);
      setSearchQuery(option.label);
      setIsOpen(false);
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (popoverRef.current && e.relatedTarget && popoverRef.current.contains(e.relatedTarget as Node)) {
        return;
      }
      setIsOpen(false);
      onBlur?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev === 0 ? filteredOptions.length - 1 : prev - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    useEffect(() => {
      if (value !== undefined && value !== null) {
        const selected = options.find((o) => o.value === value);
        if (selected) setSearchQuery(selected.label);
      }
    }, [value, options]);

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

    return (
      <Popover.Root open={isOpen}>
        <Popover.Anchor
          asChild
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (!isOpen) {
              setSearchQuery('');
              onValueChange?.(null as any);
            }
          }}
        >
          <div className={cn('relative w-full', className)}>
            {label && <label className='block mb-1 text-sm font-medium'>{label}</label>}
            <input
              type='text'
              className={cn(
                'f-13-400 flex w-full items-center placeholder:text-gray-700 rounded-md border border-input focus:border-gray-600 bg-white px-3 outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
                searchQuery ? 'text-primary' : 'text-gray-700',
                getVariantStyles(variant),
              )}
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              autoComplete='off'
              aria-autocomplete='list'
              aria-expanded={isOpen}
              aria-controls='combobox-listbox'
            />

            <ChevronDown
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 transition-transform duration-200 text-gray-900 pointer-events-none',
                isOpen && 'rotate-180',
              )}
            />
          </div>
        </Popover.Anchor>
        <Popover.Content
          ref={popoverRef}
          align='start'
          sideOffset={5}
          autoFocus={false}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          className={cn(
            'z-[1002] w-full min-w-[200px] rounded-md border border-gray-200 bg-white shadow-lg mt-1',
            'max-h-60 overflow-auto',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            '[&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent',
          )}
          id='combobox-listbox'
          tabIndex={-1}
        >
          <div className='p-1'>
            {filteredOptions.length === 0 && !loading && (
              <div className='px-2 py-2 text-gray-500 text-sm'>No options</div>
            )}
            {filteredOptions.map((option, idx) => (
              <div
                key={option.value?.toString() + idx}
                className={cn(
                  'flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm transition-colors',
                  idx === highlightedIndex ? 'bg-gray-100 text-primary' : 'hover:bg-gray-100',
                )}
                onMouseDown={() => handleOptionClick(option)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                role='option'
                aria-selected={idx === highlightedIndex}
              >
                {option.icon && (
                  <span className='mr-2 flex h-4 w-4 items-center justify-center text-gray-400'>{option.icon}</span>
                )}
                {option.richLabel || option.label}
              </div>
            ))}
            {loading && (
              <div className='space-y-2 p-2'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className='h-6 w-full' />
                ))}
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Root>
    );
  },
);
Select.displayName = 'Select';

export { Select };
