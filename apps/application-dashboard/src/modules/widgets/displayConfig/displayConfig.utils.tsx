import { CONDITION_OPERATOR_TYPE } from '@/components/filter/filters.constants';

export const getTodayFormattedDatePivot = (): string => {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const extractDateDWDFormat = (str: string): string | null => {
  const dateRegex = /\d{1,2} \w{3} \d{4}/; // Matches "18 Feb 2025"
  const match = str?.match(dateRegex);

  return match ? match[0] : null;
};

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

export const compareColumnGroupAliasDate = (data_1: string, data_2: string, operator: string): boolean => {
  const date1 = extractDateDWDFormat(data_1);
  const date2 = extractDateDWDFormat(data_2);

  if (!date1 || !date2) return false;
  const timestamp1 = new Date(date1).getTime();
  const timestamp2 = new Date(date2).getTime();

  return evaluateOperator(timestamp1, timestamp2, operator);
};

export const handleMatchRecursiveParentKey = (
  level: number,
  parentRowField: string,
  node: { parent?: { key: string }; key: string },
): boolean => {
  if (!node || level <= 0) return false;
  if (node?.key === parentRowField) return true;

  return node?.parent ? handleMatchRecursiveParentKey(level - 1, parentRowField, node?.parent) : false;
};

export const handleExtractPartsFromColId = (colId: string) => {
  const dateFormatRegex = /\d{1,2} \w{3} \d{4}/;
  const valueAfterDateFormatRegex = /pivot_DATE_\d{1,2} \w{3} \d{4}_/;
  const date = extractDateDWDFormat(colId)?.match(dateFormatRegex);

  const value = colId?.replace(valueAfterDateFormatRegex, '');

  return { date, value };
};
