import { Label, Radio, RadioGroup } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { getInlineFieldDisplayClass, getOptionWrapperClass, useInlineField } from '../hooks/useInlineField';
import { FormField as FormFieldType, InlineFieldDisplayMode, RadioOption } from '../types';
import { InlineField } from './InlineField';

interface RadioFieldProps {
  field: FormFieldType;
  name: string;
  className?: string;
  schemaFields?: Record<string, FormFieldType>;
}

export interface RadioFieldValue {
  value: string;
}

export const RadioField: React.FC<RadioFieldProps> = ({ field, name, className, schemaFields = {} }) => {
  const { control } = useFormContext();
  const { isInlineFieldVisible, hasInlineField, handleOptionChange } = useInlineField({
    clearOnDeselect: true,
  });

  const radioOptions = (field.options as RadioOption[] | undefined) ?? [];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const handleChange = (newValue: string) => {
          handleOptionChange(newValue, radioOptions, schemaFields);
          onChange(newValue);
        };

        return (
          <div className={cn('space-y-3', className)}>
            {field.label && <Label>{field.label}</Label>}

            <RadioGroup value={value ? String(value) : undefined} onValueChange={handleChange}>
              {radioOptions.map((option) => {
                const optionValue = String(option.value);
                const optionHasInlineField = hasInlineField(option);
                const inlineFieldConfig = option.inline_field;
                const isSelected = value === optionValue;
                const showInlineField = optionHasInlineField && isInlineFieldVisible(option, value);
                const displayMode = inlineFieldConfig?.display_mode;

                const shouldShowLabel = !showInlineField || displayMode !== InlineFieldDisplayMode.REPLACE;

                return (
                  <div key={optionValue} className={cn(getOptionWrapperClass(optionHasInlineField, displayMode))}>
                    <div className='flex items-center gap-2'>
                      <Radio value={optionValue} id={`${name}-${optionValue}`} />

                      {shouldShowLabel && (
                        <Label htmlFor={`${name}-${optionValue}`} className='cursor-pointer font-normal'>
                          {option.label}
                        </Label>
                      )}

                      {showInlineField &&
                        (displayMode === InlineFieldDisplayMode.REPLACE ||
                          displayMode === InlineFieldDisplayMode.AFTER) &&
                        inlineFieldConfig && (
                          <div className={getInlineFieldDisplayClass(displayMode)}>
                            <InlineField
                              inlineConfig={inlineFieldConfig}
                              schemaFields={schemaFields}
                              isSelected={isSelected}
                            />
                          </div>
                        )}
                    </div>

                    {showInlineField && displayMode === InlineFieldDisplayMode.BELOW && inlineFieldConfig && (
                      <div className={getInlineFieldDisplayClass(displayMode)}>
                        <InlineField
                          inlineConfig={inlineFieldConfig}
                          schemaFields={schemaFields}
                          isSelected={isSelected}
                        />
                      </div>
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
