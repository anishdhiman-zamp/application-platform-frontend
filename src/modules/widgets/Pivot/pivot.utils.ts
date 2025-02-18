import { ColDef, RowStyle, ValueFormatterParams } from 'ag-grid-community';
import { PERIODICITY_TYPES } from 'constants/date.constants';
import PivotColGroupHeader from 'modules/widgets/Pivot/components/PivotColGroupHeader';
import PivotColHeader from 'modules/widgets/Pivot/components/PivotColHeader';
import { GROUPING_COL_NAME_PREFIX, NESTING_LEVEL_INFIX, PIVOT_REF } from 'modules/widgets/Pivot/pivot.constants';
import {
  MappingDetails,
  ParentFilters,
  ParentMappingDetail,
  PIVOT_DATA_TYPES,
  PivotColumnMetadata,
} from 'modules/widgets/Pivot/pivot.types';
import { getFormattedDateWithPeriodicity } from 'modules/widgets/widgets.constant';
import { getDateRangeWithPeriodicity } from 'modules/widgets/widgets.utils';
import { WIDGET_TYPES, WidgetDataResponseType, WidgetInstanceType } from 'types/api/widgets.types';
import { MapAny } from 'types/commonTypes';
import { formatCurrencyValue, snakeCaseToSentenceCase } from 'utils/common';

export const backendConfig = {
  styleConfig: {
    rowStyles: [
      // {
      //   conditions: [
      //     { level: 0 }, // Condition for level 0
      //   ],
      //   operator: 'AND', // All conditions must be met
      //   style: { backgroundColor: 'red', color: 'blue' },
      // },
      // {
      //   conditions: [{ level: 1 }], // Condition for level 1
      //   operator: 'AND',
      //   style: { backgroundColor: 'blue' },
      // },
    ],
    cellStyles: [
      // {
      //   field: 'Metric',
      //   conditions: [{ equals: 'Opening Balance' }], // Condition for CARD_BRAND equals 'Visa'
      //   operator: 'AND',
      //   style: { backgroundColor: 'yellow', color: 'white' },
      // },
      // {
      //   field: 'Actual',
      //   conditions: [
      //     { greaterThan: 20 }, // Condition for value greater than 20
      //   ],
      //   operator: 'AND',
      //   style: { backgroundColor: 'yellow', color: 'red' },
      // },
      // {
      //   field: 'SubMetric',
      //   conditions: [{ default: true }], // Default condition
      //   operator: 'AND',
      //   style: { border: '1px solid green' },
      // },
    ],
  },
};

export const evaluateConditions = (conditions: MapAny[], groupingLevel: number, value: string, operator = 'AND') => {
  const results = conditions?.map((condition) => {
    if (condition?.level !== undefined && groupingLevel === condition?.level) {
      return true;
    }
    if (condition?.equals !== undefined && value === condition?.equals) {
      return true;
    }
    if (condition?.greaterThan !== undefined && value > condition?.greaterThan) {
      return true;
    }
    if (condition?.default) {
      return true;
    }
    if (condition?.type === 'dateLessThanToday') {
      const today = new Date().toISOString().split('T')[0];

      return new Date(value).toISOString().split('T')[0] < today;
    }

    return false;
  });

  return operator === 'AND' ? results?.every(Boolean) : results?.some(Boolean);
};

export const getDynamicRowStyle = (rowStyles: MapAny[], groupingLevel: number, value: string): RowStyle => {
  for (const rule of rowStyles) {
    if (evaluateConditions(rule?.conditions, groupingLevel, value, rule?.operator)) {
      return rule?.style;
    }
  }

  return {};
};

export const getDynamicCellStyle = (cellStyles: MapAny[], field: string, groupingLevel: number, value: string) => {
  for (const rule of cellStyles) {
    if (rule?.field === field && evaluateConditions(rule?.conditions, groupingLevel, value, rule?.operator)) {
      return rule?.style;
    }
  }

  return {}; // Default cell style
};

