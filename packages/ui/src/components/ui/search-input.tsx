'use client';

import * as React from 'react';
import { useMemo, useState, useCallback } from 'react';
import { X, Search } from 'lucide-react';

import { SizeType } from '@zamp-platform/ui/types';
import { cn } from '@zamp-platform/ui/utils';
import { Input } from './input';
import { Button } from './button';

const DEFAULT_DEBOUNCE_MS = 300;

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  size?: SizeType;
  className?: string;
  wrapperClassName?: string;
  autoFocus?: boolean;
  'aria-label'?: string;
  showSearchIcon?: boolean;
  clearButtonClassName?: string;
  testId?: string;
}

const SearchInput = ({
  placeholder = 'Search',
  value: controlledValue,
  onChange,
  onDebouncedChange,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  size = 'small',
  className,
  wrapperClassName,
  autoFocus,
  'aria-label': ariaLabel,
  showSearchIcon = false,
  clearButtonClassName,
  testId,
}: SearchInputProps) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState('');
  const inputValue = isControlled ? controlledValue : internalValue;

  const debouncedSearch = useMemo(() => {
    if (!onDebouncedChange) return undefined;

    let timeoutId: ReturnType<typeof setTimeout>;
    return (searchValue: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onDebouncedChange(searchValue);
      }, debounceMs);
    };
  }, [onDebouncedChange, debounceMs]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;

      if (!isControlled) {
        setInternalValue(value);
      }

      onChange?.(value);
      debouncedSearch?.(value);
    },
    [isControlled, onChange, debouncedSearch],
  );

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }

    onChange?.('');
    onDebouncedChange?.('');
  }, [isControlled, onChange, onDebouncedChange]);

  return (
    <div className={cn('relative', wrapperClassName)}>
      <Input
        placeholder={placeholder}
        value={inputValue}
        icon={showSearchIcon ? <Search className='text-GRAY_500 size-3.5' /> : undefined}
        onChange={handleChange}
        className={cn('border-GRAY_400 focus:border-GRAY_600 pr-8 focus:ring-3', className)}
        size={size}
        iconPosition='leading'
        autoFocus={autoFocus}
        aria-label={ariaLabel ?? placeholder}
        data-testid={testId}
      />
      {inputValue && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className={cn(
            'text-GRAY_700 absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 hover:bg-transparent',
            clearButtonClassName,
          )}
          onClick={handleClear}
          aria-label='Clear search'
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
};

SearchInput.displayName = 'SearchInput';

export { SearchInput };
export type { SearchInputProps };
