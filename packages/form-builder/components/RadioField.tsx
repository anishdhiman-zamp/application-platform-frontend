import { Input, Label, Radio, RadioGroup } from '@zamp-platform/ui';
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
  input?: string;
}

export const RadioField: React.FC<RadioFieldProps> = ({ field, name, className }) => {
  const { control } = useFormContext();

  const radioOptions = field.options as RadioOption[] | undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        // Normalize value - can be string or { value, input } object
        const currentValue = typeof value === 'object' ? value?.value : value;
        const currentInput = typeof value === 'object' ? value?.input : '';

        return (
          <div className={cn('space-y-3', className)}>
            {field.label && <Label>{field.label}</Label>}

            <RadioGroup
              value={currentValue ? String(currentValue) : undefined}
              onValueChange={(newValue) => {
                const option = radioOptions?.find((opt) => String(opt.value) === newValue);
                // Store as object if selected option has_input, otherwise just value
                if (option?.has_input) {
                  onChange({ value: newValue, input: '' });
                } else {
                  onChange(newValue);
                }
              }}
            >
              {radioOptions?.map((option) => {
                const optionValue = String(option.value);
                const isSelected = optionValue === String(currentValue);
                const hasInlineInput = option.has_input && !option.label;

                return (
                  <div key={optionValue} className='space-y-2'>
                    <div className='flex w-full items-center gap-2'>
                      <Radio value={optionValue} id={`${name}-${optionValue}`} />
                      {/* Inline input when has_input and no label */}
                      {hasInlineInput ? (
                        <Input
                          className='flex-1'
                          placeholder={option.input_placeholder || 'Please specify...'}
                          value={isSelected ? currentInput || '' : ''}
                          onChange={(e) => {
                            onChange({ value: optionValue, input: e.target.value });
                          }}
                          onFocus={() => {
                            if (!isSelected) {
                              onChange({ value: optionValue, input: '' });
                            }
                          }}
                        />
                      ) : (
                        <Label htmlFor={`${name}-${optionValue}`} className='cursor-pointer font-normal'>
                          {option.label}
                        </Label>
                      )}
                    </div>

                    {/* Show input below when this option is selected AND has_input is true AND has label */}
                    {option.has_input && option.label && isSelected && (
                      <Input
                        className='ml-6'
                        placeholder={option.input_placeholder || 'Please specify...'}
                        value={currentInput || ''}
                        onChange={(e) => {
                          onChange({ value: optionValue, input: e.target.value });
                        }}
                      />
                    )}
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
