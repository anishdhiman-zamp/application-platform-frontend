import { AgCartesianAxisOptions, time } from 'ag-charts-community';
import { CHART_PALETTE_COLORS, COLORS } from 'constants/colors';
import { DATE_FORMATS } from 'constants/date.constants';
import { format } from 'date-fns';
import { WIDGET_TYPES } from 'types/api/widgets.types';
import { formatNumber, isValidDate } from 'utils/common';

export enum SCREEN_BREAKPOINTS_NAMES {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  DEFAULT = 'default',
}

export const SCREEN_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };

export const ROW_HEIGHT = 56; // Height of a single row in px
export const WIDGETS_LAYOUT_MARGIN = [20, 20]; // Space between components (20px)

export enum WidgetDataValueType {
  STRING = 'STRING',
  DECIMAL = 'DECIMAL',
  NUMBER = 'NUMBER',
  BIGINT = 'BIGINT',
  DOUBLE = 'DOUBLE',
  BOOLEAN = 'BOOLEAN',
  FLOAT = 'FLOAT',
  SMALLINT = 'SMALLINT',
  TINYINT = 'TINYINT',
  INT = 'INT',
  DATE = 'DATE',
  TIMESTAMP = 'TIMESTAMP',
  TIME = 'TIME',
  DATETIME = 'DATETIME',
}

export const AG_CHART_TYPES = {
  [WIDGET_TYPES.BAR_CHART]: 'bar',
  [WIDGET_TYPES.LINE_CHART]: 'line',
  [WIDGET_TYPES.PIE_CHART]: 'pie',
  [WIDGET_TYPES.DONUT_CHART]: 'donut',
};

export const CHART_CATEGORY_AXES: AgCartesianAxisOptions = {
  type: 'category' as const,
  position: 'bottom',
  label: {
    minSpacing: 20,
    autoRotate: false,
    formatter: function (params) {
      if (isValidDate(params.value)) {
        return format(new Date(params.value), DATE_FORMATS.ddMMMyyyy);
      }

      return params.value;
    },
  },
  tick: {
    size: 10, // Changed from length to size
    width: 0.75,
  },
  line: {
    width: 1,
    stroke: COLORS.GRAY_400,
  },
};

export const CHART_NUMBER_AXES: AgCartesianAxisOptions = {
  type: 'number' as const,
  position: 'right',
  label: {
    formatter: ({ value }) => {
      return formatNumber(value, 1, false);
    },
  },
};

export const AG_CHART_TIME_AXES: AgCartesianAxisOptions = {
  type: 'time',
  nice: false,
  position: 'bottom',
  interval: { step: time.month },
  label: {
    format: '%d %b',
  },
  tick: {
    size: 10, // Changed from length to size
    width: 0.75,
  },
  line: {
    width: 1,
    stroke: COLORS.GRAY_400,
  },
};

export const AG_CHART_AXES: AgCartesianAxisOptions[] = [CHART_CATEGORY_AXES, CHART_NUMBER_AXES, AG_CHART_TIME_AXES];

export const AG_CHART_LEGEND_CONFIG = {
  enabled: true,
  item: {
    showSeriesStroke: false,
    paddingX: 16,
    marker: {
      size: 8,
      shape: 'square' as const,
      strokeWidth: 0,
      padding: 6,
    },
    label: {
      fontFamily: 'Inter',
      fontWeight: 450,
      fontSize: 12,
      color: COLORS.GRAY_900,
    },
  },
};

export const getDonutChartSeriesConfig = (dataLength: number) => {
  return {
    innerRadiusRatio: 0.75,
    sectorSpacing: dataLength > 1 ? 5 : 0,
    cornerRadius: dataLength > 1 ? 2 : 0,
    label: {
      color: COLORS.GRAY_950,
      fontSize: 26,
    },
    calloutLine: {
      length: 18,
      strokeWidth: 2,
      colors: [COLORS.GRAY_400],
    },
    fills: CHART_PALETTE_COLORS,
    innerCircle: {
      fill: COLORS.WHITE,
    },
  };
};
