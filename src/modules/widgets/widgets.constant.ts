import { AgCartesianAxisOptions, time } from 'ag-charts-community';
import { CHART_PALETTE_COLORS, COLORS } from 'constants/colors';
import { DATE_FORMATS } from 'constants/date.constants';
import { format } from 'date-fns';
import { formatNumber, isValidDate } from 'utils/common';

export enum WIDGET_TYPES {
  BAR_CHART = 'bar_chart',
  LINE_CHART = 'line_chart',
  PIE_CHART = 'pie_chart',
  KPI = 'kpi',
  TABLE = 'table',
}

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

export enum WidgetTypes {
  BAR_CHART = 'bar_chart',
  LINE_CHART = 'line_chart',
  AREA_CHART = 'area_chart',
  PIE_CHART = 'pie_chart',
  DONUT_CHART = 'donut_chart',
  KPI = 'kpi',
  TABLE = 'table',
  PIVOT_TABLE = 'pivot_table',
}

export const AG_CHART_TYPES = {
  [WidgetTypes.BAR_CHART]: 'bar',
  [WidgetTypes.LINE_CHART]: 'line',
  [WidgetTypes.AREA_CHART]: 'area',
  [WidgetTypes.PIE_CHART]: 'donut',
  [WidgetTypes.DONUT_CHART]: 'donut',
};

export const CHART_CATEGORY_AXES: AgCartesianAxisOptions = {
  type: 'category' as const,
  position: 'bottom',
  label: {
    minSpacing: 20,
    autoRotate: true,
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
  nice: true,
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

export const DONUT_CHART_SERIES_CONFIG = {
  type: AG_CHART_TYPES[WidgetTypes.PIE_CHART],
  innerRadiusRatio: 0.75,
  sectorSpacing: 5,
  cornerRadius: 2,
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
