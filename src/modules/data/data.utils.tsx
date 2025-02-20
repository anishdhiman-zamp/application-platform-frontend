import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInMonths } from 'date-fns';
import { CustomColumnsMapping } from 'modules/data/data.constants';
import {
  DatasetFilterConfigResponseType,
  DatasetType,
  DatasetUpdateResponseType,
  RuleFilters,
} from 'types/api/dataset.types';
import { MapAny } from 'types/commonTypes';
import { createDateObjectFromUTCString, formatPlural } from 'utils/common';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from 'utils/localstorage';
import CustomDateTimeEditor from 'components/common/table/CustomCellEditors/CustomDateTimeEditor';
import CustomTagEditor from 'components/common/table/CustomCellEditors/CustomTagEditor';
import CustomHeader from 'components/common/table/CustomHeader';
import { CUSTOM_COLUMNS_TYPE } from 'components/common/table/table.types';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { AG_GRID_FILTER_TYPES, CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

export const findTimeDifference = (updated_at: string): string => {
  const currentTime = new Date();
  const lastUpdatedTime = createDateObjectFromUTCString(updated_at);

  const differenceInMinutesValue = differenceInMinutes(currentTime, lastUpdatedTime);

  if (differenceInMinutesValue < 60) {
    return `${formatPlural(differenceInMinutesValue, 'minute')} ago`;
  }

  const differenceInHoursValue = differenceInHours(currentTime, lastUpdatedTime);

  if (differenceInHoursValue < 24) {
    return `${formatPlural(differenceInHoursValue, 'hour')} ago`;
  }

  const differenceInDaysValue = differenceInDays(currentTime, lastUpdatedTime);

  if (differenceInDaysValue < 30) {
    return `${formatPlural(differenceInDaysValue, 'day')} ago`;
  }

  const differenceInMonthsValue = differenceInMonths(currentTime, lastUpdatedTime);

  return `${formatPlural(differenceInMonthsValue, 'month')} ago`;
};

export const formatData = (data: DatasetType[]): DatasetType[] => {
  return data.map((item) => ({
    ...item,
    updated_at: findTimeDifference(item.updated_at),
  }));
};

export const formatColumns = (
  filterConfig: DatasetFilterConfigResponseType[],
  isInitiatedAction: boolean,
  datasetId: string,
  handleSuccessfulUpdate: (data: DatasetUpdateResponseType) => void,
  tableRef: React.RefObject<AgGridReact>,
  handleRulesListingSideDrawerOpen: (columnId: string) => void,
  zampIds?: string[],
): ColDef[] => {
  const columns: ColDef[] = [];

  filterConfig?.forEach((column: DatasetFilterConfigResponseType) => {
    let formattedColumn: ColDef = {
      field: column.column,
      flex: 1,
      hide: column.metadata?.is_hidden,
      cellRendererParams: column.metadata,
      editable: column.metadata?.is_editable && !isInitiatedAction,
      suppressFillHandle: !column.metadata?.is_editable,
      filter: AG_GRID_FILTER_TYPES[column.type as keyof typeof AG_GRID_FILTER_TYPES] ?? '',
      filterParams: {
        values: column.options,
      },
    };

    formattedColumn.cellRenderer = CustomColumnsMapping[column.metadata?.custom_type as CUSTOM_COLUMNS_TYPE];
    formattedColumn = { ...formattedColumn, ...getCellEditorConfig(column) };

    formattedColumn.headerComponent = CustomHeader;
    formattedColumn.headerComponentParams = {
      metadata: column?.metadata,
      datasetId,
      options: column.options,
      handleSuccessfulUpdate,
      tableRef,
      handleRulesListingSideDrawerOpen,
      zampIds,
      filterType: column.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG ? FILTER_TYPES.TAGS : column.type,
    };

    if (!column.metadata?.is_hidden) {
      columns.push(formattedColumn);
    }
  });

  // re-order columns based on the columnOrderingVisibilityForCurrentDataset
  const orderedColumns: ColDef[] =
    getColumnOrderingVisibilityForCurrentDataset(datasetId)?.map((column: MapAny) => {
      return { ...columns.find((col) => col.field === column.colId), hide: !column.isVisible };
    }) ?? [];

  return orderedColumns?.length ? orderedColumns : columns;
};

export const getCellEditorConfig = (column: DatasetFilterConfigResponseType) => {
  if (column.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG) {
    return {
      cellEditor: CustomTagEditor,
      cellEditorParams: {
        values: column.options,
      },
    };
  }

  switch (column?.type) {
    case FILTER_TYPES.MULTI_SELECT:
      return {
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          values: column.options,
          allowTyping: true,
          filterList: true,
          highlightMatch: true,
          searchType: 'match',
          cellHeight: 32,
        },
      };
    case FILTER_TYPES.SEARCH:
      return {
        cellEditor: 'agTextCellEditor',
      };
    case FILTER_TYPES.AMOUNT_RANGE:
      return {
        cellEditor: 'agNumberCellEditor',
      };
    case FILTER_TYPES.DATE_RANGE:
      return {
        cellEditor: CustomDateTimeEditor,
      };
  }
};

export const convertApiFiltersToRuleFilters = (filters?: RuleFilters): MapAny => {
  if (!filters) return {};
  const { conditions } = filters;
  const filtersConfig: MapAny = {};

  conditions.forEach((condition) => {
    const { column, operator, value } = condition;

    filtersConfig[column.column] = {
      filterType: FILTER_TYPES.MULTI_SELECT,
      type: operator,
      values: value,
    };
  });

  return filtersConfig;
};

export const getColumnOrderingVisibilityForCurrentDataset = (datasetId: string) => {
  const currentColumnOrderingVisibility = JSON.parse(
    getFromLocalStorage(LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY) ?? '{}',
  );

  return currentColumnOrderingVisibility[datasetId];
};

export const getFilters = (filtersString: string, filterConfig: DatasetFilterConfigResponseType[]) => {
  const filters = JSON.parse(filtersString);
  const filterKeys = Object.keys(filters);

  const requiredFilterConfigs = filterConfig.filter(
    (item) => item.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG && filterKeys.includes(item.column),
  );

  requiredFilterConfigs.forEach((item) => {
    const startsWithValues: string = filters[item.column]?.values?.[0];

    filters[item.column] = {
      filterType: FILTER_TYPES.MULTI_SELECT,
      type: CONDITION_OPERATOR_TYPE.CONTAINS,
      values: item.options.filter((option) => option && option.startsWith(startsWithValues)),
    };
  });

  return filters;
};