export const parseType = (type: PIVOT_DATA_TYPES, value: any, periodicity: PERIODICITY_TYPES) => {
  switch (type) {
    case PIVOT_DATA_TYPES.DATE:
    case PIVOT_DATA_TYPES.TIMESTAMP: {
      return getFormattedDateWithPeriodicity(value, periodicity);
    }
    case PIVOT_DATA_TYPES.NUMBER:
    case PIVOT_DATA_TYPES.AMOUNT: {
      const number = Number(value);

      return isNaN(number) ? 0 : number;
    }
    case PIVOT_DATA_TYPES.BANK:
    case PIVOT_DATA_TYPES.TAG:
    case PIVOT_DATA_TYPES.COUNTRY:
    case PIVOT_DATA_TYPES.STATUS:
      return value;
    case PIVOT_DATA_TYPES.BOOLEAN:
      return value === 'true' || value === true;
    default:
      return value;
  }
};

export const getGroupingColName = (groupingLevel: number) => {
  return `${GROUPING_COL_NAME_PREFIX}${groupingLevel}`;
};

export const getNestedGroupingColName = (columnName: string, hierarchy: number) => {
  if (hierarchy === -1) {
    return `__${columnName}${NESTING_LEVEL_INFIX}`;
  }

  return `__${columnName}${NESTING_LEVEL_INFIX}${hierarchy}`;
};

// type to represent the column metadata that powers a pivot
// this is used to transform the pivot data into a format that can be used by ag-grid
// extract the column metadata from powering a pivot from the widget instance details
export const getPivotColumns = (
  wInstanceDetails: Extract<WidgetInstanceType, { widget_type: WIDGET_TYPES.PIVOT_TABLE }>,
  wInstanceData: WidgetDataResponseType,
) => {
  const { data_mappings } = wInstanceDetails;
  const pivotColumns: PivotColumnMetadata[] = [];

  // iterate over each mapping in the widget instance details; each mapping is a stack in the stacked pivot
  data_mappings?.mappings?.forEach((mapping, mappingIndex) => {
    const { fields, ref } = mapping;

    const { columns, values } = fields;

    // iterate over each column in the columns array
    // each column is a pivot column
    columns?.forEach((col) => {
      pivotColumns?.push({
        kind: 'pivot',
        name: col.column,
        dataType: col.type as 'string' | 'number' | 'date',
        sourceName: col.column,
        mappingName: ref,
      });
    });

    // iterate over each value in the values array
    // each value is an aggregate column
    values?.forEach((val) => {
      pivotColumns?.push({
        kind: 'aggregate',
        name: val?.column,
        dataType: val?.type as 'string' | 'number' | 'date',
        aggregation: val?.aggregation,
        sourceName: val?.column,
        mappingName: ref,
      });
    });

    // if the mapping has no rows, we create a default row with the mapping name; the mapping name becomes the row group name (eg: Closing Balance)
    const mappingRows = fields?.rows || [
      {
        column: mapping.ref,
        type: 'string',
      },
    ];

    let currentLevel = 0;
    const colNameMapping: Record<
      string,
      {
        name: string;
        heirarchy: number;
        dataType: string;
        hasChildren: boolean;
        sourceName: string;
        mappingName: string;
      }
    > = {};

    // iterate over each row in the rows array
    // we normalize the rows of every mapping to the same format
    mappingRows?.forEach((row) => {
      currentLevel += 1;
      const { column, type } = row;

      // check if the row has hierarchy; if it does, we need to determine the depth of the hierarchy;
      // hirarchy is determined by _LEVEL_<n> suffix and the order of the columns in the row set
      const hasHierarchy = wInstanceData?.result[mappingIndex]?.columns?.find((c) =>
        c.column_name.startsWith(getNestedGroupingColName(column, -1)),
      );

      if (hasHierarchy) {
        const depth = wInstanceData?.result[mappingIndex]?.columns?.filter((c) =>
          c.column_name.startsWith(getNestedGroupingColName(column, -1)),
        )?.length;

        // iterate over each level of the hierarchy
        Array(depth)
          .fill(null)
          .forEach((_, colIndex: number) => {
            const colName = getNestedGroupingColName(column, colIndex + 1);

            colNameMapping[colName] = {
              name: getGroupingColName(currentLevel + colIndex),
              heirarchy: currentLevel + colIndex,
              dataType: type,
              hasChildren: colIndex < depth - 1,
              sourceName: colName,
              mappingName: ref,
            };
          });
        currentLevel += depth - 1;
      } else {
        colNameMapping[column] = {
          name: getGroupingColName(currentLevel),
          heirarchy: currentLevel,
          dataType: type,
          hasChildren: false,
          sourceName: column,
          mappingName: ref,
        };
      }
    });

    Object.entries(colNameMapping).forEach(([, colData]) => {
      pivotColumns.push({
        kind: 'group',
        ...colData,
        dataType: colData?.dataType as 'string' | 'number' | 'date',
        maxHeirarchy: currentLevel,
      });
    });
  });

  return pivotColumns;
};

