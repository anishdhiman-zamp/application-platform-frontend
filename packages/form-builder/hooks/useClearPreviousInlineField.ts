import { useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { ExtendedSelectOption, FormField as FormFieldType } from '../types';

interface UseClearPreviousInlineFieldOptions {
  clearOnDeselect?: boolean;
}

interface UseClearPreviousInlineFieldResult {
  handleClearPreviousField: (
    newValue: string,
    options: ExtendedSelectOption[],
    schemaFields: Record<string, FormFieldType>,
  ) => void;
}

/**
 * Clears the inline field value of the previously selected option when a new option is selected.
 * Used to reset inline field values when switching between radio/select options.
 */

export const useClearPreviousInlineField = (
  options: UseClearPreviousInlineFieldOptions = {},
): UseClearPreviousInlineFieldResult => {
  const { clearOnDeselect = true } = options;
  const { setValue, getValues } = useFormContext();

  const previousValueRef = useRef<string | undefined>(undefined);

  const handleClearPreviousField = useCallback(
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
    handleClearPreviousField,
  };
};
