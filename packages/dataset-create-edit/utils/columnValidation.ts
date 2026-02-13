import {
  BOOLEAN_DEFAULT_OPTIONS,
  COLUMN_TYPE_CONFIG,
  DatasetColumnTypes,
  TIMESTAMP_DEFAULT_OPTIONS,
} from '../constants';

/**
 * Get format hint for column type
 */
export const getFormatHint = (type: string): string => {
  const normalizedType = type.toUpperCase();
  return COLUMN_TYPE_CONFIG[normalizedType]?.formatHint || type.toUpperCase();
};

/**
 * Validation functions for each column type
 */
const TYPE_VALIDATORS: Record<string, (value: string) => boolean> = {
  [DatasetColumnTypes.INTEGER]: (value: string): boolean => {
    // Must be a valid integer: only digits with optional leading minus sign
    // Reject floats, scientific notation for integers, and non-numeric characters
    const trimmed = value.trim();
    if (!/^-?\d+$/.test(trimmed)) return false;
    const num = Number(trimmed);
    return Number.isInteger(num) && Number.isFinite(num);
  },

  [DatasetColumnTypes.FLOAT]: (value: string): boolean => {
    // Must be a valid float/decimal number
    const trimmed = value.trim();
    // Allow integers, decimals, and scientific notation
    if (!/^-?\d*\.?\d+(?:[eE][+-]?\d+)?$/.test(trimmed)) return false;
    const num = Number(trimmed);
    return Number.isFinite(num);
  },

  [DatasetColumnTypes.DOUBLE]: (value: string): boolean => {
    // Same as float - JavaScript doesn't distinguish float/double
    const trimmed = value.trim();
    if (!/^-?\d*\.?\d+(?:[eE][+-]?\d+)?$/.test(trimmed)) return false;
    const num = Number(trimmed);
    return Number.isFinite(num);
  },

  [DatasetColumnTypes.JSON]: (value: string): boolean => {
    // Must be valid JSON
    const trimmed = value.trim();
    if (!trimmed) return false;
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      return false;
    }
  },

  [DatasetColumnTypes.TEXT]: (): boolean => true,
  [DatasetColumnTypes.TIMESTAMP]: (): boolean => true,
  [DatasetColumnTypes.BOOLEAN]: (): boolean => true,
};

/**
 * Validate if value matches the expected column type format
 */
export const validateValueForType = (value: string, columnType: string): boolean => {
  if (!value.trim()) return true; // Empty is valid (will be caught by required check)

  const normalizedType = columnType.toUpperCase();
  const validator = TYPE_VALIDATORS[normalizedType];

  if (validator) {
    return validator(value);
  }

  // Default: accept any value for unknown types
  return true;
};

/**
 * Check if column type uses radio options instead of text input
 */
export const isRadioOptionType = (columnType: string): boolean => {
  const type = columnType.toUpperCase();
  return type === DatasetColumnTypes.TIMESTAMP || type === DatasetColumnTypes.BOOLEAN;
};

/**
 * Get radio options for the given column type
 */
export const getRadioOptions = (columnType: string): Array<{ value: string; label: string }> => {
  const type = columnType.toUpperCase();
  switch (type) {
    case DatasetColumnTypes.TIMESTAMP:
      return TIMESTAMP_DEFAULT_OPTIONS;
    case DatasetColumnTypes.BOOLEAN:
      return BOOLEAN_DEFAULT_OPTIONS;
    default:
      return [];
  }
};
