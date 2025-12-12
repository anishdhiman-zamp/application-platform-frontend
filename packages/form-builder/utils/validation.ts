import { FieldType, FormField, FormSchema, FormValues, Validation, ValidationDependency } from '../types';
import { evaluateValidationDependencies } from './expressionEvaluator';

// Function to validate a single value against validations
const validateValue = (value: any, validations: Validation[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  validations.forEach((validation) => {
    switch (validation.type) {
      case 'required':
        if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
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

// Function to validate a field with its dependencies
export const validateField = (
  value: any,
  formValues: FormValues,
  validations?: Validation[],
  dependentValidations?: ValidationDependency[],
  field?: FormField,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Get all validations including those from dependencies
  const allValidations = [
    ...(validations || []),
    ...(dependentValidations?.flatMap((dependency) => evaluateValidationDependencies(dependency, formValues)) || []),
  ];

  // For radio fields with has_input, handle validation differently
  if (field?.type === FieldType.RADIO) {
    // Check if this is a radio field with an object value (has_input option selected)
    if (typeof value === 'object' && value !== null && 'value' in value) {
      // This is a radio field with an object value (has_input option selected)
      const radioValue = value.value;
      const inputValue = value.input || '';

      // First, validate the radio selection itself (value.value)
      const radioValidationResult = validateValue(radioValue, allValidations);
      errors.push(...radioValidationResult.errors);

      // Then, if input_validations exist, validate the input value
      if (field.input_validations && field.input_validations.length > 0) {
        const inputValidationResult = validateValue(inputValue, field.input_validations);
        errors.push(...inputValidationResult.errors);
      }
    } else {
      // Radio field with string value (non-has_input option selected or no option selected)
      const validationResult = validateValue(value, allValidations);
      errors.push(...validationResult.errors);
    }
  } else {
    // For all other field types, validate normally
    const validationResult = validateValue(value, allValidations);
    errors.push(...validationResult.errors);
  }

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
      const { isValid, errors: fieldErrors } = validateField(
        values[fieldName],
        values,
        field.validations,
        field.validation_dependencies,
        field, // Pass field to check for radio with has_input
      );

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
