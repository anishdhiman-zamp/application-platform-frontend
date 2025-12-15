import { FormField as FormFieldType, SelectOption } from '../types';

/**
 * Extracts inline fields from a field's options and returns them as a Record.
 * Used to pass inline field definitions to components like RadioField.
 */
export const getInlineFields = (
  options: SelectOption[] | undefined,
  fields: Record<string, FormFieldType>,
): Record<string, FormFieldType> => {
  if (!options) return {};

  return options.reduce<Record<string, FormFieldType>>((acc, option) => {
    const inlineFieldName = option.inline_field?.field;
    if (inlineFieldName && fields[inlineFieldName]) {
      acc[inlineFieldName] = fields[inlineFieldName];
    }
    return acc;
  }, {});
};
