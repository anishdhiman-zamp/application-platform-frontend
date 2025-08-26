import { FC, useEffect, useMemo } from 'react';
import { Select } from '@zamp-platform/ui';
import FieldWrapper from 'modules/widgets/create/components/FieldWrapper';
import { useWidgetCreationContext } from 'modules/widgets/create/context/WidgetCreationContext';
import { ChartSpecificFormProps, KpiTagFields } from 'modules/widgets/create/types';
import { getAggregationOptions, getColumnType, getNonDateRangeColumns } from 'modules/widgets/create/utils';
import { AGGREGATION_TYPES } from '@/types/api/widgets.types';

const KpiTagForm: FC<ChartSpecificFormProps> = ({ handleChartFieldChange, formData, datasetColumns }) => {
  const { setFormData } = useWidgetCreationContext();

  const fields = formData.chartSpecificFields.kpiTag as KpiTagFields;

  const metricFieldOptions = useMemo(() => getNonDateRangeColumns(datasetColumns), [datasetColumns]);

  const aggregationOptions = useMemo(
    () => getAggregationOptions(getColumnType(fields?.metricField?.column_type || '')),
    [fields?.metricField?.column_type],
  );

  const handleColumnChange = (value: any) => {
    const selectedColumn = datasetColumns.find((column) => column.value === value);

    handleChartFieldChange('kpiTag', 'metricField', {
      ...fields?.metricField,
      column: value,
      column_type: selectedColumn?.column_type,
      filter_type: selectedColumn?.filter_type,
      aggregation:
        getColumnType(selectedColumn?.column_type || '') === 'number' ? AGGREGATION_TYPES.SUM : AGGREGATION_TYPES.COUNT,
    });
  };

  const handleAggregationChange = (value: any) => {
    handleChartFieldChange('kpiTag', 'metricField', { ...fields?.metricField, aggregation: value as string });
  };

  const setDefaultData = () => {
    if (metricFieldOptions?.length > 0 && !fields?.metricField?.column) {
      const metricFieldValue = metricFieldOptions[0].value;
      const selectedMetricFieldColumn = datasetColumns.find((column) => column.value === metricFieldValue);

      if (!selectedMetricFieldColumn) return;

      setFormData({
        chartSpecificFields: {
          ...formData.chartSpecificFields,
          kpiTag: {
            ...formData.chartSpecificFields.kpiTag,
            metricField: {
              column: metricFieldValue,
              aggregation:
                getColumnType(selectedMetricFieldColumn?.column_type || '') === 'number'
                  ? AGGREGATION_TYPES.SUM
                  : AGGREGATION_TYPES.COUNT,
              column_type: selectedMetricFieldColumn?.column_type,
              filter_type: selectedMetricFieldColumn?.filter_type,
            },
          },
        },
      });
    }
  };

  useEffect(() => {
    setDefaultData();
  }, [metricFieldOptions]);

  return (
    <div className='space-y-4'>
      <div>
        <label className='mb-2 block text-sm font-medium'>Metric field</label>
        <div className='grid grid-cols-2'>
          <FieldWrapper>
            <Select
              options={metricFieldOptions}
              value={fields?.metricField?.column || ''}
              onValueChange={handleColumnChange}
              variant='small'
              controlClassName='rounded-r-none'
            />
          </FieldWrapper>
          <FieldWrapper>
            <Select
              options={aggregationOptions}
              value={fields?.metricField?.aggregation || ''}
              onValueChange={handleAggregationChange}
              variant='small'
              controlClassName='rounded-l-none border-l-0'
            />
          </FieldWrapper>
        </div>
      </div>
    </div>
  );
};

export default KpiTagForm;
