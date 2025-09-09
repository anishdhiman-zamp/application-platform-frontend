import { FC, useEffect, useMemo } from 'react';
import { Select, Switch } from '@zamp-platform/ui';
import FieldWrapper from 'modules/widgets/create/components/FieldWrapper';
import { useWidgetCreationContext } from 'modules/widgets/create/context/WidgetCreationContext';
import { BarLineChartFields, ChartSpecificFormProps } from 'modules/widgets/create/types';
import {
  getAggregationOptions,
  getColumnType,
  getMultiSelectColumns,
  getNonDateRangeColumns,
} from 'modules/widgets/create/utils';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { AGGREGATION_TYPES, WIDGET_TYPES } from '@/types/api/widgets.types';

const BarLineChartForm: FC<ChartSpecificFormProps> = ({ handleChartFieldChange, formData, datasetColumns }) => {
  const { setFormData } = useWidgetCreationContext();
  const chartType = formData.visualizationType === WIDGET_TYPES.BAR_CHART ? 'barChart' : 'lineChart';
  const fields = formData.chartSpecificFields[
    chartType as keyof typeof formData.chartSpecificFields
  ] as BarLineChartFields;

  const xAxisOptions = useMemo(
    () => datasetColumns.filter((column) => column.filter_type === FILTER_TYPES.DATE_RANGE),
    [datasetColumns],
  );

  const yAxisOptions = useMemo(() => getNonDateRangeColumns(datasetColumns), [datasetColumns]);

  const groupByOptions = useMemo(
    () => [{ label: 'None', value: '' }, ...getMultiSelectColumns(datasetColumns)],
    [datasetColumns],
  );

  const aggregationOptions = useMemo(
    () => getAggregationOptions(getColumnType(fields?.yAxis?.column_type || '')),
    [fields?.yAxis?.column_type],
  );

  const handleColumnChange = (field: 'xAxis' | 'yAxis' | 'groupBy', value: any) => {
    const selectedColumn = datasetColumns.find((column) => column.value === value);

    handleChartFieldChange(chartType, field, {
      ...fields[field],
      column: value,
      column_type: selectedColumn?.column_type,
      filter_type: selectedColumn?.filter_type,
    });
  };

  const setDefaultData = () => {
    if (
      xAxisOptions?.length > 0 &&
      !fields?.xAxis?.column &&
      yAxisOptions?.length > 0 &&
      !fields?.yAxis?.column &&
      groupByOptions?.length > 0 &&
      !fields?.groupBy?.column
    ) {
      const xAxisValue = xAxisOptions[0].value;
      const yAxisValue = yAxisOptions[0].value;
      const groupByValue = groupByOptions[0].value;
      const selectedXAxisColumn = datasetColumns.find((column) => column.value === xAxisValue);
      const selectedYAxisColumn = datasetColumns.find((column) => column.value === yAxisValue);
      const selectedGroupByColumn = datasetColumns.find((column) => column.value === groupByValue);

      if (!selectedXAxisColumn || !selectedYAxisColumn) {
        return;
      }

      setFormData({
        chartSpecificFields: {
          ...formData.chartSpecificFields,
          [chartType]: {
            ...formData.chartSpecificFields[chartType as keyof typeof formData.chartSpecificFields],
            xAxis: {
              column: selectedXAxisColumn.value,
              column_type: selectedXAxisColumn?.column_type,
              filter_type: selectedXAxisColumn?.filter_type,
            },
            yAxis: {
              column: selectedYAxisColumn.value,
              aggregation:
                getColumnType(selectedYAxisColumn?.column_type || '') === 'number'
                  ? AGGREGATION_TYPES.SUM
                  : AGGREGATION_TYPES.COUNT,
              column_type: selectedYAxisColumn?.column_type,
              filter_type: selectedYAxisColumn?.filter_type,
            },
            groupBy: {
              column: groupByOptions[0].value,
              stacking: false,
              column_type: selectedGroupByColumn?.column_type,
              filter_type: selectedGroupByColumn?.filter_type,
            },
          },
        },
      });
    }
  };

  const handleYAxisChange = (value: string) => {
    const selectedColumn = datasetColumns.find((column) => column.value === value);

    handleChartFieldChange(chartType, 'yAxis', {
      ...fields?.yAxis,
      column: value,
      aggregation:
        getColumnType(selectedColumn?.column_type || '') === 'number' ? AGGREGATION_TYPES.SUM : AGGREGATION_TYPES.COUNT,
      column_type: selectedColumn?.column_type,
      filter_type: selectedColumn?.filter_type,
    });
  };

  useEffect(setDefaultData, [xAxisOptions, groupByOptions, chartType]);

  return (
    <div className='space-y-4'>
      <div>
        <label className='mb-2 block text-sm font-medium'>X axis</label>
        <FieldWrapper>
          <Select
            options={xAxisOptions}
            value={fields?.xAxis?.column || ''}
            onValueChange={(value) => handleColumnChange('xAxis', value)}
            variant='small'
          />
        </FieldWrapper>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium'>Y axis</label>
        <div className='grid grid-cols-2'>
          <FieldWrapper>
            <Select
              options={yAxisOptions}
              value={fields?.yAxis?.column || ''}
              onValueChange={(value) => handleYAxisChange(value as string)}
              controlClassName='rounded-r-none'
              variant='small'
            />
          </FieldWrapper>
          <FieldWrapper>
            <Select
              options={aggregationOptions}
              value={fields?.yAxis?.aggregation || ''}
              onValueChange={(value) =>
                handleChartFieldChange(chartType, 'yAxis', {
                  ...fields?.yAxis,
                  aggregation: value,
                })
              }
              controlClassName='rounded-l-none border-l-0'
              variant='small'
            />
          </FieldWrapper>
        </div>
      </div>

      <div>
        <div className='mb-2 flex items-center justify-between'>
          <label className='text-sm font-medium'>Group by</label>
          {fields?.groupBy?.column && formData.visualizationType === WIDGET_TYPES.BAR_CHART && (
            <div className='flex items-center gap-1.5'>
              <label className='f-12-450 text-gray-900'>Stacking</label>
              <Switch
                checked={fields?.groupBy?.stacking || false}
                onClick={() => {
                  handleChartFieldChange(chartType, 'groupBy', {
                    ...fields?.groupBy,
                    stacking: !fields?.groupBy?.stacking,
                  });
                }}
                size='small'
              />
            </div>
          )}
        </div>
        <div className='space-y-2'>
          <FieldWrapper>
            <Select
              options={groupByOptions}
              value={fields?.groupBy?.column || ''}
              onValueChange={(value) => handleColumnChange('groupBy', value)}
              variant='small'
            />
          </FieldWrapper>
        </div>
      </div>
    </div>
  );
};

export default BarLineChartForm;
