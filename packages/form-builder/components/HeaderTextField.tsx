import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
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
          <div className='flex items-end justify-between gap-2'>
            <input
              type='text'
              name={name}
              className={cn(
                'f-22-500 placeholder:text-gray-500 text-primary focus:outline-none [&:not(:placeholder-shown)]:border-transparent min-w-[fit-content] bg-white [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]',
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
            {!value && <SvgSpriteLoader id='edit-03' className='text-gray-900' size={14} />}
          </div>
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
