import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { captureException } from '@sentry/browser';
import { DataSource, fetchDataSource } from '@zamp-platform/form-builder';
import {
  Attribute,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  SelectOption,
  Skeleton,
} from '@zamp-platform/ui';
import { AttributeType } from 'modules/policies/types';
import { cn } from 'utils/common';

const useCustomHook = (dataSource?: DataSource) => {
  if (!dataSource || !dataSource.useCustomHook) return { data: undefined, loading: false, error: undefined };
  const { data, loading, error } = dataSource.useCustomHook(dataSource.params);

  return { data, loading, error };
};

interface AttributeDropdownProps {
  attribute: AttributeType;
  name: string;
  error?: string;
  isMultiSelect?: boolean;
}

const AttributeMenuDropdown = ({ attribute, name, error, isMultiSelect }: AttributeDropdownProps) => {
  const { control, setValue } = useFormContext();
  const [currentOptions, setCurrentOptions] = useState<SelectOption[]>('options' in attribute ? attribute.options : []);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const hasDataSource = 'data_source' in attribute;
  const { data: hookData, loading: hookLoading } = useCustomHook(hasDataSource ? attribute.data_source : undefined);

  const loadOptions = async () => {
    if (!attribute || !hasDataSource) return { options: [] };

    try {
      setLoading(true);
      const { data, error: fetchError } = await fetchDataSource(attribute.data_source, { fieldValues: {} });

      if (fetchError) {
        return { options: [] };
      }

      let options = data;

      const formatter = attribute.data_source.valueFormatter;

      if (formatter) {
        options = formatter(data);
      }

      return { options };
    } catch (err) {
      captureException(err);

      return { options: [] };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let options: SelectOption[] = [];

    if (!hookLoading && hookData) {
      const formatter = hasDataSource && attribute.data_source?.valueFormatter;

      if (formatter) {
        options = formatter(hookData);
      }
      setCurrentOptions(options);
    }
  }, [hookLoading]);

  useEffect(() => {
    let defaultValues: Array<SelectOption | undefined> = [];

    if (attribute.defaultValue?.toString() && currentOptions.length > 0) {
      if (
        attribute.formFieldType === 'creator' &&
        Array.isArray(attribute.defaultValue) &&
        typeof attribute.defaultValue[0] === 'object'
      ) {
        defaultValues = attribute.defaultValue
          .map((value) => currentOptions.find((option) => option.id === (value as any).id))
          .filter((value): value is SelectOption => value !== undefined);
      } else if (attribute.formFieldType === 'condition' || attribute.formFieldType === 'input') {
        if (Array.isArray(attribute.defaultValue)) {
          defaultValues = attribute.defaultValue
            .map((value) => {
              return currentOptions.find((option) => option.value === value);
            })
            .filter((value): value is SelectOption => value !== undefined);
        } else {
          defaultValues = [currentOptions.find((option) => option.value === attribute.defaultValue)];
        }
      }
    }

    if (defaultValues.length > 0) {
      setValue(name, defaultValues);
    }
  }, [currentOptions, attribute.defaultValue, attribute.formFieldType, name, setValue]);

  const handleOpenChange = async (open: boolean) => {
    setOpen(open);
    if (open && currentOptions.length === 0 && hasDataSource && !attribute.data_source?.useCustomHook) {
      const { options } = await loadOptions();

      setCurrentOptions(options);
    }
  };

  const attributeDisplayValue = useCallback((selectedOptions: SelectOption[]) => {
    if (!selectedOptions || selectedOptions.length === 0) {
      return 'Any';
    }
    if (selectedOptions.length > 1) {
      return `${selectedOptions.length} selected`;
    }

    return selectedOptions.map((option) => {
      if (option.display_value) {
        return option.display_value;
      }
      if (typeof option.value === 'string') {
        return option.value;
      }

      return option.label;
    });
  }, []);

  const isChecked = (option: SelectOption, selectedOptions: SelectOption[]) => {
    if (typeof option.value === 'string') {
      return selectedOptions?.some((selectedOption) => selectedOption.value === option.value);
    }
    if (typeof option.value === 'object') {
      return selectedOptions?.some((selectedOption) => selectedOption.id === option.id);
    }

    return false;
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <div className='relative'>
              <Attribute
                label={attribute.label}
                className={cn({
                  'border border-red-500 rounded-md': error,
                })}
                displayValue={attributeDisplayValue(value)}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                }}
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='z-[1001] max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden'
            sideOffset={6}
            align='start'
            side='bottom'
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            {isMultiSelect ? (
              currentOptions.map((option, index) => (
                <DropdownMenuCheckboxItem
                  key={option.id ?? index}
                  checked={isChecked(option, value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...value, option]);
                    } else {
                      onChange(value.filter((selectedOption: SelectOption) => selectedOption.id !== option.id));
                    }
                  }}
                >
                  {option.richLabel || option.label}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <DropdownMenuRadioGroup
                value={value?.[0]?.id}
                onValueChange={(selectedId) => {
                  const selectedOption = currentOptions.find((option) => option.id === selectedId);

                  if (selectedOption) {
                    onChange([selectedOption]);
                  }
                }}
              >
                {currentOptions.map((option, index) => (
                  <DropdownMenuRadioItem key={option.id ?? index} value={option.id ?? index.toString()}>
                    {option.richLabel || option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            )}
            {loading && (
              <div className='space-y-2 p-2'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className='h-4 w-full' />
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  );
};

export default AttributeMenuDropdown;