// transform the pivot data into a format that can be used by ag-grid
export const getPivotData = (
  pivotColumns: PivotColumnMetadata[],
  wInstanceData: WidgetDataResponseType,
  periodicity: PERIODICITY_TYPES,
) => {
  // Array to store transformed rows
  const rows: MapAny[] = [];

  // Process each result set in the widget data
  wInstanceData.result.forEach((resultSet) => {
    const resultRows = resultSet?.data;

    // Transform each row in the result set
    resultRows.forEach((row) => {
      // Create a copy of the row to transform
      const transformedRow = { ...row };

      // Process each field in the row
      Object.entries(row)?.forEach(([key, value]) => {
        // Get the mapping name from the NAME field
        const mappingName = transformedRow[PIVOT_REF];

        // Find matching pivot column based on mapping name and source column
        const pivotColumn = pivotColumns?.find((col) => col?.mappingName === mappingName && col?.sourceName === key);

        if (pivotColumn) {
          // If matching pivot column found, transform the value using its data type
          transformedRow[pivotColumn?.name] = parseType(
            pivotColumn?.dataType as PIVOT_DATA_TYPES,
            value,
            periodicity as PERIODICITY_TYPES,
          );
        } else {
          if (key === PIVOT_REF) {
            // Special handling for REF field - find pivot column by source name
            const transformedColumn = pivotColumns?.find((col) => col?.sourceName === value);

            if (transformedColumn) {
              transformedRow[transformedColumn?.name] = value;
            }
          } else {
            // Keep original key-value pair if no transformation needed
            transformedRow[key] = value;
          }
        }
      });

      // Add transformed row to results
      rows.push(transformedRow);
    });
  });

  return rows;
};

export const getPivotColDefs = (pivotColumns: PivotColumnMetadata[]): ColDef[] => {
  return pivotColumns
    .filter((col, index, self) => self?.findIndex((t) => t?.name === col?.name) === index)
    .map((col) => {
      switch (col.kind) {
        case 'group':
          return {
            field: col?.name,
            rowGroup: true,
            context: col,
            cellStyle: (params) =>
              getDynamicCellStyle(backendConfig.styleConfig.cellStyles, col?.name, params?.node?.level, params?.value),
          };
        case 'pivot':
          return {
            field: col?.name,
            pivot: true,
            headerComponent: PivotColGroupHeader,
            valueFormatter: (params) => formatPivotColGroupHeader(params),
            context: col,
          };
        case 'aggregate': {
          return {
            field: col?.name,
            aggFunc: col?.aggregation,
            valueFormatter: (params) => formatCurrencyValue(params?.value),
            headerComponent: PivotColHeader,
            headerName: snakeCaseToSentenceCase(col?.name),
            cellStyle: (params) =>
              getDynamicCellStyle(
                backendConfig.styleConfig.cellStyles,
                snakeCaseToSentenceCase(col.name),
                params.node?.level,
                params?.value,
              ),
            context: col,
          };
        }
      }
    });
};

export type AGGridPivotNode<T extends AGGridPivotNode<T>> = {
  key?: string | null;
  childrenAfterGroup?: T[] | null;
};
export const flattenChildrenAfterGroup = <T extends AGGridPivotNode<T>>(node: T): T[] => {
  const { childrenAfterGroup } = node;

  if (!childrenAfterGroup) {
    return [];
  }

  return [
    ...childrenAfterGroup,
    ...childrenAfterGroup.map((child) => flattenChildrenAfterGroup(child).flat()).flat(),
  ] as T[];
};

export const shouldAllowExpandingRow = <T extends AGGridPivotNode<T>>(node: T) => {
  const flattenedChildren = flattenChildrenAfterGroup(node);

  // return false if the node has no children
  if (flattenedChildren?.length === 0) {
    return false;
  }

  // return false if the node has all children with key=""
  if (flattenedChildren.every((child) => child?.key === '' || child?.key === null || child?.key === undefined)) {
    return false;
  }

  return true;
};

