import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Attribute,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from '@zamp-platform/ui';
import { AttributeType, InputConfig } from 'modules/policies/types';
import { cn } from 'utils/common';

interface AttributeInputDropdownProps {
  attribute: AttributeType;
  name: string;
  error?: string;
}

const getInputType = (type: string) => {
  switch (type) {
    case 'number':
      return 'number';
    case 'date':
      return 'date';
    case 'datetime':
      return 'datetime-local';
    default:
      return 'text';
  }
};

const AttributeInputDropdown = ({ attribute, name, error }: AttributeInputDropdownProps) => {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);

  // Type guard to check if attribute has input_config
  const hasInputConfig = (attr: AttributeType): attr is AttributeType & { input_config: InputConfig } => {
    return 'input_config' in attr && attr.input_config !== undefined;
  };

  if (!hasInputConfig(attribute)) {
    return null;
  }

  const inputConfig = attribute.input_config;
  const formatter = attribute.displayValueFormatter;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=''
      render={({ field: { value, onChange } }) => (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <div
              className='cursor-pointer'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Attribute
                className={cn({
                  'border border-red-500 rounded-md': error,
                })}
                label={attribute.label}
                displayValue={`${inputConfig.prefix_text} ${(formatter?.(Number(value)) || value) ?? 0} ${inputConfig.suffix_text}`}
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='z-[1001] p-2.5 space-y-2'
            sideOffset={6}
            align='start'
            side='bottom'
            autoFocus={false}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <DropdownMenuItem className='p-0'>
              <div className='flex items-center gap-2'>
                <p className='f-11-400 text-gray-700'>{inputConfig.label}</p>
                {inputConfig.suffix_text && <p className='f-11-500 text-blue-700'>{inputConfig.prefix_text}</p>}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className='cursor-text' asChild onSelect={(e) => e.preventDefault()}>
              <Input
                id={attribute.id}
                name={attribute.id}
                type={getInputType(inputConfig.type)}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={inputConfig.placeholder}
                onFocus={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                size='small'
                min={inputConfig.min}
                max={inputConfig.max}
                tabIndex={0}
                className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  );
};

export default AttributeInputDropdown;
