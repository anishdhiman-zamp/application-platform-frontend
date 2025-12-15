import { useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { ExtendedSelectOption, FormField as FormFieldType } from '../types';

interface UseInlineFieldOptions {
  clearOnDeselect?: boolean;
}

interface UseInlineFieldResult {
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
    handleOptionChange,
  };
};
