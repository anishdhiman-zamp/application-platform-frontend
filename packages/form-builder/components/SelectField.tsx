import { Select } from '@zamp-platform/ui';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormField as FormFieldType } from '../types';
import { fetchDataSource } from '../utils/dataSource';

interface SelectFieldProps {
  field: FormFieldType;
  name: string;
  className?: string;
}

const PAGE_SIZE = 10;

export const SelectField: React.FC<SelectFieldProps> = ({ field, name, className }) => {
  const { control, watch } = useFormContext();

  const dependentFields = field.data_source?.triggers?.map((trigger) => trigger.field) || [];
  const watchedValues = watch(dependentFields);

  const prevValuesRef = React.useRef(watchedValues);
  const [shouldClearOptions, setShouldClearOptions] = useState(false);

  // Compare current and previous values
  React.useEffect(() => {
    if (JSON.stringify(prevValuesRef.current) !== JSON.stringify(watchedValues)) {
      setShouldClearOptions(true);
      prevValuesRef.current = watchedValues;
    }
  }, [watchedValues]);

  const loadOptions = async (currentFieldValues: Record<string, any>, page: number) => {
    if (!field.data_source) return { options: [], hasMore: false };

    try {
      // Add pagination params to the data source
      const dataSourceWithPagination = {
        ...field.data_source,
        params: {
          ...field.data_source.params,
          page: page.toString(),
          pageSize: PAGE_SIZE.toString(),
        },
      };

      const { data, error: fetchError } = await fetchDataSource(dataSourceWithPagination, {
        fieldValues: currentFieldValues,
      });

      if (fetchError) {
        return { options: [], hasMore: false };
      }

      // If we got less items than the page size, we know there are no more items
      const hasMore = data.length === PAGE_SIZE;

      // For the first page, replace options, for subsequent pages append
      // if (page === 1) {
      //   setOptions(transformedOptions);
      // } else {
      //   setOptions((prev) => [...prev, ...transformedOptions]);
      // }

      return { options: data, hasMore };
    } catch (err) {
      console.log('Failed to load options. Please try again later.', err);
      return { options: [], hasMore: false };
    }
  };

  const fetchOptions = async (page: number) => {
    const currentFieldValues = dependentFields.reduce(
      (acc, fieldName, index) => {
        acc[fieldName] = watchedValues[index];
        return acc;
      },
      {} as Record<string, any>,
    );
    return loadOptions(currentFieldValues, page);
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value }, fieldState: { error: fieldError } }) => (
        <div className={`space-y-2 ${className}`}>
          <div className='relative'>
            <Select
              options={
                field?.options?.length
                  ? field?.options?.map((option) => ({
                      label: option.label ?? '',
                      value: option.value,
                    }))
                  : []
              }
              className={fieldError ? 'border-destructive focus-visible:ring-destructive' : ''}
              placeholder={field.placeholder || field.label}
              fetchOptions={field.data_source ? fetchOptions : undefined}
              value={value}
              onValueChange={onChange}
              onBlur={onBlur}
              clearOptions={shouldClearOptions}
              setShouldClearOptions={setShouldClearOptions}
            />
          </div>
          {fieldError?.message ? (
            <span
              className='transition-all duration-200 f-11-400 ease-in-out'
              style={{ marginBottom: '12px', color: 'var(--RED_700)' }}
            >
              {fieldError.message}
            </span>
          ) : null}
        </div>
      )}
    />
  );
};
