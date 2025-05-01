import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Attribute, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, Input } from '@zamp-platform/ui';
import { AttributeType, InputConfig } from 'modules/policies/create/constants';
import { SIZE_TYPES } from 'types/common/components';

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
      defaultValue={0}
      render={({ field: { value, onChange } }) => (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <div className='relative'>
              <Attribute
                label={attribute.label}
                displayValue={`${inputConfig.prefix_text} ${(formatter?.(Number(value)) || value) ?? 0} ${inputConfig.suffix_text}`}
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='z-[1001] p-2.5' sideOffset={6} align='start' side='bottom'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <p className='f-11-400 text-gray-700'>{inputConfig.label}</p>
                {inputConfig.suffix_text && <p className='f-11-500 text-blue-700'>{inputConfig.prefix_text}</p>}
              </div>
              <Input
                type={getInputType(inputConfig.type)}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={inputConfig.placeholder}
                size={SIZE_TYPES.SMALL}
                min={inputConfig.min}
                max={inputConfig.max}
                autoFocus
                className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  );
};

export default AttributeInputDropdown;
