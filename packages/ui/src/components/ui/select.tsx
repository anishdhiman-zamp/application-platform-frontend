'use client';

import { ICON_SPRITE_TYPES, SizeType } from '@zamp-platform/ui/types';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { SvgSpriteLoader } from '../assets';
import { Combobox } from './combobox';

export interface SelectOption {
  id?: string;
  label: string;
  richLabel?: React.ReactNode;
  value: string | boolean | { type: string; id: string };
  icon?: SelectIcon;
  display_value?: React.ReactNode;
}

export interface SelectIcon {
  type: 'sprite' | 'icon';
  category?: ICON_SPRITE_TYPES;
  id?: string;
  name?: string;
}

export interface SelectProps {
  options: SelectOption[];
  placeholder?: string;
  variant?: SizeType;
  className?: string;
  label?: string;
  fetchOptions?: (page: number) => Promise<{ options: SelectOption[]; hasMore: boolean }>; // eslint-disable-line no-unused-vars
  value?: SelectOption['display_value'] | SelectOption['value']; // eslint-disable-line no-unused-vars
  onValueChange?: (value: SelectOption['display_value'] | SelectOption['value']) => void;
  onBlur?: () => void;
  clearOptions?: boolean;
  setShouldClearOptions?: (_shouldClearOptions: boolean) => void; // eslint-disable-line no-unused-vars
}

const RenderIcon = ({ icon, className }: { icon: SelectIcon; className?: string }) => {
  if (icon?.type === 'sprite') {
    return (
      <SvgSpriteLoader
        lazyLoading={true}
        id={icon.id ?? ''}
        iconCategory={icon.category ?? ICON_SPRITE_TYPES.COUNTRY_FLAGS}
        className={className}
      />
    );
  }
  return null;
};

const Select = forwardRef<HTMLInputElement, SelectProps>(
  (
    {
      options: initialOptions,
      placeholder,
      className,
      label,
      fetchOptions,
      value,
      onValueChange,
      clearOptions,
      setShouldClearOptions,
    },
    _ref, // eslint-disable-line no-unused-vars
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [_page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [dynamicOptions, setDynamicOptions] = useState<SelectOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<Pick<
      SelectOption,
      'value' | 'display_value' | 'id' | 'label'
    > | null>(null);

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
        const result = await fetchOptions(_page);
        setDynamicOptions((prev) => [...prev, ...result.options]);
        if (result.hasMore) setPage((p) => p + 1);
      } catch (error) {
        console.log('Error loading options:', error);
      } finally {
        setLoading(false);
      }
    };

    const comboboxOptions = useMemo(() => {
      const options = fetchOptions ? dynamicOptions : initialOptions;
      return options.map((option) => ({
        ...option,
        icon: option.icon && <RenderIcon icon={option.icon} className='mr-2' />,
      }));
    }, [fetchOptions, initialOptions, dynamicOptions]);

    return (
      <div className={cn('relative w-full', className)}>
        {label && <label className='mb-1 block text-sm font-medium'>{label}</label>}
        <Combobox
          optionsLoading={loading}
          options={comboboxOptions}
          onSelect={(selectedOption) => {
            onValueChange?.(selectedOption.value);
            setSelectedOption({
              value: selectedOption.value,
              display_value: selectedOption.display_value,
              id: selectedOption.id,
              label: selectedOption.label,
            });
            setIsOpen(false);
          }}
          open={isOpen}
          onOpenChange={setIsOpen}
          emptyText='No options'
          itemClassName='flex items-center px-2 py-1.5'
        >
          <div
            className={cn(
              'f-13-400 border-input flex h-10 w-full cursor-pointer items-center rounded-md border bg-white px-3 outline-hidden placeholder:text-gray-700 focus:border-gray-600 focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
              value ? 'text-primary' : 'text-gray-700',
            )}
            data-testid='select-trigger'
          >
            <span className='flex-1 truncate'>
              {selectedOption?.display_value || selectedOption?.label || placeholder}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-900 opacity-50 transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
            />
          </div>
        </Combobox>
      </div>
    );
  },
);

Select.displayName = 'Select';

export { Select };
