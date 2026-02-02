import { Button, CopyToClipboard, Input, Label } from '@zamp-platform/ui';
import { Copy } from 'lucide-react';
import React, { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormField as FormFieldType } from '../types';

export interface EmailAliasFieldType extends FormFieldType {
  prefix?: string;
  suffix?: string;
}

interface EmailAliasFieldProps {
  field: EmailAliasFieldType;
  name: string;
  className?: string;
}

export const EmailAliasField: React.FC<EmailAliasFieldProps> = ({ field, name, className }) => {
  const { control, clearErrors, getValues } = useFormContext();

  // Prefer field config prefix/suffix if present, otherwise fallback to props
  const effectivePrefix = field.prefix ?? '';
  const effectiveSuffix = field.suffix ?? '';

  const copyText = useMemo(() => {
    const currentValue = (getValues(name) as string | undefined) ?? '';
    return `${effectivePrefix}${currentValue}${effectiveSuffix}`;
  }, [effectivePrefix, effectiveSuffix, getValues, name]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref, onBlur }, fieldState }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          // Remove spaces and invalid email characters (only allow: letters, numbers, dots, hyphens, underscores, plus signs)
          // These are valid characters for the local part of an email address
          const sanitizedValue = e.target.value.replace(/[^\w.+-]/g, '');
          onChange({ ...e, target: { ...e.target, value: sanitizedValue } });
          if (sanitizedValue) {
            clearErrors(name);
          }
        };

        return (
          <div className={`space-y-2 ${className ?? ''}`}>
            {field.label && <Label>{field.label}</Label>}

            <div className='flex items-center gap-2'>
              {effectivePrefix ? <span className='text-GRAY_600 f-14-400'>{effectivePrefix}</span> : null}

              <Input
                placeholder={field.placeholder}
                id={name}
                value={value || ''}
                onChange={handleChange}
                onBlur={onBlur}
                ref={ref}
                className={fieldState.error ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={fieldState.error ? 'true' : 'false'}
              />

              {effectiveSuffix ? <span className='text-GRAY_600 f-14-400'>{effectiveSuffix}</span> : null}

              <CopyToClipboard text={copyText} tooltipText='Copy email'>
                <Button type='button' variant='ghost' size='icon' aria-label='Copy email' className='text-GRAY_700'>
                  <Copy className='h-4 w-4' />
                </Button>
              </CopyToClipboard>
            </div>

            {fieldState.error?.message ? (
              <span
                className='f-11-400 transition-all duration-200 ease-in-out'
                style={{ marginBottom: '12px', color: 'var(--RED_700)' }}
              >
                {fieldState.error.message}
              </span>
            ) : null}
          </div>
        );
      }}
    />
  );
};
