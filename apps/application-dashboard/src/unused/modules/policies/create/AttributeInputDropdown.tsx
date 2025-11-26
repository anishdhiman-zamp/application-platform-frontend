import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Attribute, Input, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { cn } from 'utils/common';
import { AttributeType, InputConfig } from '@/unused/modules/policies/types';

interface AttributeInputDropdownProps {
  attribute: AttributeType;
  name: string;
  error?: string;
}

const AttributeInputDropdown = ({ attribute, name, error }: AttributeInputDropdownProps) => {
  const { control, setValue } = useFormContext();

  useEffect(() => {
    setValue(name, attribute.defaultValue);
  }, [name, attribute.defaultValue, setValue]);

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
        <Popover
          onOpenChange={(open) => {
            const parentElement = document.getElementById(attribute.id)?.parentElement;

            if (open && parentElement) {
              parentElement.style.pointerEvents = 'none';
            } else if (parentElement) {
              parentElement.style.pointerEvents = 'auto';
            }
          }}
        >
          <PopoverTrigger id={attribute.id} asChild>
            <Attribute
              className={cn({
                'rounded-md border border-red-500': error,
              })}
              label={attribute.label}
              displayValue={`${inputConfig.prefix_text} ${(formatter?.(Number(value)) || value) ?? 0} ${inputConfig.suffix_text}`}
            />
          </PopoverTrigger>
          <PopoverContent className='pointer-events-auto space-y-2 p-2.5' sideOffset={6} align='start' side='bottom'>
            <div className='flex items-center gap-2'>
              <p className='f-11-400 text-gray-700'>{inputConfig.label}</p>
              {inputConfig.suffix_text && <p className='f-11-500 text-blue-700'>{inputConfig.prefix_text}</p>}
            </div>
            <Input
              id={attribute.id}
              name={attribute.id}
              type={inputConfig.type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={inputConfig.placeholder}
              size='small'
              min={inputConfig.min}
              max={inputConfig.max}
              tabIndex={0}
              className='[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
            />
          </PopoverContent>
        </Popover>
      )}
    />
  );
};

export default AttributeInputDropdown;
