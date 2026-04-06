import { CSS_VARS } from '@zamp-platform/ui';
import { CellSelectionOptions, themeQuartz } from 'ag-grid-community';
import { AggregationFunctionType, LogicalOperatorType } from 'types/components/table.type';
import { DisplayOptionItemProps } from 'components/common/table/DisplayOptions/DisplayOptionItem';
import { DISPLAY_OPTIONS } from 'components/common/table/table.types';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

export const myTheme = themeQuartz.withParams({
  fontFamily: { googleFont: 'Inter' },
  headerFontSize: 12,
  headerFontWeight: 600,
  rowHeight: 32,
  rowBorder: { style: 'solid', width: 1, color: CSS_VARS.GRAY_100 },
  columnBorder: { style: 'solid', width: 1, color: CSS_VARS.GRAY_100 },
  headerHeight: 48,
  headerRowBorder: { style: 'solid', width: 1, color: CSS_VARS.GRAY_400 },
  headerColumnBorder: { style: 'solid', width: 1, color: CSS_VARS.GRAY_100 },
  headerBackgroundColor: CSS_VARS.BG_WHITE,
  headerTextColor: CSS_VARS.GRAY_1000,
  backgroundColor: CSS_VARS.BG_WHITE,
  foregroundColor: CSS_VARS.GRAY_1000,
  borderColor: CSS_VARS.GRAY_100,
  wrapperBorderRadius: 0,
  iconSize: 12,
  rowHoverColor: CSS_VARS.BG_GRAY_1,
  oddRowBackgroundColor: CSS_VARS.BG_WHITE,
  checkboxBorderRadius: 2,
  checkboxCheckedBackgroundColor: CSS_VARS.GRAY_1000,
  checkboxCheckedBorderColor: CSS_VARS.GRAY_600,
  checkboxCheckedShapeColor: CSS_VARS.BG_WHITE,
  checkboxUncheckedBackgroundColor: CSS_VARS.BG_WHITE,
  checkboxUncheckedBorderColor: CSS_VARS.GRAY_400,
  sideBarBackgroundColor: CSS_VARS.BG_WHITE,
  headerColumnResizeHandleColor: CSS_VARS.BG_WHITE,
  menuBorder: { style: 'solid', width: 1, color: CSS_VARS.GRAY_500 },
  menuBackgroundColor: CSS_VARS.BG_WHITE,
  menuTextColor: CSS_VARS.GRAY_1000,
  wrapperBorder: { width: 1, style: 'solid', color: CSS_VARS.GRAY_400 },
  rowLoadingSkeletonEffectColor: CSS_VARS.GRAY_50,
  selectCellBorder: { style: 'solid', width: 1.5, color: CSS_VARS.BLUE_700 },
  rangeSelectionBorderColor: CSS_VARS.BLUE_700,
  cellEditingBorder: { style: 'solid', width: 1.5, color: CSS_VARS.BLUE_700 },
  cellBatchEditBackgroundColor: CSS_VARS.BG_WHITE,
  menuShadow: 'var(--MENU_SHADOW)',
});

export const myThemeWithProcess = myTheme.withParams({
  fontFamily: { googleFont: 'Inter' },
  headerFontSize: 12,
  headerFontWeight: 600,
  rowHeight: 44,
  rowBorder: { style: 'solid', width: 0, color: CSS_VARS.GRAY_100 },
  columnBorder: { style: 'solid', width: 0, color: CSS_VARS.GRAY_100 },
  headerHeight: 31,
  headerRowBorder: { style: 'solid', width: 1, color: CSS_VARS.GRAY_400 },
  headerColumnBorder: { style: 'solid', width: 0, color: CSS_VARS.GRAY_100 },
  headerBackgroundColor: CSS_VARS.BG_WHITE,
  wrapperBorderRadius: 0,
  iconSize: 12,
  rowHoverColor: CSS_VARS.BG_GRAY_2,
  headerColumnResizeHandleColor: CSS_VARS.BG_WHITE,
  menuBorder: { style: 'solid', width: 1, color: CSS_VARS.GRAY_500 },
  menuBackgroundColor: CSS_VARS.BG_WHITE,
  wrapperBorder: { width: 1, style: 'solid', color: CSS_VARS.GRAY_400 },
  rowLoadingSkeletonEffectColor: CSS_VARS.GRAY_50,
  menuShadow: 'var(--MENU_SHADOW)',
});

export const myIcons = {
  groupExpanded: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 4.5L6 7.5L9 4.5" fill="currentColor"/>
</svg>
`,
  groupContracted: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.5 9L7.5 6L4.5 3" fill="currentColor"/>
</svg>
`,
  sortDescending: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 2V10M6 10L9 7M6 10L3 7" stroke="var(--BLUE_700)" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  sortAscending: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 20V4M12 4L6 10M12 4L18 10" stroke="var(--BLUE_700)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
  headerTextColor: CSS_VARS.GRAY_700,
  headerHeight: 36,
  headerRowBorder: { style: 'solid', width: 0.5, color: CSS_VARS.GRAY_200 },
  headerColumnBorder: { width: 0 },
  headerColumnResizeHandleWidth: 0,
  headerBackgroundColor: CSS_VARS.BG_WHITE,
  backgroundColor: CSS_VARS.BG_WHITE,
  foregroundColor: CSS_VARS.GRAY_1000,
  rowHeight: 60,
  rowBorder: { style: 'solid', width: 0.5, color: CSS_VARS.GRAY_200 },
  rowHoverColor: CSS_VARS.BG_GRAY_1,
  columnBorder: { width: 0 },
  cellHorizontalPadding: 24,
  rowLoadingSkeletonEffectColor: CSS_VARS.GRAY_50,
};

export const DATA_TABLE_CONFIG = {
  filter: undefined,
  headerClass: '',
  cellClass: 'f-12-400 cursor-pointer content-center',
  flex: 1,
};

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
    mode: 'fill',
    direction: 'y',
  },
};

export const DisplayOptionsList: DisplayOptionItemProps[] = [
  {
    id: DISPLAY_OPTIONS.COLUMNS,
    label: 'Columns',
    iconId: 'columns-03',
  },
  {
    id: DISPLAY_OPTIONS.GROUP_BY,
    label: 'Group By',
    iconId: 'left-indent-02',
  },
  // TODO: Add currency option
  // {
  //   id: DISPLAY_OPTIONS.CURRENCY,
  //   label: 'Currency',
  //   iconId: 'coins-swap-02',
  // },
];

export const enum TABLE_COPIES {
  DEFAULT = 'Default',
}

export const URL_PREFIXES = ['http://', 'https://', 'www.'];
