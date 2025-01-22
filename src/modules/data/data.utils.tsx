import { ColDef } from 'ag-grid-community';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInMonths } from 'date-fns';
import { CustomColumnsMapping } from 'modules/data/data.constants';
import { DatasetFilterConfigResponseType, DatasetType } from 'types/api/dataset.types';
import { CUSTOM_COLUMNS_TYPE } from 'components/common/table/table.types';
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
): { columns: ColDef[]; columnDataTypeMapping: Record<string, string> } => {
  const columns: ColDef[] = [];
  const columnDataTypeMapping: Record<string, string> = {};

  filterConfig?.forEach((column: DatasetFilterConfigResponseType) => {
    const formattedColumn: ColDef = {
      field: column.column,
      filter: AG_GRID_FILTER_TYPES[column.type as keyof typeof AG_GRID_FILTER_TYPES] ?? '',
      filterParams: {
        values: column.options,
      },
      flex: 1,
      hide: column.metadata?.is_hidden,
      cellRendererParams: column.metadata,
    };

    formattedColumn.cellRenderer = CustomColumnsMapping[column.metadata?.custom_type as CUSTOM_COLUMNS_TYPE];

    columns.push(formattedColumn);
    columnDataTypeMapping[column.column] = column.datatype;
  });

  return { columns, columnDataTypeMapping };
};
