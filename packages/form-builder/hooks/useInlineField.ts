import { useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  ExtendedSelectOption,
  FormField as FormFieldType,
  InlineFieldConfig,
  InlineFieldDisplayMode,
  InlineFieldShowWhen,
} from '../types';

interface UseInlineFieldOptions {
  clearOnDeselect?: boolean;
}

interface UseInlineFieldResult {
  isInlineFieldVisible: (option: ExtendedSelectOption, currentValue: string | undefined) => boolean;
  getInlineFieldConfig: (option: ExtendedSelectOption) => InlineFieldConfig | undefined;
  hasInlineField: (option: ExtendedSelectOption) => boolean;
  getOptionsWithInlineFields: (options: ExtendedSelectOption[]) => ExtendedSelectOption[];
  handleOptionChange: (
    newValue: string,
    options: ExtendedSelectOption[],
    schemaFields: Record<string, FormFieldType>,
  ) => void;
}

export const useInlineField = (options: UseInlineFieldOptions = {}): UseInlineFieldResult => {
  const { clearOnDeselect = true } = options;
  const { setValue, getValues } = useFormContext();

  const previousValueRef = useRef<string | undefined>(undefined);

  const hasInlineField = useCallback((option: ExtendedSelectOption): boolean => {
    return !!option.inline_field;
  }, []);

  const getInlineFieldConfig = useCallback((option: ExtendedSelectOption): InlineFieldConfig | undefined => {
    return option.inline_field;
  }, []);

  const isInlineFieldVisible = useCallback(
    (option: ExtendedSelectOption, currentValue: string | undefined): boolean => {
      const config = option.inline_field;
      if (!config) return false;

      const showWhen = config.show_when || InlineFieldShowWhen.SELECTED;
      const optionValue = String(option.value);

      if (showWhen === InlineFieldShowWhen.ALWAYS) {
        return true;
      }

      return currentValue === optionValue;
    },
    [],
  );

  const getOptionsWithInlineFields = useCallback(
    (allOptions: ExtendedSelectOption[]): ExtendedSelectOption[] => {
      return allOptions.filter(hasInlineField);
    },
    [hasInlineField],
  );

  const handleOptionChange = useCallback(
    (newValue: string, allOptions: ExtendedSelectOption[], schemaFields: Record<string, FormFieldType>) => {
      if (!clearOnDeselect) return;

      const previousValue = previousValueRef.current;
      previousValueRef.current = newValue;

      const previousOption = allOptions.find((opt) => String(opt.value) === previousValue);

      if (previousOption?.inline_field) {
        const fieldId = previousOption.inline_field.field;
        const fieldDefinition = schemaFields[fieldId];

        if (fieldDefinition) {
          const defaultValue = fieldDefinition.default_value ?? '';
          const currentFieldValue = getValues(fieldId);

          if (currentFieldValue !== defaultValue) {
            setValue(fieldId, defaultValue, { shouldValidate: false });
          }
        }
      }
    },
    [clearOnDeselect, setValue, getValues],
  );

  return {
    isInlineFieldVisible,
    getInlineFieldConfig,
    hasInlineField,
    getOptionsWithInlineFields,
    handleOptionChange,
  };
};

export const getInlineFieldDisplayClass = (displayMode: InlineFieldConfig['display_mode']): string => {
  switch (displayMode) {
    case InlineFieldDisplayMode.REPLACE:
      return 'flex-1';
    case InlineFieldDisplayMode.BELOW:
      return 'mt-2 ml-6 w-full';
    case InlineFieldDisplayMode.AFTER:
      return 'ml-2 flex-1';
    default:
      return '';
  }
};

export const getOptionWrapperClass = (
  hasInlineField: boolean,
  displayMode?: InlineFieldConfig['display_mode'],
): string => {
  if (!hasInlineField) return 'flex items-center gap-2';

  switch (displayMode) {
    case InlineFieldDisplayMode.REPLACE:
      return 'flex items-center gap-2 w-full';
    case InlineFieldDisplayMode.BELOW:
      return 'flex flex-col w-full';
    case InlineFieldDisplayMode.AFTER:
      return 'flex items-center gap-2 w-full';
    default:
      return 'flex items-center gap-2';
  }
};
