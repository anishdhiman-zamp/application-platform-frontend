import { Input, Label } from '@zamp-platform/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormField as FormFieldType } from '../types';

interface TextFieldProps {
  field: FormFieldType;
  name: string;
  className?: string;
}

export const TextField: React.FC<TextFieldProps> = ({ field, name, className }) => {
  const { control, clearErrors } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref, onBlur }, fieldState }) => (
        <div className={`space-y-2 ${className}`}>
          {field.label && <Label>{field.label}</Label>}
          <Input
            placeholder={field.placeholder}
            type={field.type || 'text'}
            id={name}
            value={value || ''}
            onChange={(e) => {
              onChange(e);
              if (e.target.value) {
                clearErrors(name);
              }
            }}
            onBlur={onBlur}
            ref={ref}
            className={fieldState.error ? 'border-destructive focus-visible:ring-destructive' : ''}
            aria-invalid={fieldState.error ? 'true' : 'false'}
          />
          {fieldState.error?.message ? (
            <span
              className='f-11-400 transition-all duration-200 ease-in-out'
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
