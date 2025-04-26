import { FormField, FormSchema, FormValues } from '../types';
import { evaluateValidationDependencies } from './expressionEvaluator';

// Function to validate a field with its dependencies
export const validateField = (
  field: FormField,
  value: any,
  formValues: FormValues,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Get all validations including those from dependencies
  const allValidations = [
    ...(field.validations || []),
    ...(field.validation_dependencies?.flatMap((dependency) =>
      evaluateValidationDependencies(dependency, formValues),
    ) || []),
  ];

  // Apply all validations
  allValidations.forEach((validation) => {
    switch (validation.type) {
      case 'required':
        if (!value) {
          errors.push(validation.config.message);
        }
        break;
      case 'minLength':
        if (value && value.length < (validation.config.value as number)) {
          errors.push(validation.config.message);
        }
        break;
      case 'maxLength':
        if (value && value.length > (validation.config.value as number)) {
          errors.push(validation.config.message);
        }
        break;
      case 'regex':
        if (value && !new RegExp(validation.config.value as string).test(value)) {
          errors.push(validation.config.message);
        }
        break;
      case 'enums':
        if (value && !validation.config.values?.includes(value)) {
          errors.push(validation.config.message);
        }
        break;
      case 'contact-country-code':
      case 'country-code':
      case 'country-state':
        if (!value) {
          errors.push(validation.config.message);
        }
        break;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Create a custom resolver for react-hook-form
export const createCustomResolver = (schema: FormSchema) => {
  return async (values: FormValues) => {
    const errors: Record<string, { type: string; message: string }> = {};

    Object.entries(schema.fields).forEach(([fieldName, field]) => {
      const { isValid, errors: fieldErrors } = validateField(field, values[fieldName], values);

      if (!isValid) {
        errors[fieldName] = {
          type: 'validate',
          message: fieldErrors[0],
        };
      }
    });

    return {
      values,
      errors,
    };
  };
};
