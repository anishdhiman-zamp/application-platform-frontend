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

interface AttributeInputDropdownProps {
  attribute: AttributeType;
  name: string;
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

const AttributeInputDropdown = ({ attribute, name }: AttributeInputDropdownProps) => {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Add a small delay before closing to ensure any click events are processed
      setTimeout(() => setOpen(false), 100);
    } else {
      setOpen(true);
    }
  };

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
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger>
            <div className='relative' onClick={(e) => e.preventDefault()}>
              <Attribute
                label={attribute.label}
                displayValue={`${inputConfig.prefix_text} ${(formatter?.(Number(value)) || value) ?? 0} ${inputConfig.suffix_text}`}
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='z-[1001] p-2.5 space-y-2' sideOffset={6} align='start' side='bottom'>
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
                size='small'
                min={inputConfig.min}
                max={inputConfig.max}
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
