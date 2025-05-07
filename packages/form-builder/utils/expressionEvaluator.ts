import { Condition, Expression, FormValues, Validation, ValidationDependency } from '../types';

const evaluateCondition = (condition: Condition, values: FormValues): boolean => {
  const fieldValue = values[condition.field];

  switch (condition.operator) {
    case 'eq':
      return fieldValue === condition.value;
    case 'neq':
      return fieldValue !== condition.value;
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(fieldValue);
    case 'gt':
      return typeof fieldValue === 'number' && typeof condition.value === 'number' && fieldValue > condition.value;
    case 'gte':
      return typeof fieldValue === 'number' && typeof condition.value === 'number' && fieldValue >= condition.value;
    case 'lt':
      return typeof fieldValue === 'number' && typeof condition.value === 'number' && fieldValue < condition.value;
    case 'lte':
      return typeof fieldValue === 'number' && typeof condition.value === 'number' && fieldValue <= condition.value;
    default:
      return false;
  }
};

export const evaluateExpression = (expression: Expression, values: FormValues): boolean => {
  if (!expression.conditions || expression.conditions.length === 0) {
    return true;
  }

  const results = expression.conditions.map((condition: Condition) => evaluateCondition(condition, values));

  return expression.logical_operator === 'AND' ? results.every((result) => result) : results.some((result) => result);
};

export const evaluateValidationDependencies = (
  dependencies: ValidationDependency,
  values: FormValues,
): Validation[] => {
  const activeValidations: Validation[] = [];

  // Check if all dependent fields are present in values
  const hasAllDependentFields = dependencies.fields.every((field) => field in values);

  if (!hasAllDependentFields) {
    return activeValidations;
  }

  // Evaluate each expression
  dependencies.expressions.forEach(({ expression, validations }) => {
    if (evaluateExpression(expression, values)) {
      activeValidations.push(...validations);
    }
  });

  return activeValidations;
};
