export enum WIDGET_TYPE {
  BAR_CHART = 'bar_chart',
  LINE_CHART = 'line_chart',
  PIE_CHART = 'pie_chart',
  TABLE = 'table',
}

export enum SCREEN_BREAKPOINTS_NAMES {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  DEFAULT = 'default',
}

export const SCREEN_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };

export const ROW_HEIGHT = 53; // Height of a single row in px
export const WIDGETS_LAYOUT_MARGIN = [20, 20]; // Space between components (20px)
