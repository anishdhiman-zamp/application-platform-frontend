import { Combobox, ComboboxOption, Label } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { X } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormField as FormFieldType } from '../types';

interface MultiSelectFieldProps {
  field: FormFieldType;
  name: string;
  className?: string;
}

interface MultiSelectFieldInnerProps {
  field: FormFieldType;
  options: ComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: { message?: string };
  className?: string;
}

const MultiSelectFieldInner: React.FC<MultiSelectFieldInnerProps> = ({
  field,
  options,
  value,
  onChange,
  error,
  className,
}) => {
  const [open, setOpen] = useState(false);

  const selectedValues: string[] = Array.isArray(value) ? value : [];

  const handleMultiSelect = useCallback(
    (selectedOptions: ComboboxOption[]) => {
      onChange(selectedOptions.map((opt) => opt.value as string));
    },
    [onChange],
  );

  const handleRemove = useCallback(
    (valueToRemove: string) => {
      onChange(selectedValues.filter((v) => v !== valueToRemove));
    },
    [onChange, selectedValues],
  );

  const selectedLabels = useMemo(
    () =>
      selectedValues
        .map((val) => {
          const opt = options.find((o) => o.value === val);
          return opt ? { value: val, label: opt.label } : null;
        })
        .filter(Boolean) as { value: string; label: string }[],
    [selectedValues, options],
  );

  return (
    <div className={cn('space-y-2', className)}>
      {field.label && <Label>{field.label}</Label>}
      <Combobox
        isMultiSelect
        options={options}
        selectedValues={selectedValues}
        onMultiSelect={handleMultiSelect}
        open={open}
        onOpenChange={setOpen}
        placeholder={field.placeholder}
        searchPlaceholder='Search options...'
        emptyText='No options found.'
        isPortalNeeded
      >
        <button
          type='button'
          className={cn(
            'f-13-400 border-GRAY_400 flex min-h-8 w-full items-center rounded-md border bg-white px-3 py-1 text-left outline-hidden',
            'hover:border-GRAY_500 focus:border-GRAY_600 focus:ring-GRAY_400 focus:ring-2',
            error && 'border-destructive focus-visible:ring-destructive',
          )}
        >
          {selectedValues.length === 0 ? (
            <span className='text-GRAY_700'>{field.placeholder ?? 'Select options...'}</span>
          ) : (
            <span className='text-GRAY_900'>
              {selectedValues.length} option{selectedValues.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </button>
      </Combobox>
      {selectedLabels.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {selectedLabels.map((item) => (
            <span
              key={item.value}
              className='bg-GRAY_100 text-GRAY_900 f-11-400 inline-flex items-center gap-1 rounded-md px-2 py-0.5'
            >
              {item.label}
              <button
                type='button'
                onClick={() => handleRemove(item.value)}
                className='text-GRAY_600 hover:text-GRAY_900 rounded-sm outline-hidden'
              >
                <X className='size-3' />
              </button>
            </span>
          ))}
        </div>
      )}
      {error?.message && (
        <span
          className='f-11-400 transition-all duration-200 ease-in-out'
          style={{ marginBottom: '12px', color: 'var(--RED_700)' }}
        >
          {error.message}
        </span>
      )}
    </div>
  );
};

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({ field, name, className }) => {
  const { control } = useFormContext();

  const options: ComboboxOption[] = useMemo(
    () =>
      field.options?.map((option) => ({
        label: option.label ?? '',
        value: option.value,
      })) ?? [],
    [field.options],
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
        <MultiSelectFieldInner
          field={field}
          options={options}
          value={value}
          onChange={onChange}
          error={fieldError}
          className={className}
        />
      )}
    />
  );
};
