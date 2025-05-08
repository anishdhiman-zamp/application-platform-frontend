import { cn } from '@zamp-platform/ui/lib/utils';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormField as FormFieldType } from '../types';

interface HeaderTextFieldProps {
  field: FormFieldType;
  name: string;
  className?: string;
}

export const HeaderTextField: React.FC<HeaderTextFieldProps> = ({ field, name, className }) => {
  const { control, clearErrors } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref, onBlur }, fieldState }) => (
        <div className={`flex flex-col space-y-2 ${className}`}>
          <input
            type='text'
            name={name}
            className={cn(
              'f-22-500 placeholder:text-gray-500 text-primary focus:outline-none border-b border-primary border-dotted [&:not(:placeholder-shown)]:border-transparent w-fit',
              fieldState.error && 'border-destructive focus-visible:ring-destructive',
            )}
            placeholder={field.placeholder || field.label}
            id={name}
            onFocus={(e) => e.stopPropagation()}
            value={value || ''}
            onChange={(e) => {
              onChange(e);
              if (!e.target.value) {
                clearErrors(name);
              }
            }}
            onBlur={onBlur}
            ref={ref}
            aria-invalid={fieldState.error ? 'true' : 'false'}
          />
          {fieldState.error?.message ? (
            <span
              className='transition-all duration-200 f-11-400 ease-in-out'
              style={{ marginBottom: '12px', color: 'var(--RED_700)' }}
            >
              {fieldState.error.message}
            </span>
          ) : null}
        </div>
      )}
    />
  );
};
