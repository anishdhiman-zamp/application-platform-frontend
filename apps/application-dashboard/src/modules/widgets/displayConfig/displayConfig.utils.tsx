import { Dispatch, SetStateAction } from 'react';
import {
  CALENDER_DAYS,
  CheckPeriodColumnOptionsPropsType,
  ColVisibilityConfigType,
  DISPLAY_CONFIG_RULES,
  DisplayConfigRulesConditionsPeriodType,
  DisplayConfigRulesType,
  DisplayConfigToggleType,
} from 'modules/widgets/displayConfig/displayConfig.types';
import { AllPivotColumnsToHideType, ColumnsToHideType } from 'modules/widgets/Pivot/pivot.types';
import { formatColGroupHeaderDisplayName } from 'modules/widgets/Pivot/pivot.utils';
import { CONDITION_OPERATOR_TYPE } from '@/components/filter/filters.constants';
import { MapAny } from '@/types/commonTypes';
import { LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

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
 * @param level - current level in the hierarchy.
 * @param parentRowField - parent row field to match against.
 * @param node - current node being checked.
 * @returns boolean - True if a match is found, false otherwise.
 */
export const handleMatchRecursiveParentKey = (level: number | null, parentRowField: string, node: MapAny): boolean => {
  if (level === null) return false;
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

/**
 * This function returns column group header name from the column ID.
 * @param colGroupHeaderName - The column group header name to format.
 * @returns {string}
 */
export const handleGetSuffixAfterDateFromColId = (input: string, date: string) => {
  if (!input || !date) return null;

  const marker = `${date}_`;
  const index = input.indexOf(marker);

  if (index === -1) return null;

  return input.slice(index + marker?.length);
};

/**
 * This function retrieves the toggle configuration from local storage for a given sheet ID.
 * @param sheetId - The ID of the sheet to retrieve the toggle configuration for.
 * @returns {Array} - The toggle configuration for the specified sheet ID.
 */
export const getToggleConfigFromLocalStorage = (sheetId: string) => {
  const storageKey = LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID;
  const storedData = JSON.parse(localStorage.getItem(storageKey) || '{}');

  return storedData[sheetId]?.display_config?.toggle ?? [];
};

/**
 * This function generates a column IDs visibility configuration based on the provided column configurations.
 * @param colConfigs - An array of column configurations to check against.
 * @param isHidden - A boolean indicating whether to hide or show the columns.
 * @returns {Array} - An array of column IDs that should be hidden or shown.
 */
export const generateColIdsVisibilityConfig = (
  colConfigs: ColVisibilityConfigType[] = [],
  isHidden: boolean,
): string[] => {
  return colConfigs.reduce<string[]>((acc, col) => {
    if (col?.hide === isHidden && col?.colId) {
      acc.push(col?.colId);
    }

    return acc;
  }, []);
};

/**
 * This function checks if a date column should be hidden based on the specified period and header names.
 * @param period - The period type to check against.
 * @param colGroupHeaderName - The column group header name to check against.
 * @param headerName - The header name to check against.
 * @param date - The date string to check against.
 * @returns {boolean} - True if the column should be hidden, false otherwise.
 */

export const checkPeriodBasedDateColumnToHide = ({
  period,
  colGroupHeaderName,
  headerName,
  date,
}: CheckPeriodColumnOptionsPropsType): boolean => {
  if (period === DisplayConfigRulesConditionsPeriodType.TODAY) {
    return colGroupHeaderName === headerName && date !== getTodayFormattedDatePivot();
  }

  if (period === DisplayConfigRulesConditionsPeriodType.WEEKEND) {
    const { suffix } = formatColGroupHeaderDisplayName(date ?? '');

    return [CALENDER_DAYS.SATURDAY, CALENDER_DAYS.SUNDAY].some((day) => suffix?.includes(day));
  }

  return false;
};

/**
 * This function updates the visibility of columns to hide based on the provided widget instance ID and new column IDs in displayConfig.
 * @param setAllPivotColumnsToHide - The state setter function for all pivot columns to hide.
 * @param widgetInstanceId - The ID of the widget instance to update.
 * @param newColIds - An array of new column IDs to update.
 */
export const updateColumnsToHideForDisplayConfig = (
  setAllPivotColumnsToHide: React.Dispatch<React.SetStateAction<AllPivotColumnsToHideType[]>> | undefined,
  widgetInstanceId: string,
  newColIds: { colId: string; hide: boolean }[],
) => {
  setAllPivotColumnsToHide?.((prev: AllPivotColumnsToHideType[]) => {
    const updatedConfigs = Array.isArray(prev) ? [...prev] : [];

    const existingConfigIndex = updatedConfigs?.findIndex((item) => item?.widgetInstanceId === widgetInstanceId);

    if (existingConfigIndex !== -1) {
      const existingColIds = new Set(
        updatedConfigs[existingConfigIndex]?.colIds?.map((col: ColumnsToHideType) => col?.colId),
      );

      const filteredNewColIds = newColIds?.filter((col) => !existingColIds.has(col.colId));

      if (filteredNewColIds?.length > 0) {
        (updatedConfigs[existingConfigIndex]?.colIds ?? []).push(...filteredNewColIds);
      }
    } else {
      updatedConfigs.push({
        widgetInstanceId,
        colIds: newColIds,
      });
    }

    return updatedConfigs;
  });
};

/**
 * This function retrieves all column IDs from the grid API and updates the state with weekend and forecast column IDs which will be hidden.
 * @param gridApi - The grid API to retrieve column IDs from.
 * * @param displayConfigRules - The display configuration rules to check against.
 * @param setColIdsToHideForDisplayOptions - The state setter function for column IDs to hide for display options.
 */
export const getAllColumnIds = (
  gridApi: MapAny,
  displayConfigRules: DisplayConfigRulesType | undefined,
  setColIdsToHideForDisplayOptions: Dispatch<SetStateAction<MapAny>>,
) => {
  if (!gridApi?.current) return;

  const columns = gridApi.current
    .getAllGridColumns()
    .map((column: { getColId: () => string; hide: boolean }) => ({
      colId: column.getColId(),
      hide: false,
    }))
    .filter((col: ColVisibilityConfigType): col is { colId: string; hide: boolean } => !!col.colId);

  const weekendColIds: string[] = []; // weekends toggle data
  const showForecastColIds: string[] = []; // forecast toggle data

  columns?.forEach((item: { colId: string }) => {
    const colId = item?.colId;
    const extractedDate = extractDateDWDFormat(colId);

    // Check for weekend column
    const shouldHideForWeekendToggle = checkPeriodBasedDateColumnToHide({
      period: DisplayConfigRulesConditionsPeriodType.WEEKEND,
      date: extractedDate ?? '',
    });

    // Check for forecast column
    const formattedDateFromColId = extractDateDWDFormat(colId) ?? '';
    const currentDate = getTodayFormattedDatePivot();
    const columnHeaderName = handleGetSuffixAfterDateFromColId(colId, formattedDateFromColId); // value_1
    let historicalForecastHeaderName: string | undefined; // column header_name

    if (Array.isArray(displayConfigRules)) {
      const hideRule = displayConfigRules?.find((rule) => rule?.type === DISPLAY_CONFIG_RULES.HIDE);

      if (hideRule && Array.isArray(hideRule.conditions)) {
        const historicalForecastCondition = hideRule?.conditions?.find(
          (cond) => cond?.toggle_field === DisplayConfigToggleType.SHOW_HISTORICAL_FORECAST,
        );

        historicalForecastHeaderName = historicalForecastCondition?.header_name;
      }
    }

    if (currentDate !== formattedDateFromColId && columnHeaderName === historicalForecastHeaderName) {
      showForecastColIds.push(colId);
    }

    if (shouldHideForWeekendToggle) weekendColIds.push(colId);
  });

  setColIdsToHideForDisplayOptions((prev: any) => {
    const updated = { ...prev };

    updated[DisplayConfigToggleType.HIDE_WEEKENDS] = weekendColIds;
    updated[DisplayConfigToggleType.SHOW_HISTORICAL_FORECAST] = showForecastColIds;

    return updated;
  });
};

/**
 * This function updates the column IDs visibility based on the provided widget instance ID and sheet ID and finally
 * pushes the updated column IDs to the "allPivotColumnsToHide" state which is the final state storing all the column ids to be hidden.
 * @param currentWidgetInstanceId - The ID of the current widget instance.
 * @param sheetId - The ID of the sheet to update.
 * @param colIdsToHideForDisplayOptions - The column IDs to hide for display options.
 * @param setAllPivotColumnsToHide - The state setter function for all pivot columns to hide.
 */
export const updateColIdsVisibility = (
  currentWidgetInstanceId: string,
  sheetId: string,
  colIdsToHideForDisplayOptions: MapAny,
  setAllPivotColumnsToHide: Dispatch<SetStateAction<AllPivotColumnsToHideType[]>>,
) => {
  if (!currentWidgetInstanceId || !sheetId) return;

  const localStorageToggleData = getToggleConfigFromLocalStorage(sheetId);

  const initialColumIds = Object.entries(colIdsToHideForDisplayOptions).flatMap(([uniqueId, colIds]) =>
    (colIds as string[])?.map((colId: string) => {
      const toggle = localStorageToggleData?.find(
        (option: { toggle_field: string; default: boolean }) => option?.toggle_field === uniqueId,
      );

      let hide: boolean;

      const isHistorical = uniqueId === DisplayConfigToggleType.SHOW_HISTORICAL_FORECAST;

      // Determine hide based on toggle, with fallback if toggle is undefined
      if (toggle?.default !== undefined) {
        hide = isHistorical ? !toggle.default : toggle.default;
      } else {
        // Fallbacks
        hide = isHistorical ? true : false;
      }

      return {
        colId,
        hide,
        uniqueId,
      };
    }),
  );

  const finalColumnIds = Object.values(
    initialColumIds.reduce(
      (acc, curr) => {
        const existing = acc[curr.colId];

        if (!existing) {
          acc[curr.colId] = curr;
        } else {
          // If any entry has `hide: true`, prefer that
          if (curr.hide) {
            acc[curr.colId] = curr;
          }
        }

        return acc;
      },
      {} as Record<string, any>,
    ),
  );

  setAllPivotColumnsToHide((prev) => {
    const existingIndex = prev?.findIndex((item) => item?.widgetInstanceId === currentWidgetInstanceId);

    if (existingIndex !== -1) {
      // Update existing entry
      const updated = [...prev];

      updated[existingIndex] = {
        ...updated[existingIndex],
        colIds: finalColumnIds,
      };

      return updated;
    } else {
      // Add new entry
      return [
        ...prev,
        {
          widgetInstanceId: currentWidgetInstanceId,
          colIds: finalColumnIds,
        },
      ];
    }
  });
};
