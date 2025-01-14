import { themeQuartz } from 'ag-grid-community';

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
});

export const dataTableTheme = themeQuartz.withParams({
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
});

export const DATA_TABLE_CONFIG = { filter: undefined, headerClass: '', cellClass: '' };
