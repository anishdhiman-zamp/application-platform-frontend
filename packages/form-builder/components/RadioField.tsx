import { Label, Radio, RadioGroup } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useClearPreviousInlineField } from '../hooks/useClearPreviousInlineField';
import { FormField as FormFieldType, RadioOption } from '../types';
import { FormField } from './FormField';

interface RadioFieldProps {
  field: FormFieldType;
  name: string;
  className?: string;
  inlineFields?: Record<string, FormFieldType>;
}

export interface RadioFieldValue {
  value: string;
}

export const RadioField: React.FC<RadioFieldProps> = ({ field, name, className, inlineFields = {} }) => {
  const { control } = useFormContext();
  const { handleClearPreviousField } = useClearPreviousInlineField({
    clearOnDeselect: true,
  });

  const radioOptions = (field.options as RadioOption[] | undefined) ?? [];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const handleChange = (newValue: string) => {
          handleClearPreviousField(newValue, radioOptions, inlineFields);
          onChange(newValue);
        };

        return (
          <div className={cn('space-y-3', className)}>
            {field.label && <Label>{field.label}</Label>}

            <RadioGroup value={value ? String(value) : undefined} onValueChange={handleChange}>
              {radioOptions.map((option) => {
                const optionValue = String(option.value);
                const inlineFieldConfig = option.inline_field;

                return (
                  <div key={optionValue}>
                    <div className={cn('flex gap-2', inlineFieldConfig ? 'items-start' : 'items-center')}>
                      <Radio
                        value={optionValue}
                        id={`${name}-${optionValue}`}
                        className={inlineFieldConfig ? 'mt-2' : ''}
                      />

                      {!inlineFieldConfig && (
                        <Label htmlFor={`${name}-${optionValue}`} className='cursor-pointer font-normal'>
                          {option.label}
                        </Label>
                      )}

                      {inlineFieldConfig && inlineFields[inlineFieldConfig.field] && (
                        <FormField field={inlineFields[inlineFieldConfig.field]} name={inlineFieldConfig.field} />
                      )}
                    </div>
                  </div>
                );
              })}
            </RadioGroup>

            {error?.message && (
              <span className='f-11-400 transition-all duration-200 ease-in-out' style={{ color: 'var(--RED_700)' }}>
                {error.message}
              </span>
            )}
          </div>
        );
      }}
    />
  );
};
