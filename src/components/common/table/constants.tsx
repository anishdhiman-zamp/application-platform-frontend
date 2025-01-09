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
