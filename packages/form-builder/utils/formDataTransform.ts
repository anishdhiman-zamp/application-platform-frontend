import { EmailAliasFieldType } from '../components/EmailAliasField';
import { FormSchema } from '../types';

/**
 * Transforms form data to include prefix and suffix for email-alias fields
 * @param schema - The form schema containing field definitions
 * @param data - The form data to transform
 * @returns Transformed form data with prefixes applied to email-alias fields
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformFormData = (schema: FormSchema, data: Record<string, any>): Record<string, any> => {
  const transformedData = { ...data };

  // Iterate through all fields in the schema
  Object.entries(schema.fields).forEach(([fieldName, field]) => {
    // Only transform email-alias fields that have a value
    if (field.type === 'email-alias' && fieldName in transformedData && transformedData[fieldName] != null) {
      // Use the same logic as EmailAliasField to determine effective prefix/suffix
      const effectivePrefix = (field as EmailAliasFieldType).prefix ?? '';
      // const effectiveSuffix = field.suffix ?? emailAliasSuffix ?? '';

      // Transform the value by prepending prefix and appending suffix
      const fieldValue = String(transformedData[fieldName] || '');
      transformedData[fieldName] = `${effectivePrefix}${fieldValue}`;
    }
  });

  return transformedData;
};
