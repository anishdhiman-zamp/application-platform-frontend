import { type RefObject } from 'react';
import { captureException } from '@sentry/browser';
import { snakeCaseToDisplayName } from '@zamp-platform/dataset-create-edit/utils/columnConversion';
import { ColumnDef, CUSTOM_HEADER_NAME } from '@zamp-platform/tanstack-table';
import { DATE_FORMATS, formatRelativeWithCustomLocale, VALID_DATE_FORMATS } from '@zamp-platform/utils';
import {
  ColDef,
  type ColumnMovedEvent,
  IServerSideGetRowsRequest,
  type SortDirection,
  ValueFormatterParams,
} from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { format, isValid } from 'date-fns';
import {
  COLUMN_TYPE_WIDTH_MAP,
  COLUMN_WIDTHS,
  CustomColumnsMapping,
  NEW_COLUMN_PREFIX,
} from 'modules/data/data.constants';
import {
  ColumnOrderingVisibilityType,
  type DatasetTabType,
  type DatasetUrlDataType,
  FormatColumnsParamsType,
  FrontendColumnConfig,
  ItemWithId,
} from 'modules/data/data.types';
import { N_A_VALUE } from 'modules/process/process.constant';
import { DatasetFilterConfigResponseType, DatasetType, RuleFilters, ValueFormatType } from 'types/api/dataset.types';
import { MapAny } from 'types/commonTypes';
import { AggregationFunctionType, FilterModelType, FilterType, LogicalOperatorType } from 'types/components/table.type';
import {
  capitalizeWords,
  createDateObjectFromUTCString,
  findTimeDifference,
  getCommaSeparatedNumber,
  getTagColor,
  snakeCaseToSentenceCase,
} from 'utils/common';
import ActivityLinkWrapper from '@/components/common/table/CustomCellWrapper/ActivityLinkWrapper';
import ChatbotCellWrapper from '@/components/common/table/CustomCellWrapper/ChatbotCellWrapper';
import { withLinkCellWrapper } from '@/components/common/table/CustomCellWrapper/withLinkCellWrapper';
import CustomHeaderTk from '@/components/common/tanstackTable/customHeader';
import { toast } from '@/components/common/toast/Toast';
import { getDatasetDrilldownRoute, getPageDatasetDrilldownRoute } from '@/constants/routeConfig';
import { DisplayConfigType } from '@/types/api/admin.types';
import type { MissingFieldItemType } from '@/types/api/processApi.types';
import CustomDateTimeEditor from 'components/common/table/CustomCellEditors/CustomDateTimeEditor';
import CustomTagEditor from 'components/common/table/CustomCellEditors/CustomTagEditor';
import { ArrayFilters } from 'components/common/table/table.constants';
import { CUSTOM_COLUMNS_TYPE, VALUE_FORMAT_TYPE } from 'components/common/table/table.types';
import { getEncodedRequest } from 'components/common/table/table.utils';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { AG_GRID_FILTER_TYPES, CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

export const formatData = (data: DatasetType[]): DatasetType[] => {
  return data.map((item) => ({
    ...item,
    updated_at: findTimeDifference(item.updatedAt),
  }));
};

export const getColumnMinWidth = (columnNameLength: number, customColumnType?: CUSTOM_COLUMNS_TYPE): number => {
  // Check if it's a special activity column type first
  if (customColumnType && customColumnType in COLUMN_TYPE_WIDTH_MAP) {
    return COLUMN_TYPE_WIDTH_MAP[customColumnType as keyof typeof COLUMN_TYPE_WIDTH_MAP];
  }

  // Handle dynamic width for long column names
  if (columnNameLength > COLUMN_WIDTHS.CHAR_THRESHOLD) {
    return COLUMN_WIDTHS.BASE + COLUMN_WIDTHS.EXTRA_CHAR_WIDTH * (columnNameLength - COLUMN_WIDTHS.CHAR_THRESHOLD);
  }

  // Default width
  return COLUMN_WIDTHS.BASE;
};

const checkIsCellEditable = (params: MapAny, missingFields: MissingFieldItemType[]): boolean => {
  if (!missingFields?.length) return true;

  const rowId = params.data?.id;

  return missingFields.some((field) => field?.id === rowId && field?.column === params?.column?.colId);
};

export const formatColumns: (params: FormatColumnsParamsType) => ColDef[] = ({
  filterConfig,
  currentUserHasEditAccess,
  datasetId,
  handleSuccessfulUpdate,
  tableRef,
  handleRulesListingSideDrawerOpen,
  sortColumn,
  sortOrder,
  isProcess,
  isMenuDisabled,
  missingFields,
  wrapLink,
  isSelfServe,
  isArtifact,
}) => {
  const columns: ColDef[] = [];

  const columnOrderingVisibility = getColumnOrderingVisibilityForCurrentDataset(datasetId);

  filterConfig?.forEach((column: DatasetFilterConfigResponseType) => {
    const columnNameLength = column?.alias?.length ?? column?.column?.length;
    const storedColumnConfig = columnOrderingVisibility?.find((columnLocal) => columnLocal.colId === column?.column);
    const columnWidth = storedColumnConfig?.width ?? 0;
    const valueFormat = Array.isArray(column.metadata?.config?.value_format)
      ? column.metadata?.config?.value_format
      : [column.metadata?.config?.value_format];

    const finalWidth = columnWidth > 0 ? columnWidth : COLUMN_WIDTHS.BASE;
    const calculatedMinWidth = getColumnMinWidth(
      columnNameLength,
      column?.metadata?.custom_type as CUSTOM_COLUMNS_TYPE,
    );

    // Use localStorage visibility if available, otherwise fall back to backend metadata
    // This prevents the "flash" when switching tabs (columns briefly visible then hidden)
    const isHidden = storedColumnConfig !== undefined ? !storedColumnConfig.isVisible : column?.metadata?.is_hidden;

    let formattedColumn: ColDef = {
      field: column?.column,
      hide: isHidden,
      cellRendererParams: { ...column?.metadata, datasetId },
      editable: (params: MapAny) =>
        !!(
          column?.metadata?.is_editable &&
          currentUserHasEditAccess &&
          checkIsCellEditable(params, missingFields || [])
        ),
      suppressFillHandle: !column?.metadata?.is_editable,
      filter: AG_GRID_FILTER_TYPES[column.type as keyof typeof AG_GRID_FILTER_TYPES] ?? '',
      sort: sortColumn === column?.column ? (sortOrder as SortDirection) : undefined,
      filterParams: {
        values: column?.options,
      },
      suppressMovable:
        column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.ACTIVITY_STATUS ||
        column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.ACTIVITY_CURRENT_STATUS ||
        column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.ACTIVITY_DOCUMENT,
      headerName:
        column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.ACTIVITY_STATUS
          ? ''
          : snakeCaseToSentenceCase(column?.alias || column?.column),
      minWidth: calculatedMinWidth,
      maxWidth:
        column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.ACTIVITY_STATUS
          ? COLUMN_WIDTHS.ACTIVITY_STATUS
          : undefined,
      width: finalWidth,
      flex: 0, // Set flex to 0 to override defaultColDef's flex:1
    };

    formattedColumn.cellRenderer = wrapLink
      ? withLinkCellWrapper(
          ActivityLinkWrapper,
          CustomColumnsMapping[(column.metadata?.custom_type as CUSTOM_COLUMNS_TYPE) ?? column?.column],
        )
      : isArtifact
        ? withLinkCellWrapper(
            ChatbotCellWrapper,
            CustomColumnsMapping[(column.metadata?.custom_type as CUSTOM_COLUMNS_TYPE) ?? column?.column],
          )
        : CustomColumnsMapping[(column.metadata?.custom_type as CUSTOM_COLUMNS_TYPE) ?? column?.column];
    formattedColumn = { ...formattedColumn, ...getCellEditorConfig(column) };

    formattedColumn.headerComponentParams = {
      metadata: column?.metadata,
      datasetId,
      options: column?.options?.filter((option) => option !== null),
      handleSuccessfulUpdate,
      tableRef,
      handleRulesListingSideDrawerOpen,
      filterType:
        column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG
          ? FILTER_TYPES.TAGS
          : column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.DOCUMENT
            ? FILTER_TYPES.DOCUMENT
            : column?.type,
      headerBackgroundNeeded: false,
      className: isProcess && 'py-2 px-4 hover:bg-transparent',
      hideFloatingFilter:
        column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.ACTIVITY_CURRENT_STATUS ||
        column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.ACTIVITY_STATUS ||
        column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.ACTIVITY_DOCUMENT,
      isMenuDisabled,
      dateFormat: valueFormat?.find((item) => item?.type === VALUE_FORMAT_TYPE.DATE_TIME)?.value,
      isSelfServe,
    };

    if (column?.metadata?.config?.value_format) {
      formattedColumn = { ...formattedColumn, valueFormatter: getValueFormatter(column) };
    }

    if (column?.type === FILTER_TYPES.DATE_RANGE && !column?.metadata?.config?.value_format) {
      formattedColumn = {
        ...formattedColumn,
        valueFormatter: (params: ValueFormatterParams) =>
          getFormattedDate(
            { type: VALUE_FORMAT_TYPE.DATE_TIME, value: DATE_FORMATS.ddMMMyyyy },
            params.value,
          ) as string,
      };
    }

    if (column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG) {
      const tagColorMap: MapAny = {};

      column?.options?.forEach((option) => {
        if (option) {
          if (!tagColorMap[option]) {
            tagColorMap[option] = getTagColor();
          }
        }
      });
      formattedColumn.cellRendererParams = { ...formattedColumn.cellRendererParams, tagColorMap };
      formattedColumn.headerComponentParams = {
        ...formattedColumn.headerComponentParams,
        filterComponentProps: { tagColorMap },
      };
      formattedColumn.cellEditorParams = {
        ...formattedColumn.cellEditorParams,
        tagColorMap,
      };
    }

    // Only exclude columns that are explicitly hidden, don't filter by suppressMovable here
    if (!column?.metadata?.is_hidden) {
      columns.push(formattedColumn);
    }
  });

  // re-order columns based on the columnOrderingVisibilityForCurrentDataset
  const orderedColumns: ColDef[] =
    getColumnOrderingVisibilityForCurrentDataset(datasetId)?.map((column: MapAny) => {
      return { ...columns.find((col) => col.field === column.colId), hide: !column.isVisible };
    }) ?? [];

  if (orderedColumns?.length < columns?.length) {
    const missingColumns = columns?.filter(
      (col) => !orderedColumns?.some((orderedCol) => orderedCol?.field === col?.field),
    );

    orderedColumns?.push(...missingColumns);
    // Build a map from existing localStorage to preserve columnType, isRequired, defaultValue
    const existingLsMap = new Map((columnOrderingVisibility ?? []).map((col: MapAny) => [col.colId, col]));
    const updatedColumnOrderingVisibility: ColumnOrderingVisibilityType[] = orderedColumns?.map((column) => {
      const existingLsCol = existingLsMap.get(column?.field ?? '') as ColumnOrderingVisibilityType | undefined;

      return {
        colId: column?.field ?? '',
        columnName: column?.headerName || column?.field || '',
        isVisible: !column?.hide,
        width: column?.width ?? 0,
        // Preserve existing metadata from localStorage so it doesn't get wiped out
        ...(existingLsCol?.columnType && { columnType: existingLsCol.columnType }),
        ...(existingLsCol?.isRequired !== undefined && { isRequired: existingLsCol.isRequired }),
        ...(existingLsCol?.defaultValue !== undefined && { defaultValue: existingLsCol.defaultValue }),
      };
    });

    updateLocalStorage(updatedColumnOrderingVisibility, datasetId);
  }

  return orderedColumns?.length ? orderedColumns : columns;
};

export const formatTanStackColumns = (params: FormatColumnsParamsType): ColumnDef<any>[] => {
  const columns = formatColumns(params);
  const { wrapLink } = params;

  return columns.map((tanColumn, index): ColumnDef<any> => {
    // Ensure we always have a valid column ID for TanStack Table
    const columnId = tanColumn?.field || tanColumn?.colId || tanColumn?.headerName || `column_${index}`;

    // Validate that the column ID is not empty or just whitespace
    const validColumnId = columnId && columnId.trim() ? columnId.trim() : `column_${index}`;

    const tanStackColumn: ColumnDef<any> = {
      id: validColumnId,
      accessorKey: validColumnId,
      header: tanColumn?.headerName || tanColumn?.field || tanColumn?.colId || '',
      size: tanColumn.width || tanColumn.initialWidth || 150,
      minSize: tanColumn?.minWidth || 50,
      maxSize: tanColumn?.maxWidth || undefined,
      enableSorting: !(tanColumn as any)?.suppressSorting,
      enableResizing: !(tanColumn as any).suppressResize,
      enableHiding: !(tanColumn as any).suppressColumnsToolPanel,
      enablePinning: true,
      meta: {
        customType: tanColumn.cellRendererParams?.custom_type,
        metadata: tanColumn.cellRendererParams,
        suppressMovable: tanColumn.suppressMovable,
      },
    };

    // Handle cell rendering and value formatting with proper precedence
    if (tanColumn.cellRenderer) {
      tanStackColumn.cell = (cellContext: any) => {
        const { getValue, row, column } = cellContext;
        const CellRenderer = tanColumn?.cellRenderer;

        // Check if this is the wrapped ActivityLinkWrapper
        const isActivityLinkWrapper = CellRenderer?.displayName === 'WrappedRenderer' && wrapLink;

        if (typeof CellRenderer === 'function') {
          const aliasKey = tanColumn?.headerComponentParams?.alias ?? tanColumn?.cellRendererParams?.alias;
          const fallbackValue =
            getValue() ??
            row.original?.[column.id] ??
            (tanColumn?.field && row.original?.[tanColumn.field]) ??
            (aliasKey && row.original?.[aliasKey]);

          // Use absolute row index for ActivityLinkWrapper
          const rowIndex = isActivityLinkWrapper ? cellContext.absoluteRowIndex : row.index;

          const agGridParams = {
            ...tanColumn?.cellRendererParams,
            value: fallbackValue,
            data: row?.original,
            node: { data: row?.original, rowIndex },
            column: {
              id: column.id,
              getColId: () => column.id, // Maintain backward compatibility for cell renderers
            },
            valueFormatted: fallbackValue,
          };

          return <CellRenderer {...agGridParams} />;
        }

        const rawValue = getValue();

        if (Array.isArray(rawValue)) return rawValue.join(', ');
        if (rawValue != null && typeof rawValue === 'object') return '';

        return rawValue;
      };
    } else if (tanColumn.valueFormatter && typeof tanColumn.valueFormatter === 'function') {
      tanStackColumn.cell = ({ getValue, row, column }: any) => {
        const formatter = tanColumn?.valueFormatter as (params: ValueFormatterParams) => string;
        // Create AG-Grid compatible params for backward compatibility
        const compatibleParams = {
          value: getValue(),
          data: row?.original,
          node: { data: row?.original },
          column: {
            id: column.id,
            getColId: () => column.id, // Maintain backward compatibility
          },
          // Add required AG-Grid properties with safe defaults
          colDef: tanColumn,
          api: null as any,
          context: null as any,
        };

        return formatter(compatibleParams as unknown as ValueFormatterParams);
      };
    } else {
      // Default cell rendering - ensure we have a fallback for columns without custom renderers
      tanStackColumn.cell = ({ getValue, row, column }: any) => {
        const value = getValue();
        // Handle cases where getValue() might not work due to accessor issues
        const fallbackValue = value ?? row.original?.[column.id] ?? row.original?.[tanColumn?.field || ''];

        return fallbackValue != null ? String(fallbackValue) : '';
      };
    }

    // handle header name rendering
    tanStackColumn.header = (ctx: any) => {
      const col = ctx?.column;
      const colId = col?.id;
      const headerLabel =
        tanColumn?.cellRendererParams?.custom_type === CUSTOM_COLUMNS_TYPE.ACTIVITY_STATUS
          ? ''
          : tanColumn?.cellRendererParams?.custom_type === CUSTOM_COLUMNS_TYPE.ACTIVITY_CURRENT_STATUS
            ? snakeCaseToSentenceCase(CUSTOM_HEADER_NAME.CURRENT_STATUS)
            : snakeCaseToSentenceCase(
                tanColumn?.headerName || (typeof tanColumn?.field === 'string' ? tanColumn?.field : colId),
              );

      const headerProps = {
        columnId: colId,
        headerLabel,
        // Sorting controls
        onSortAsc: () => col?.toggleSorting(false),
        onSortDesc: () => col.toggleSorting(true),
        onClearSort: () => (col?.clearSorting ? col?.clearSorting() : col?.toggleSorting(false)),
        getIsSorted: () => col?.getIsSorted?.() ?? false,
        // Visibility control
        onHideColumn: () => col.toggleVisibility(false),
        // Pass through any metadata the header uses
        ...(tanColumn.headerComponentParams as any),
      };

      const HeaderComponent = (tanColumn.headerComponent as any) || CustomHeaderTk;

      return <HeaderComponent {...headerProps} />;
    };

    return tanStackColumn;
  });
};

export const getCellEditorConfig = (column: DatasetFilterConfigResponseType) => {
  if (column.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG) {
    return {
      cellEditor: CustomTagEditor,
      cellEditorParams: {
        values: column.options?.filter((option) => !!option),
      },
    };
  }

  switch (column?.type) {
    case FILTER_TYPES.MULTI_SELECT:
      return {
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          values: ['', ...(column.options ?? [])],
          allowTyping: true,
          filterList: true,
          highlightMatch: true,
          searchType: 'match',
          cellHeight: 32,
          formatValue: (value: string) => value || '(None)',
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

/**
 * Gets column ordering visibility for a dataset
 * Handles both old format (array) and new format (object with dataset_name and columns)
 */
export const getColumnOrderingVisibilityForCurrentDataset = (datasetId: string): ColumnOrderingVisibilityType[] => {
  const { getColumnConfigForDataset } = require('@zamp-platform/dataset-create-edit');
  const datasetData = getColumnConfigForDataset(datasetId);

  // If no data exists for this dataset
  if (!datasetData) {
    return [];
  }

  // New format: object with dataset_name and columns
  if (typeof datasetData === 'object' && 'columns' in datasetData) {
    return datasetData.columns || [];
  }

  // Old format: direct array
  if (Array.isArray(datasetData)) {
    return datasetData;
  }

  return [];
};

export const getUpdatedColumnOrderingVisibility = (
  currentColumnOrderingVisibility: ColumnOrderingVisibilityType[],
  filterConfig: DatasetFilterConfigResponseType[],
) => {
  // Create a map of existing column configurations for quick lookup
  const existingColumnsMap = new Map(currentColumnOrderingVisibility.map((col) => [col.colId, col]));

  // First, preserve the order of existing columns (will be filtered later to remove hidden ones)
  const updatedColumnOrderingVisibility: ColumnOrderingVisibilityType[] = currentColumnOrderingVisibility.map(
    (existingCol) => {
      const matchingFilterConfig = filterConfig.find((fc) => fc.column === existingCol.colId);

      if (matchingFilterConfig) {
        return {
          ...existingCol,
          isVisible: existingCol.isVisible, // Preserve user's visibility preference
        };
      }

      // Column no longer exists in filterConfig (could be FE-only or removed), preserve all properties for FE-only columns
      return {
        ...existingCol,
        colId: existingCol?.colId ?? '',
        width: existingCol?.width ?? 0,
      };
    },
  );

  // exclude columns with is_hidden=true, they should NEVER appear in localStorage
  filterConfig.forEach((column) => {
    if (!existingColumnsMap.has(column.column) && !column.metadata?.is_hidden) {
      // Use alias if it's a custom alias (different from raw column name), otherwise generate display name
      const hasCustomAlias = column.alias && column.alias !== column.column;
      const columnName = hasCustomAlias ? column.alias : snakeCaseToSentenceCase(column.column);

      updatedColumnOrderingVisibility.push({
        colId: column.column,
        columnName,
        isVisible: true, // If it's not hidden, it should be visible by default
        width: 0,
      });
    }
  });

  // Filter out hidden columns, Preserve FE-only columns (new columns not yet in backend)
  return updatedColumnOrderingVisibility.filter((col) => {
    const matchingFilterConfig = filterConfig.find((fc) => fc.column === col.colId);

    if (!matchingFilterConfig) {
      return col.colId.startsWith(NEW_COLUMN_PREFIX.COL_); // Keep FE-only columns
    }

    // For backend columns, keep only if NOT hidden
    return !matchingFilterConfig.metadata?.is_hidden;
  });
};

export const syncFilterConfigHiddenColumnsInLocalStorage = (
  datasetId: string,
  filterConfig: DatasetFilterConfigResponseType[],
) => {
  const currentDatasetColumnOrderingVisibility = getColumnOrderingVisibilityForCurrentDataset(datasetId) || [];

  updateLocalStorage(
    getUpdatedColumnOrderingVisibility(currentDatasetColumnOrderingVisibility, filterConfig),
    datasetId,
  );
};

export const getFilters = (filtersString: string, filterConfig: DatasetFilterConfigResponseType[]) => {
  const filters: MapAny = JSON.parse(filtersString);
  const filterKeys = Object.keys(filters);

  const requiredTagFilterConfigs = filterConfig?.filter(
    (item) => item.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG && filterKeys.includes(item.column),
  );

  requiredTagFilterConfigs.forEach((item) => {
    const operator = filters[item.column]?.type;
    const startsWithValues: string = filters[item.column]?.values?.[0];
    const isNull = operator === CONDITION_OPERATOR_TYPE.IS_NULL;

    filters[item.column] = {
      filterType: FILTER_TYPES.MULTI_SELECT,
      type: isNull ? CONDITION_OPERATOR_TYPE.IS_NULL : CONDITION_OPERATOR_TYPE.CONTAINS,
      values: isNull ? [] : (item?.options || [])?.filter((option) => option?.startsWith(startsWithValues)),
    };
  });

  const requiredSearchFilterConfigs = filterConfig.filter(
    (item) => item.type === FILTER_TYPES.SEARCH && filterKeys.includes(item.column),
  );

  requiredSearchFilterConfigs.forEach((item) => {
    const filterValue = filters[item.column];

    filters[item.column] = {
      filterType: filterValue?.filterType,
      type: filterValue?.type,
      filter: filterValue?.values?.[0],
    };
  });

  const defaultFilters: MapAny = {};

  Object.entries(filters).forEach(([key, value]) => {
    defaultFilters[key] = { ...value, isDefault: true };
  });

  return defaultFilters;
};

export const getValueFormatter = (
  column: DatasetFilterConfigResponseType,
): ((params?: ValueFormatterParams, value?: string, data?: MapAny) => string) => {
  const valueFormatter = (params?: ValueFormatterParams, value?: string, data?: MapAny) => {
    let formattedValue = value ?? params?.value;
    const valueFormats = Array.isArray(column.metadata?.config?.value_format)
      ? column.metadata?.config?.value_format
      : [column.metadata?.config?.value_format];

    valueFormats?.forEach((valueFormat) => {
      switch (valueFormat?.type) {
        case VALUE_FORMAT_TYPE.ROUND_OFF:
          formattedValue = getCommaSeparatedNumber(Number(formattedValue), valueFormat?.value as number);
          break;
        case VALUE_FORMAT_TYPE.DATE_TIME:
          formattedValue = getFormattedDate(valueFormat, formattedValue);
          break;
        case VALUE_FORMAT_TYPE.PREFIX:
          formattedValue = getFormattedValueWithPrefix(valueFormat, formattedValue);
          break;
        case VALUE_FORMAT_TYPE.COLUMN_PREFIX:
          formattedValue = getFormattedValueWithColumnPrefix(valueFormat, formattedValue, data ?? params?.data);
          break;
      }
    });

    return formattedValue;
  };

  return valueFormatter;
};

export const getFormattedDate = (valueFormat: ValueFormatType, value: string | number) => {
  const dateFormat = valueFormat?.value as string;
  const validDateFormat = VALID_DATE_FORMATS.includes(dateFormat) ? dateFormat : DATE_FORMATS.ddMMMyyyy;

  if (typeof value === 'number' && value === 0) return '';

  // expect value to be in microseconds when it is a number
  const date = typeof value === 'number' ? new Date(value / 1000) : new Date(createDateObjectFromUTCString(value));
  const isValidDate = isValid(date);

  if (dateFormat === DATE_FORMATS.RELATIVE) return isValidDate ? formatRelativeWithCustomLocale(date) : value;

  return isValidDate ? format(date, validDateFormat) : value;
};

const getFormattedValueWithPrefix = (valueFormat: ValueFormatType, value: string) => {
  const prefix = valueFormat?.value ?? '';

  return prefix && value ? `${prefix} ${value}` : value;
};

const getFormattedValueWithColumnPrefix = (valueFormat: ValueFormatType, value: string, data: MapAny) => {
  const columnToBeUsedForPrefix = valueFormat?.value ?? '';
  const prefixValue = data?.[columnToBeUsedForPrefix]?.toUpperCase();

  return prefixValue && value ? `${prefixValue} ${getCommaSeparatedNumber(Number(value), 2)}` : value;
};

export const convertFilterModelToRuleFilters = (filterModel: FilterModelType | null): RuleFilters | null => {
  if (!filterModel) return null;

  const ruleFilters: RuleFilters = {
    logical_operator: filterModel.logical_operator ?? LogicalOperatorType.OperatorLogicalAnd,
    conditions: [],
  };

  filterModel.conditions?.forEach((condition) => {
    ruleFilters.conditions.push({
      logical_operator: condition.logical_operator ?? LogicalOperatorType.OperatorLogicalAnd,
      column: {
        column: condition.column as string,
        datatype: '',
        custom_data_config: {},
        alias: '',
      },
      operator: condition.operator ?? CONDITION_OPERATOR_TYPE.EQUAL,
      value: condition.value,
    });
  });

  return ruleFilters;
};

const getAggregations = (colIds: string[]): MapAny => {
  const valueCols: MapAny[] = [];

  colIds.forEach((colId) => {
    const valueCol = [
      {
        id: colId,
        aggFunc: AggregationFunctionType.AggregationFunctionSum?.toLowerCase(),
        displayName: `${colId} ${AggregationFunctionType.AggregationFunctionSum}`,
      },
      {
        id: colId,
        aggFunc: AggregationFunctionType.AggregationFunctionAvg?.toLowerCase(),
        displayName: `${colId} ${AggregationFunctionType.AggregationFunctionAvg}`,
      },
      {
        id: colId,
        aggFunc: AggregationFunctionType.AggregationFunctionMin?.toLowerCase(),
        displayName: `${colId} ${AggregationFunctionType.AggregationFunctionMin}`,
      },
      {
        id: colId,
        aggFunc: AggregationFunctionType.AggregationFunctionMax?.toLowerCase(),
        displayName: `${colId} ${AggregationFunctionType.AggregationFunctionMax}`,
      },
    ];

    valueCols.push(...valueCol);
  });

  return { valueCols };
};

export const getEncodedRequestWithAggregations = (colIds: string[]) =>
  getEncodedRequest(getAggregations(colIds) as IServerSideGetRowsRequest, '', true, true, true);

export const formatColumnLevelStats = (columnLevelStatsData?: MapAny): MapAny => {
  if (!columnLevelStatsData) return {};
  const columnLevelStats: MapAny = {};

  Object.entries(columnLevelStatsData).forEach(([key, value]) => {
    const [column, aggFunction] = key.split(' ');

    columnLevelStats[column] = {
      ...columnLevelStats[column],
      [aggFunction]: value,
    };
  });

  return columnLevelStats;
};

export const formatDrilldownFilters = (
  drilldownFilters: FilterModelType,
  filterConfig: DatasetFilterConfigResponseType[],
) => {
  const selectedDrilldownFilters: MapAny = {};
  const hiddenDrilldownFilters: MapAny = {};

  drilldownFilters.conditions?.forEach((condition) => {
    const columnName = condition.column ?? '';
    const filterConfigItem = filterConfig.find((item) => item.column === columnName);
    const filterType = filterConfigItem?.type;
    const isHiddenColumn = filterConfigItem?.metadata?.is_hidden;

    switch (filterType) {
      case FILTER_TYPES.AMOUNT_RANGE:
        if (isHiddenColumn) {
          hiddenDrilldownFilters[columnName] = {
            filterType: filterType,
            type: condition.operator,
            filter: condition.value,
          };
        } else {
          selectedDrilldownFilters[columnName] = {
            filterType: filterType,
            type: condition.operator,
            filter: condition.value,
          };
        }
        break;
      case FILTER_TYPES.MULTI_SELECT:
        if (isHiddenColumn) {
          hiddenDrilldownFilters[columnName] = {
            filterType: filterType,
            type: condition.operator,
            values: condition.value,
          };
        } else {
          selectedDrilldownFilters[columnName] = {
            filterType: filterType,
            type: condition.operator,
            values: condition.value,
          };
        }
        break;
      case FILTER_TYPES.DATE_RANGE:
        if (isHiddenColumn) {
          hiddenDrilldownFilters[columnName] = {
            filterType: filterType,
            type: condition.operator,
            dateFrom: condition.value?.[0],
            dateTo: condition.value?.[1],
          };
        } else {
          selectedDrilldownFilters[columnName] = {
            filterType: filterType,
            type: condition.operator,
            dateFrom: condition.value?.[0],
            dateTo: condition.value?.[1],
          };
        }
        break;
      case FILTER_TYPES.SEARCH:
        if (isHiddenColumn) {
          hiddenDrilldownFilters[columnName] = {
            filterType: filterType,
            type: condition.operator,
            filter: condition.value,
          };
        } else {
          selectedDrilldownFilters[columnName] = {
            filterType: filterType,
            type: condition.operator,
            filter: condition.value,
          };
        }
        break;
      case FILTER_TYPES.ARRAY_SEARCH:
        if (isHiddenColumn) {
          hiddenDrilldownFilters[columnName] = {
            filterType: filterType,
            type: condition.operator,
            value: condition.value,
          };
        } else {
          selectedDrilldownFilters[columnName] = {
            filterType: filterType,
            type: condition.operator,
            value: condition.value,
          };
        }
        break;
    }
  });

  const defaultSelectedDrilldownFilters: MapAny = {};

  Object.entries(selectedDrilldownFilters).forEach(([key, value]) => {
    defaultSelectedDrilldownFilters[key] = { ...value, isDefault: true };
  });

  return { selectedDrilldownFilters: defaultSelectedDrilldownFilters, hiddenDrilldownFilters };
};

export const formatUrlFilters = (filters: string): FilterModelType | null => {
  if (!filters) return null;
  const urlFilters: FilterModelType = {
    logical_operator: LogicalOperatorType.OperatorLogicalAnd,
    conditions: [],
  };

  const filtersObject: MapAny = JSON.parse(filters);
  const urlFiltersConditions: FilterType[] = [];

  Object.entries(filtersObject).forEach(([key, value]) => {
    const filterType = value?.filterType;
    let startDate;
    let endDate;

    switch (filterType) {
      case FILTER_TYPES.DATE_RANGE:
        startDate = new Date(value?.dateFrom);

        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(value?.dateTo);

        endDate.setHours(23, 59, 59, 999);
        urlFiltersConditions.push({
          column: key,
          operator: value?.type,
          value: [format(startDate, DATE_FORMATS.YYYYMMDD_HHMMSS), format(endDate, DATE_FORMATS.YYYYMMDD_HHMMSS)],
        });
        break;
      default:
        urlFiltersConditions.push({
          column: key,
          operator: value?.type,
          value: ArrayFilters.includes(value?.type) ? value?.values : value?.values?.[0],
        });
        break;
    }
  });

  urlFilters.conditions = urlFiltersConditions;

  return urlFilters;
};

/**
 * Updates localStorage with column ordering/visibility for a dataset
 * Saves in new format with dataset_name and columns
 * Preserves existing dataset_name if already set
 */
export const updateLocalStorage = (columnOrderingVisibility: ColumnOrderingVisibilityType[], datasetId: string) => {
  const { getColumnConfigForDataset, setColumnConfigForDataset } = require('@zamp-platform/dataset-create-edit');
  const existingData = getColumnConfigForDataset(datasetId);

  // Get existing dataset_name if available, otherwise use datasetId as fallback
  let datasetName = datasetId;

  if (existingData && typeof existingData === 'object' && 'dataset_name' in existingData) {
    datasetName = (existingData as { dataset_name?: string }).dataset_name || datasetId;
  }

  // Preserve existing dataset_unique_key_name
  const existingUniqueKeyName = (existingData as { dataset_unique_key_name?: string })?.dataset_unique_key_name || '';

  // Save in new format (org-scoped), preserving dataset_unique_key_name
  const updatedEntry = {
    dataset_name: datasetName,
    dataset_unique_key_name: existingUniqueKeyName,
    columns: columnOrderingVisibility,
  };

  setColumnConfigForDataset(datasetId, updatedEntry);
};

/**
 * Syncs dataset names and column types from listing API to localStorage
 * Creates entries for all datasets with their titles and syncs column types from schema
 * This should be called when the /datasets page loads
 * @param datasets - Array of datasets from useGetDatasetListingQuery (DatasetType with metadata.schema)
 */
export const syncAllDatasetNamesToLocalStorage = (
  datasets: Array<{
    id: string;
    title: string;
    tableName?: string;
    metadata?: {
      display_config?: Array<{ column: string; alias?: string | null; is_hidden?: boolean }>;
      schema?: {
        columns?: Array<{
          name: string;
          type: string;
          nullable?: boolean;
          default?: string | boolean | null;
        }>;
      };
    };
  }>,
) => {
  try {
    const { getColumnConfigForDataset, setColumnConfigForDataset } = require('@zamp-platform/dataset-create-edit');

    // System columns to filter out
    const SYSTEM_COLUMNS = ['id', '_zamp_is_deleted', 'created_at', 'updated_at'];

    datasets.forEach((dataset) => {
      if (!dataset.id || !dataset.title) return;

      const datasetId = dataset.id;
      const datasetTitle = dataset.title;
      const datasetTableName = dataset.tableName || '';
      const existingData = getColumnConfigForDataset(datasetId);

      // Build schema info map (column name -> {type, nullable, default})
      const schemaInfoMap = new Map<string, { type: string; nullable?: boolean; default?: string | boolean | null }>();

      dataset.metadata?.schema?.columns?.forEach((col) => {
        if (!SYSTEM_COLUMNS.includes(col.name)) {
          schemaInfoMap.set(col.name.toLowerCase(), {
            type: col.type,
            nullable: col.nullable,
            default: col.default,
          });
        }
      });

      // Keep schemaTypeMap for backward compatibility with type-only lookups
      const schemaTypeMap = new Map<string, string>();

      schemaInfoMap.forEach((info, name) => {
        schemaTypeMap.set(name, info.type);
      });

      // Build display config map for aliases (column -> alias)
      const displayConfigMap = new Map<string, string>();
      // Build is_hidden map (column -> is_hidden) to respect backend visibility
      const isHiddenMap = new Map<string, boolean>();

      dataset.metadata?.display_config?.forEach((item) => {
        if (!SYSTEM_COLUMNS.includes(item.column)) {
          if (item.alias) {
            displayConfigMap.set(item.column.toLowerCase(), item.alias);
          }
          if (item.is_hidden !== undefined) {
            isHiddenMap.set(item.column.toLowerCase(), item.is_hidden);
          }
        }
      });

      // Helper function to clean defaultValue - remove PostgreSQL type casting and quotes
      const cleanDefaultValue = (value: string | boolean | null): string | null => {
        if (value === null || value === undefined) return null;
        const strValue = String(value);
        // Remove PostgreSQL type casting (::text, ::integer, etc.)
        let cleaned = strValue.replace(/::\w+/g, '');

        // Remove surrounding single quotes if present
        cleaned = cleaned.replace(/^'|'$/g, '');

        return cleaned || null;
      };

      if (!existingData) {
        // Dataset doesn't exist in localStorage - create new entry with columns from schema
        const columnsFromSchema = Array.from(schemaInfoMap.entries()).map(([name, info]) => ({
          colId: name,
          columnName: displayConfigMap.get(name) || snakeCaseToDisplayName(name),
          isVisible: !isHiddenMap.get(name), // Respect backend is_hidden: true → isVisible: false
          width: 150,
          columnType: info.type.toUpperCase(),
          isRequired: info.nullable === false,
          defaultValue: cleanDefaultValue(info.default ?? null),
        }));

        setColumnConfigForDataset(datasetId, {
          dataset_name: datasetTitle,
          dataset_unique_key_name: datasetTableName,
          columns: columnsFromSchema,
        });
      } else if (Array.isArray(existingData)) {
        // Old format (array) - migrate to new format preserving columns but updating types
        const updatedColumns = (existingData as ColumnOrderingVisibilityType[]).map(
          (col: ColumnOrderingVisibilityType) => {
            const schemaInfo = schemaInfoMap.get(col.colId?.toLowerCase() || '');
            const alias = displayConfigMap.get(col.colId?.toLowerCase() || '');

            return {
              ...col,
              columnType: schemaInfo?.type?.toUpperCase() || col.columnType?.toUpperCase(),
              columnName: alias || snakeCaseToDisplayName(col.colId || ''),
              isRequired: schemaInfo?.nullable === false,
              defaultValue: cleanDefaultValue(schemaInfo?.default ?? col.defaultValue ?? null),
            };
          },
        );

        setColumnConfigForDataset(datasetId, {
          dataset_name: datasetTitle,
          dataset_unique_key_name: datasetTableName,
          columns: updatedColumns,
        });
      } else if (typeof existingData === 'object' && 'columns' in existingData) {
        // New format - only sync if localStorage is completely empty
        const existingColumns = (existingData as { columns?: unknown[] }).columns || [];
        const hasColumnData = existingColumns.length > 0;

        // Only sync if columns array is completely empty
        if (!hasColumnData) {
          const columnsFromSchema = Array.from(schemaInfoMap.entries()).map(([name, info]) => ({
            colId: name,
            columnName: displayConfigMap.get(name) || snakeCaseToDisplayName(name),
            isVisible: !isHiddenMap.get(name), // Respect backend is_hidden: true → isVisible: false
            width: 150,
            columnType: info.type.toUpperCase(),
            isRequired: info.nullable === false,
            defaultValue: cleanDefaultValue(info.default ?? null),
          }));

          setColumnConfigForDataset(datasetId, {
            dataset_name: datasetTitle,
            dataset_unique_key_name: datasetTableName,
            columns: columnsFromSchema,
          });
        } else {
          // Even if columns exist, update the dataset_unique_key_name if missing
          const existingRecord = existingData as Record<string, unknown>;

          if (!existingRecord.dataset_unique_key_name && datasetTableName) {
            setColumnConfigForDataset(datasetId, {
              ...existingRecord,
              dataset_unique_key_name: datasetTableName,
            });
          }
        }
      }
    });
  } catch (error) {
    console.error('[data.utils] Error syncing dataset data to localStorage:', error);
  }
};

/**
 * Syncs a single dataset's metadata to localStorage
 * Used on the detail page to ensure localStorage is synced from backend
 * @param dataset - Single dataset with metadata
 */
export const syncSingleDatasetToLocalStorage = (dataset: {
  id: string;
  title: string;
  tableName?: string;
  metadata?: {
    display_config?: Array<{ column: string; alias?: string | null; is_hidden?: boolean }>;
    schema?: {
      columns?: Array<{
        name: string;
        type: string;
        nullable?: boolean;
        default?: string | boolean | null;
      }>;
    };
  };
}) => {
  if (!dataset?.id || !dataset?.title) return;

  // Check if localStorage already has data for this dataset (org-scoped)
  try {
    const { getColumnConfigForDataset } = require('@zamp-platform/utils');
    const datasetData = getColumnConfigForDataset(dataset.id);

    // Only sync if localStorage is empty or doesn't have column data
    const hasColumnData =
      datasetData &&
      ((Array.isArray(datasetData) && (datasetData as unknown[]).length > 0) ||
        (typeof datasetData === 'object' &&
          'columns' in (datasetData as Record<string, unknown>) &&
          Array.isArray((datasetData as { columns?: unknown[] }).columns) &&
          (datasetData as { columns: unknown[] }).columns.length > 0));

    // Only sync if localStorage is completely empty (no columns)
    if (!hasColumnData) {
      syncAllDatasetNamesToLocalStorage([dataset]);
    }
  } catch {
    // If error reading localStorage, sync from backend
    syncAllDatasetNamesToLocalStorage([dataset]);
  }
};

export const parseDatasets = (datasets: DatasetUrlDataType): DatasetTabType[] => {
  const returnDatasets = Object.entries(datasets).map(([key, value]) => ({
    id: key,
    title: value?.title || '',
    filters: value?.filters || {},
  }));

  return returnDatasets;
};

/**
 * Removes cell focus from the table
 */
export const removeCellFocus = (tableRef: React.RefObject<AgGridReact | null>) => {
  tableRef.current?.api?.clearCellSelection();
  tableRef.current?.api?.clearFocusedCell();
};

/**
 * Handles drilldown navigation for dataset rows
 */
export const handleDrilldownClick = (data: MapAny, datasetId: string, pageId?: string, router?: any) => {
  if (!router) return;

  if (pageId) {
    router.push(getPageDatasetDrilldownRoute(pageId, datasetId, data?._zamp_id as string));
  } else {
    router.push(getDatasetDrilldownRoute(datasetId, data?._zamp_id as string));
  }
};

/**
 * Handles API errors with proper error logging and user feedback
 */
export const handleApiError = (error: any, errorMessage = 'Failed to update') => {
  captureException(error);
  toast.error(errorMessage);
};

/**
 * Handles column moved event and updates local storage
 */
export const handleColumnMoved = (event: ColumnMovedEvent, datasetId: string) => {
  const columnOrderingFromLocalStorage = getColumnOrderingVisibilityForCurrentDataset(datasetId);
  const latestColumns = event?.api?.getColumns() ?? [];
  const { column, toIndex = 0 } = event;

  if (!column) return;

  const columnOrderingVisibility: { colId: string; isVisible: boolean }[] = columnOrderingFromLocalStorage?.length
    ? columnOrderingFromLocalStorage
    : latestColumns.map((column) => ({
        colId: column.getColId(),
        isVisible: column.isVisible(),
      }));

  const movedColumn = columnOrderingVisibility.find((item) => item.colId === column?.getColId()) ?? {};
  const fromIndex = columnOrderingVisibility.findIndex((item) => item.colId === column?.getColId());

  if (fromIndex === toIndex) return;

  let finalList: { colId?: string; isVisible?: boolean }[] = [];

  if (fromIndex < toIndex) {
    const zeroToOldIndex = columnOrderingVisibility.slice(0, fromIndex) ?? [];
    const oldIndexToNewIndex = columnOrderingVisibility.slice(fromIndex + 1, toIndex + 1) ?? [];
    const newIndexToEnd = columnOrderingVisibility.slice(toIndex + 1) ?? [];

    finalList = [...zeroToOldIndex, ...oldIndexToNewIndex, movedColumn, ...newIndexToEnd];
  } else {
    const endToOldIndex = columnOrderingVisibility.slice(fromIndex + 1) ?? [];
    const oldIndexToNewIndex = columnOrderingVisibility.slice(toIndex, fromIndex) ?? [];
    const newIndexToStart = columnOrderingVisibility.slice(0, toIndex) ?? [];

    finalList = [...newIndexToStart, movedColumn, ...oldIndexToNewIndex, ...endToOldIndex];
  }

  // Use updateLocalStorage to save in new format
  updateLocalStorage(finalList as ColumnOrderingVisibilityType[], datasetId);
};

/**
 * Formats an array of objects or primitive values into a string.
 *
 * This function checks if the array consists of objects that each have a single key.
 * If all objects share the same key, it concatenates the values associated with that key into a single string.
 * If the array does not meet these conditions, it converts each item to a JSON string and joins them with a comma.
 *
 * @param {MapAny[]} value - The array of objects or primitive values to format.
 * @returns {string} A string representation of the array, either by joining values of a common key or by JSON stringifying each item.
 */
export const formatArrayValue = (value: MapAny[]): string => {
  // Check if it's an array of objects with same single key
  if (value?.length === 0) {
    return N_A_VALUE;
  }

  if (
    value?.length > 0 &&
    value?.every((item) => typeof item === 'object' && item !== null) &&
    value?.every((item) => Object.keys(item).length === 1)
  ) {
    const firstItem = value[0];
    const firstKey = Object.keys(firstItem)[0];

    // Check if all objects have the same key
    if (value?.every((item) => Object.keys(item)[0] === firstKey)) {
      // Join all values for that key
      return value?.map((item) => item[firstKey]).join(', ');
    }
  }

  return value
    ?.map((item: MapAny) => {
      if (typeof item === 'object') {
        return JSON.stringify(item);
      }

      return item;
    })
    .join(', ');
};

export const getDefaultOrderDisplayConfig = (
  allColumns: DisplayConfigType[],
  tableRef: RefObject<AgGridReact<any> | null>,
) => {
  const orderedColumnIds = tableRef?.current?.api?.getAllGridColumns()?.map((column) => column.getColId()) ?? [];

  // Create a map of existing columns for quick lookup
  const columnMap: Record<string, DisplayConfigType> = {};

  allColumns.forEach((column) => {
    columnMap[column.column] = column;
  });

  // Build the updated display config with new order
  const updatedDisplayConfig: DisplayConfigType[] = [];

  // Add columns in the specified order
  orderedColumnIds.forEach((columnId) => {
    const column = columnMap[columnId];

    if (column) {
      updatedDisplayConfig.push(column);
      delete columnMap[columnId]; // Remove from map to avoid duplicates
    }
  });

  // Add remaining columns (not in the order array) to the end
  Object.values(columnMap).forEach((column) => {
    updatedDisplayConfig.push(column);
  });

  return updatedDisplayConfig;
};

export const getUpdatedDateFormatDisplayConfig = (
  tableRef: RefObject<AgGridReact<any> | null>,
  columnId: string,
  value: string,
  displayConfig: DisplayConfigType[],
) => {
  const columnDefs = tableRef.current?.api?.getAllGridColumns().map((col) => {
    const def = col.getColDef();

    if (def.field === columnId) {
      return {
        ...def,
        headerComponentParams: {
          ...def.headerComponentParams,
          dateFormat: value,
        },
        valueFormatter: (params: ValueFormatterParams) =>
          getFormattedDate(
            { type: VALUE_FORMAT_TYPE.DATE_TIME, value: value as string },
            params.value as string,
          ) as string,
      };
    }

    return def;
  });

  tableRef.current?.api?.setGridOption('columnDefs', columnDefs);
  tableRef.current?.api?.refreshCells({ columns: [columnId], force: true });
  const displayConfigIndex = displayConfig?.findIndex((item) => item.column === columnId) ?? -1;

  if (displayConfigIndex === -1) return displayConfig;
  const updatedDisplayConfig =
    displayConfig.map((item) => {
      if (item.column === columnId) {
        return {
          ...item,
          config: {
            ...item.config,
            value_format: [{ type: VALUE_FORMAT_TYPE.DATE_TIME, value: value as string }],
          },
        };
      }

      return item;
    }) ?? [];

  return updatedDisplayConfig;
};

export const getUpdatedAliasDisplayConfig = (
  tableRef: RefObject<AgGridReact<any> | null>,
  columnId: string,
  value: string,
  displayConfig: DisplayConfigType[],
) => {
  const columnDefs = tableRef.current?.api?.getAllGridColumns().map((col) => {
    const def = col.getColDef();

    if (def.field === columnId) {
      return {
        ...def,
        headerName: value as string,
        minWidth: getColumnMinWidth(value.length),
      };
    }

    return def;
  });

  tableRef.current?.api?.setGridOption('columnDefs', columnDefs);
  const displayConfigIndex = displayConfig?.findIndex((item) => item.column === columnId) ?? -1;

  if (displayConfigIndex === -1) return displayConfig;
  const updatedDisplayConfig =
    displayConfig.map((item) => {
      if (item.column === columnId) {
        return { ...item, alias: value as string };
      }

      return item;
    }) ?? [];

  return updatedDisplayConfig;
};

/**
 * Prepares a query for dataset export by adding column ordering visibility.
 * @param {string} baseQuery - The base query string to be prepared.
 * @param {RefObject<AgGridReact<any> | null>} tableRef - Reference to the AG Grid table component.
 * @returns {string} The prepared query string with column ordering visibility.
 */

export const prepareExportQuery = (
  baseQuery: string,
  tableRef: RefObject<AgGridReact<any> | null>,
  activityId?: string,
): string => {
  const columns = tableRef?.current?.api?.getAllGridColumns() || [];
  const baseQueryObject = JSON.parse(baseQuery);

  const rawFilters = baseQueryObject.filters ?? {};

  const logical_operator = rawFilters.logical_operator ?? 'AND';
  const conditions: FilterType[] = Array.isArray(rawFilters.conditions) ? rawFilters.conditions : [];

  const updatedConditions = [...conditions];

  if (activityId) {
    updatedConditions.push({
      column: 'activity_run_id',
      operator: CONDITION_OPERATOR_TYPE.EQUAL,
      value: activityId,
    });
  }

  const updatedFilters = {
    logical_operator,
    conditions: updatedConditions,
  };

  const exportColumns = columns.map((column) => ({
    column: column.getColId(),
    is_hidden: !column.isVisible(),
    alias: capitalizeWords(column.getColDef()?.headerName || column.getColId()),
  }));

  const { pagination, ...baseQueryWithoutPagination } = baseQueryObject;

  const finalQuery = {
    ...baseQueryWithoutPagination,
    filters: updatedFilters,
    export_columns: exportColumns,
  };

  return JSON.stringify(finalQuery);
};

/**
 * Merges backend columns with frontend-only columns from localStorage.
 * Frontend-only columns are columns that exist in localStorage but not in the backend response.
 * This handles the hybrid approach where users can add columns in the UI before saving to backend.
 *
 * @param backendColumns - Column definitions from the backend API
 * @param storedConfig - Column configuration from localStorage
 * @param frontendColumnConfig - Configuration for creating frontend-only columns
 * @returns Merged and ordered column definitions
 */
export const mergeBackendAndFrontendColumns = (
  backendColumns: ColDef[],
  storedConfig: ColumnOrderingVisibilityType[] | null,
  frontendColumnConfig: FrontendColumnConfig,
): ColDef[] => {
  if (!storedConfig || storedConfig.length === 0) {
    return backendColumns;
  }

  const { datasetId, handleSuccessfulUpdate, tableRef } = frontendColumnConfig;

  const storedColIds = storedConfig.map((c) => c.colId);
  const backendColIds = backendColumns.map((col) => col.field).filter(Boolean) as string[];

  // Find columns that exist in localStorage but not in backend (frontend-only)
  const frontendOnlyColIds = storedColIds.filter((colId) => !backendColIds.includes(colId));

  // Create ColDefs for frontend-only columns
  const frontendOnlyColDefs: ColDef[] = frontendOnlyColIds
    .map((colId) => {
      const stored = storedConfig.find((c) => c.colId === colId);

      if (!stored) return null;

      return {
        field: colId,
        headerName: stored.columnName || colId,
        editable: true,
        hide: !stored.isVisible,
        initialWidth: stored.width || 150,
        minWidth: 100,
        filter: 'agTextColumnFilter',
        headerComponentParams: {
          metadata: {
            is_editable: true,
            is_hidden: false,
          },
          datasetId,
          options: [],
          handleSuccessfulUpdate,
          tableRef,
          filterType: 'text' as FilterType,
          handleRulesListingSideDrawerOpen: () => {},
          isSelfServe: true,
        },
      } as ColDef;
    })
    .filter(Boolean) as ColDef[];

  // Merge backend + frontend-only columns into a map for O(1) lookup (case-insensitive)
  const allColumnsMap = new Map<string, ColDef>();

  backendColumns.forEach((col) => {
    if (col.field) {
      allColumnsMap.set(col.field.toLowerCase(), col);
    }
  });
  frontendOnlyColDefs.forEach((col) => {
    if (col.field) {
      allColumnsMap.set(col.field.toLowerCase(), col);
    }
  });

  // Build final array in localStorage order (case-insensitive lookup)
  const storedColIdsLower = storedColIds.map((id) => id.toLowerCase());
  const orderedColumns = storedColIdsLower
    .map((colId) => allColumnsMap.get(colId))
    .filter((col): col is ColDef => col !== undefined);

  // Add any backend columns not in localStorage (safety fallback)
  backendColumns.forEach((col) => {
    if (col.field && !storedColIdsLower.includes(col.field.toLowerCase())) {
      orderedColumns.push(col);
    }
  });

  return orderedColumns.length > 0 ? orderedColumns : backendColumns;
};

/**
 * Merges backend items with frontend-only items from localStorage in the correct order.
 * This is a generic utility that works with any item type that has an 'id' field.
 *
 * @param backendItems - Items from the backend API
 * @param frontendOnlyItems - Items that exist only in frontend (from localStorage)
 * @param storedOrder - Array of item IDs in the desired order (from localStorage)
 * @returns Merged and ordered items
 */
export const mergeAndOrderItems = <T extends ItemWithId>(
  backendItems: T[],
  frontendOnlyItems: T[],
  storedOrder: string[],
): T[] => {
  if (storedOrder.length === 0) {
    return backendItems;
  }

  // Case-insensitive matching prevents column reordering when IDs differ in casing
  const allItemsMap = new Map<string, T>();

  backendItems.forEach((item) => allItemsMap.set(item.id.toLowerCase(), item));
  frontendOnlyItems.forEach((item) => allItemsMap.set(item.id.toLowerCase(), item));

  // Build final array in localStorage order (case-insensitive lookup)
  const storedOrderLower = storedOrder.map((id) => id.toLowerCase());
  const orderedItems = storedOrderLower
    .map((id) => allItemsMap.get(id))
    .filter((item): item is T => item !== undefined);

  // Add any backend items not in localStorage (safety fallback)
  backendItems.forEach((item) => {
    if (!storedOrderLower.includes(item.id.toLowerCase())) {
      orderedItems.push(item);
    }
  });

  return orderedItems.length > 0 ? orderedItems : backendItems;
};