const formatPivotColGroupHeader = (params: ValueFormatterParams) => {
  const constructorName = params.value?.constructor?.name;

  switch (constructorName) {
    case 'Date': {
      const formatted = params?.value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      return formatted;
    }
    default:
      return params?.value;
  }
};

export const formatDateToISO = (dateStr: string): string => {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();

  return `${day}-${month}-${year}T00:00:00Z`;
};

export const columnNameFromTagContext = (context?: string) => {
  const match = context?.match(/^__(.*?)_/);

  return match ? match[1] : null;
};

export const getTagDetails = (filteredRowData: Record<string, any>, currentNodeKey: string) => {
  const tagRowContext = Object.keys(filteredRowData)
    .filter((key) => filteredRowData[key] === currentNodeKey)
    ?.find((key) => key.startsWith('__'));

  return {
    isTag: !!tagRowContext && tagRowContext.startsWith('__'),
    tagColumnName: columnNameFromTagContext(tagRowContext),
  };
};

export const getAllParentKeys = (node: any, filteredRowData: Record<string, any>): MapAny[] => {
  const parentKeys: MapAny[] = [];

  while (node?.parent) {
    if (node?.parent?.key && node?.parent?.rowGroupColumn?.getColDef()?.context?.sourceName) {
      parentKeys.push({
        key: node?.parent?.key,
        tag: getTagDetails(filteredRowData, node?.parent?.key).isTag,
        context: getTagDetails(filteredRowData, node?.parent?.key).isTag
          ? getTagDetails(filteredRowData, node?.parent?.key).tagColumnName
          : node?.parent?.rowGroupColumn?.getColDef()?.context?.sourceName,
      });
    }
    node = node.parent;
  }

  return parentKeys;
};

export const getMappingDetails = (mappingStructure: any, pivotRef: string, key: string): MappingDetails | null => {
  return mappingStructure?.[pivotRef]?.[key] || null;
};

export const generateParentFilters = (
  parentMappingDetails: ParentMappingDetail[],
  currentNodeKey: string,
  isTag: boolean,
): ParentFilters => {
  return parentMappingDetails.reduce((acc: ParentFilters, { key, mappingDetails, tag }, index, array) => {
    const allKeys = tag
      ? isTag
        ? [...array.slice(0, index + 1).map(({ key }) => key), currentNodeKey].join('.')
        : [...array.slice(0, index + 1).map(({ key }) => key)].join('.')
      : key;

    if (mappingDetails?.column) {
      acc[mappingDetails.column] = {
        filterType: mappingDetails.drilldown_filter_type,
        type: mappingDetails.drilldown_filter_operator,
        values: [allKeys],
      };
    }

    return acc;
  }, {});
};

export const getColumnFilterWithPeriodicity = (
  columnMappingDetails: MappingDetails | null,
  periodicity: PERIODICITY_TYPES,
  pivotKey: string,
  currentWidgetSelectedFilter: Record<string, any>,
): ParentFilters => {
  if (!columnMappingDetails?.column) return {};

  const [dateFrom, dateTo] = getDateRangeWithPeriodicity(
    periodicity,
    pivotKey,
    currentWidgetSelectedFilter[columnMappingDetails.column]?.dateFrom,
    currentWidgetSelectedFilter[columnMappingDetails.column]?.dateTo,
  );

  return {
    [columnMappingDetails.column]: {
      filterType: columnMappingDetails.drilldown_filter_type,
      type: columnMappingDetails.drilldown_filter_operator,
      dateFrom,
      dateTo,
    },
  };
};

export const buildTagFilter = (
  isLeaf: boolean,
  isTopNode: boolean,
  rowMappingDetails: MappingDetails | null,
  currentNodeKey: string,
  parentFilters: ParentFilters,
  columnFilterWithPeriodicity: ParentFilters,
): ParentFilters => {
  return isTopNode
    ? {
        [rowMappingDetails?.column ?? '']: {
          filterType: rowMappingDetails?.drilldown_filter_type,
          type: rowMappingDetails?.drilldown_filter_operator,
          values: [currentNodeKey],
        },
        ...columnFilterWithPeriodicity,
      }
    : {
        ...parentFilters,
        ...columnFilterWithPeriodicity,
      };
};
