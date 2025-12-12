import { Label, Radio, RadioGroup } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormField as FormFieldType, RadioOption } from '../types';

interface RadioFieldProps {
  field: FormFieldType;
  name: string;
  className?: string;
}

export interface RadioFieldValue {
  value: string;
}

export const RadioField: React.FC<RadioFieldProps> = ({ field, name, className }) => {
  const { control } = useFormContext();

  const radioOptions = field.options as RadioOption[] | undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <div className={cn('space-y-3', className)}>
            {field.label && <Label>{field.label}</Label>}

            <RadioGroup value={value ? String(value) : undefined} onValueChange={onChange}>
              {radioOptions?.map((option) => {
                const optionValue = String(option.value);

                return (
                  <div key={optionValue} className='flex w-full items-center gap-2'>
                    <Radio value={optionValue} id={`${name}-${optionValue}`} />
                    <Label htmlFor={`${name}-${optionValue}`} className='cursor-pointer font-normal'>
                      {option.label}
                    </Label>
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
