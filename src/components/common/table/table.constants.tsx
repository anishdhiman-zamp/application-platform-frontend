import { CellSelectionOptions, themeQuartz } from 'ag-grid-community';
import { AggregationFunctionType, LogicalOperatorType } from 'types/components/table.type';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

export const myTheme = themeQuartz.withParams({
  fontFamily: { googleFont: 'Inter' },
  headerFontSize: 12,
  headerFontWeight: 600,
  rowHeight: 32,
  rowBorder: { style: 'solid', width: 1, color: '#F2F2F2' },
  columnBorder: { style: 'solid', width: 1, color: '#F2F2F2' },
  headerHeight: 48,
  headerRowBorder: { style: 'solid', width: 1, color: '#F2F2F2' },
  headerColumnBorder: { style: 'solid', width: 1, color: '#F2F2F2' },
  headerBackgroundColor: '#FFF',
  wrapperBorderRadius: 0,
  iconSize: 12,
  rowHoverColor: '#FBFBFB',
  checkboxBorderRadius: 2,
  checkboxCheckedBackgroundColor: '#171717',
  checkboxCheckedBorderColor: '#A8A8A8',
  checkboxCheckedShapeColor: '#FBFBFE',
  checkboxUncheckedBackgroundColor: '#FBFBFE',
  checkboxUncheckedBorderColor: '#EBEBEB',
  sideBarBackgroundColor: '#FFFFFF',
  headerColumnResizeHandleColor: '#FFFFFF',
});

export const myIcons = {
  groupExpanded: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 4.5L6 7.5L9 4.5" fill="#8F8F8F"/>
</svg>
`,
  groupContracted: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.5 9L7.5 6L4.5 3" fill="#8F8F8F"/>
</svg>
`,
  sortDescending: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 2V10M6 10L9 7M6 10L3 7" stroke="#2546F5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  sortAscending: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 20V4M12 4L6 10M12 4L18 10" stroke="#2546F5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
};

export const PAGE_SIZE = 100;

export const sideBarConfig = {
  toolPanels: [
    {
      id: 'columns',
      labelDefault: 'Columns',
      labelKey: 'columns',
      iconKey: 'columns',
      toolPanel: 'agColumnsToolPanel',
      toolPanelParams: {
        suppressPivotMode: true, // This removes the "Pivot Mode" toggle
      },
    },
  ],
};

export const DATA_TABLE_THEME_PARAMS = {
  fontFamily: { googleFont: 'Inter' },
  wrapperBorderRadius: 0,
  wrapperBorder: { width: 0 },
  headerFontSize: 11,
  headerFontWeight: 400,
  headerTextColor: '#8F8F8F',
  headerHeight: 36,
  headerRowBorder: { style: 'solid', width: 0.5, color: '#EBEBEB' },
  headerColumnBorder: { width: 0 },
  headerColumnResizeHandleWidth: 0,
  headerBackgroundColor: '#FFFFFF',
  rowHeight: 60,
  rowBorder: { style: 'solid', width: 0.5, color: '#EBEBEB' },
  rowHoverColor: '#FBFBFB',
  columnBorder: { width: 0 },
  cellHorizontalPadding: 24,
};

export const DATA_TABLE_CONFIG = { filter: undefined, headerClass: '', cellClass: 'cursor-pointer' };

export const OperatorMap: Record<string, CONDITION_OPERATOR_TYPE> = {
  contains: CONDITION_OPERATOR_TYPE.CONTAINS,
  notContains: CONDITION_OPERATOR_TYPE.NOT_CONTAINS,
  equals: CONDITION_OPERATOR_TYPE.EQUAL,
  notEqual: CONDITION_OPERATOR_TYPE.NOT_EQUAL,
  startsWith: CONDITION_OPERATOR_TYPE.STARTS_WITH,
  endsWith: CONDITION_OPERATOR_TYPE.ENDS_WITH,
};

export const LogicalOperatorMap: Record<string, LogicalOperatorType> = {
  AND: LogicalOperatorType.OperatorLogicalAnd,
  OR: LogicalOperatorType.OperatorLogicalOr,
};

export const AggregationFunctionMap: Record<string, AggregationFunctionType> = {
  sum: AggregationFunctionType.AggregationFunctionSum,
  avg: AggregationFunctionType.AggregationFunctionAvg,
  min: AggregationFunctionType.AggregationFunctionMin,
  max: AggregationFunctionType.AggregationFunctionMax,
  count: AggregationFunctionType.AggregationFunctionCount,
};

export const ArrayFilters = [
  CONDITION_OPERATOR_TYPE.IN,
  CONDITION_OPERATOR_TYPE.NOT_IN,
  CONDITION_OPERATOR_TYPE.NOT_CONTAINS,
  CONDITION_OPERATOR_TYPE.IN_BETWEEN,
  CONDITION_OPERATOR_TYPE.ARRAY_CONTAINS,
  CONDITION_OPERATOR_TYPE.CONTAINS,
];

export const cellSelectionConfig: CellSelectionOptions<any> = {
  handle: {
    mode: 'range',
  },
};
