import { ColDef } from 'ag-grid-community';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInMonths } from 'date-fns';
import { CustomColumnsMapping } from 'modules/data/data.constants';
import {
  DatasetFilterConfigResponseType,
  DatasetType,
  DatasetUpdateResponseType,
  RuleFilters,
} from 'types/api/dataset.types';
import { MapAny } from 'types/commonTypes';
import CustomDateTimeEditor from 'components/common/table/CustomCellEditors/CustomDateTimeEditor';
import CustomTagEditor from 'components/common/table/CustomCellEditors/CustomTagEditor';
import CustomHeader from 'components/common/table/CustomHeader';
import { CUSTOM_COLUMNS_TYPE } from 'components/common/table/table.types';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { AG_GRID_FILTER_TYPES } from 'components/filter/filters.constants';
export const findTimeDifference = (updated_at: string): string => {
  const currentTime = new Date();
  const lastUpdatedTime = new Date(updated_at);
  const differenceInMinutesString = differenceInMinutes(currentTime, lastUpdatedTime);

  if (differenceInMinutesString < 60) {
    return `${differenceInMinutesString} minutes ago`;
  }

  const differenceInHoursString = differenceInHours(currentTime, lastUpdatedTime);

  if (differenceInHoursString < 24) {
    return `${differenceInHoursString} hours ago`;
  }

  const differenceInDaysString = differenceInDays(currentTime, lastUpdatedTime);

  if (differenceInDaysString < 30) {
    return `${differenceInDaysString} days ago`;
  }

  const differenceInMonthsString = differenceInMonths(currentTime, lastUpdatedTime);

  return `${differenceInMonthsString} months ago`;
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
  handleSuccessfullUpdate: (data: DatasetUpdateResponseType) => void,
): ColDef[] => {
  const columns: ColDef[] = [];

  filterConfig?.forEach((column: DatasetFilterConfigResponseType) => {
    let formattedColumn: ColDef = {
      field: column.column,
      filter: AG_GRID_FILTER_TYPES[column.type as keyof typeof AG_GRID_FILTER_TYPES] ?? '',
      filterParams: {
        values: column.options,
      },
      flex: 1,
      hide: column.metadata?.is_hidden,
      cellRendererParams: column.metadata,
      editable: column.metadata?.is_editable && !isInitiatedAction,
      suppressFillHandle: !column.metadata?.is_editable,
    };

    formattedColumn.cellRenderer = CustomColumnsMapping[column.metadata?.custom_type as CUSTOM_COLUMNS_TYPE];
    formattedColumn = { ...formattedColumn, ...getCellEditorConfig(column) };

    if (column.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG) {
      formattedColumn.headerComponent = CustomHeader;
      formattedColumn.headerComponentParams = {
        metadata: column?.metadata,
        datasetId,
        options: column.options,
        handleSuccessfullUpdate,
      };
    }

    columns.push(formattedColumn);
  });

  return columns;
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

  switch (column.type) {
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
