import { CONDITION_OPERATOR_TYPE } from '@/components/filter/filters.constants';

/**
 * This function returns the current date formatted as "DD MMM YYYY" using the 'en-GB' locale.
 * Example: If today is February 18, 2025, the function will return "18 Feb 2025".
 * @param
 * @returns string - The current date formatted as "DD MMM YYYY"
 */
export const getTodayFormattedDatePivot = (): string => {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 *
 * This function extracts a date in the format "DD MMM YYYY" from the input string.
 * Example: If the input string is "The event is on 18 Feb 2025", the function will return "18 Feb 2025".
 * @param str - The input string from which to extract the date.
 * @returns string | null - The extracted date in the format "DD MMM YYYY" or null if no match is found.
 */
export const extractDateDWDFormat = (str: string): string | null => {
  const dateRegex = /\d{1,2} \w{3} \d{4}/;
  const match = str?.match(dateRegex);

  return match ? match[0] : null;
};

/**
 * This function evaluates a comparison between two values based on the specified operator.
 * @param value1
 * @param value2
 * @param operator
 * @returns boolean - The result of the comparison.
 */
export const evaluateOperator = (value1: string | number, value2: string | number, operator: string): boolean => {
  switch (operator) {
    case CONDITION_OPERATOR_TYPE.EQUAL:
      return value1 === value2;
    case CONDITION_OPERATOR_TYPE.NOT_EQUAL:
      return value1 !== value2;
    case CONDITION_OPERATOR_TYPE.GREATER_THAN_EQUAL:
      return value1 >= value2;
    case CONDITION_OPERATOR_TYPE.LESS_THAN_EQUAL:
      return value1 <= value2;
    case CONDITION_OPERATOR_TYPE.GREATER_THAN:
      return value1 > value2;
    case CONDITION_OPERATOR_TYPE.LESS_THAN:
      return value1 < value2;
    case CONDITION_OPERATOR_TYPE.STARTS_WITH:
      return value1?.toString().startsWith(value2?.toString());
    case CONDITION_OPERATOR_TYPE.CONTAINS:
      return value1?.toString().includes(value2?.toString());
    case CONDITION_OPERATOR_TYPE.NOT_CONTAINS:
      return !value1?.toString().includes(value2?.toString());
    default:
      return false;
  }
};

/**
 * This function compares two date strings in the format "DD MMM YYYY" based on the specified operator.
 * @param data_1
 * @param data_2
 * @param operator
 * @returns boolean - The result of the comparison.
 */
export const compareColumnGroupAliasDate = (data_1: string, data_2: string, operator: string): boolean => {
  const date1 = extractDateDWDFormat(data_1);
  const date2 = extractDateDWDFormat(data_2);

  if (!date1 || !date2) return false;
  const timestamp1 = new Date(date1).getTime();
  const timestamp2 = new Date(date2).getTime();

  return evaluateOperator(timestamp1, timestamp2, operator);
};

/**
 * This function checks if a parent key matches a given parent row field recursively.
 * @param level - The current level in the hierarchy.
 * @param parentRowField - The parent row field to match against.
 * @param node - The current node being checked.
 * @returns boolean - True if a match is found, false otherwise.
 */
export const handleMatchRecursiveParentKey = (
  level: number,
  parentRowField: string,
  node: { parent?: { key: string }; key: string },
): boolean => {
  if (!node || level <= 0) return false;
  if (node?.key === parentRowField) return true;

  return node?.parent ? handleMatchRecursiveParentKey(level - 1, parentRowField, node?.parent) : false;
};

/**
 * This function extracts the date and value from a column ID string.
 * @param colId - The column ID string to extract from.
 * @returns { date: string | null, value: string | null } - An object containing the extracted date and value.
 */
export const handleExtractPartsFromColId = (colId: string) => {
  const dateFormatRegex = /\d{1,2} \w{3} \d{4}/;
  const valueAfterDateFormatRegex = /pivot_DATE_\d{1,2} \w{3} \d{4}_/;
  const date = extractDateDWDFormat(colId)?.match(dateFormatRegex);

  const value = colId?.replace(valueAfterDateFormatRegex, '');

  return { date, value };
};
