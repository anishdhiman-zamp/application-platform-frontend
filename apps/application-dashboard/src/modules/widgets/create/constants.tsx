import { FC } from 'react';
import { SelectButtonOption } from '@zamp-platform/ui';
import BarLineChartForm from 'modules/widgets/create/components/BarLineChartForm';
import DonutChartForm from 'modules/widgets/create/components/DonutChartForm';
import KpiTagForm from 'modules/widgets/create/components/KpiTagForm';
import { ChartSpecificFormProps, GroupStats } from 'modules/widgets/create/types';
import Image from 'next/image';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from '@/components/filter/filters.constants';
import { DONUT_CHART_ICON } from '@/constants/icons';
import { AGGREGATION_TYPES, WIDGET_TYPES } from '@/types/api/widgets.types';

export const VISUALIZATION_OPTIONS: SelectButtonOption[] = [
  { value: WIDGET_TYPES.BAR_CHART, icon: { type: 'sprite', id: 'bar-chart-10' }, tooltipBody: 'Bar Chart' },
  { value: WIDGET_TYPES.LINE_CHART, icon: { type: 'sprite', id: 'line-chart-up-01' }, tooltipBody: 'Line Chart' },
  {
    value: WIDGET_TYPES.DONUT_CHART,
    icon: { type: 'icon', component: <Image src={DONUT_CHART_ICON} alt='donut chart' width={16} height={16} /> },
    tooltipBody: 'Donut Chart',
  },
  { value: WIDGET_TYPES.KPI, icon: { type: 'sprite', id: 'hash-02' }, tooltipBody: 'KPI Tag' },
];

export const SIZE_OPTIONS: SelectButtonOption[] = [
  {
    value: 'half',
    icon: { type: 'icon', component: <div className='h-[11px] w-2.5 border border-inherit' /> },
    tooltipBody: 'Half',
  },
  {
    value: 'full',
    icon: { type: 'icon', component: <div className='h-2 w-3.5 border border-inherit' /> },
    tooltipBody: 'Full',
  },
];

export const SIZE_OPTIONS_TITLE: SelectButtonOption[] = [
  {
    value: 'half',
    icon: { type: 'icon', component: <div className='h-2.5 w-[9px] border border-inherit' /> },
    tooltipBody: 'Half',
  },
  {
    value: 'full',
    icon: { type: 'icon', component: <div className='h-1.5 w-2.5 border border-inherit' /> },
    tooltipBody: 'Full',
  },
];

export const AGGREGATION_OPTIONS = [
  { value: AGGREGATION_TYPES.SUM, label: 'Sum' },
  { value: AGGREGATION_TYPES.AVG, label: 'Average' },
  { value: AGGREGATION_TYPES.COUNT, label: 'Count' },
  { value: AGGREGATION_TYPES.MIN, label: 'Minimum' },
  { value: AGGREGATION_TYPES.MAX, label: 'Maximum' },
];

export const DEFAULT_FILTER_OPERATORS: Record<FILTER_TYPES, CONDITION_OPERATOR_TYPE> = {
  [FILTER_TYPES.MULTI_SELECT]: CONDITION_OPERATOR_TYPE.IN,
  [FILTER_TYPES.ARRAY_SEARCH]: CONDITION_OPERATOR_TYPE.ARRAY_CONTAINS,
  [FILTER_TYPES.SEARCH]: CONDITION_OPERATOR_TYPE.CONTAINS,
  [FILTER_TYPES.SINGLE_SELECT]: CONDITION_OPERATOR_TYPE.EQUAL,
  [FILTER_TYPES.DATE_RANGE]: CONDITION_OPERATOR_TYPE.IN_BETWEEN,
  [FILTER_TYPES.AMOUNT_RANGE]: CONDITION_OPERATOR_TYPE.EQUAL,
  [FILTER_TYPES.TAGS]: CONDITION_OPERATOR_TYPE.IN,
};

export const CHART_SPECIFIC_FORM_MAP: Record<WIDGET_TYPES, FC<ChartSpecificFormProps> | null> = {
  [WIDGET_TYPES.BAR_CHART]: BarLineChartForm,
  [WIDGET_TYPES.LINE_CHART]: BarLineChartForm,
  [WIDGET_TYPES.DONUT_CHART]: DonutChartForm,
  [WIDGET_TYPES.KPI]: KpiTagForm,
  [WIDGET_TYPES.PIE_CHART]: null,
  [WIDGET_TYPES.TABLE]: null,
  [WIDGET_TYPES.PIVOT_TABLE]: null,
};

export const defaultGroupStats: GroupStats = {
  values: [],
  count: 0,
  sum: 0,
  min: Infinity,
  max: -Infinity,
};

export const NUMBER_COLUMN_TYPES = new Set(['integer', 'float', 'double', 'decimal']);
