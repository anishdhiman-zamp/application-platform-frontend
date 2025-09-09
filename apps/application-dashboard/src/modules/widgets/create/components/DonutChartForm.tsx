import { FC, useEffect, useMemo } from 'react';
import { Select } from '@zamp-platform/ui';
import FieldWrapper from 'modules/widgets/create/components/FieldWrapper';
import { useWidgetCreationContext } from 'modules/widgets/create/context/WidgetCreationContext';
import { ChartSpecificFormProps, DonutChartFields } from 'modules/widgets/create/types';
import {
  getAggregationOptions,
  getColumnType,
  getMultiSelectColumns,
  getNonDateRangeColumns,
} from 'modules/widgets/create/utils';
import { AGGREGATION_TYPES } from '@/types/api/widgets.types';

const DonutChartForm: FC<ChartSpecificFormProps> = ({ handleChartFieldChange, formData, datasetColumns }) => {
  const { setFormData } = useWidgetCreationContext();

  const fields = formData.chartSpecificFields.donutChart as DonutChartFields;

  const fieldOptions = useMemo(() => getNonDateRangeColumns(datasetColumns), [datasetColumns]);
  const groupByOptions = useMemo(() => getMultiSelectColumns(datasetColumns), [datasetColumns]);

  const aggregationOptions = useMemo(
    () => getAggregationOptions(getColumnType(fields?.field?.column_type || '')),
    [fields?.field?.column_type],
  );

  const handleColumnChange = (field: 'field' | 'groupBy', value: string) => {
    const selectedColumn = datasetColumns.find((column) => column.value === value);

    handleChartFieldChange('donutChart', field, {
      ...fields[field],
      column: value,
      column_type: selectedColumn?.column_type,
      filter_type: selectedColumn?.filter_type,
    });
  };

  const handleFieldChange = (value: string) => {
    const selectedColumn = datasetColumns.find((column) => column.value === value);

    handleChartFieldChange('donutChart', 'field', {
      ...fields?.field,
      column: value,
      aggregation:
        getColumnType(selectedColumn?.column_type || '') === 'number' ? AGGREGATION_TYPES.SUM : AGGREGATION_TYPES.COUNT,
      column_type: selectedColumn?.column_type,
      filter_type: selectedColumn?.filter_type,
    });
  };

  const setDefaultData = () => {
    if (fieldOptions?.length > 0 && !fields?.field?.column && groupByOptions?.length > 0 && !fields?.groupBy?.column) {
      const fieldValue = fieldOptions[0].value;
      const groupByValue = groupByOptions[0].value;
      const selectedFieldColumn = datasetColumns.find((column) => column.value === fieldValue);
      const selectedGroupByColumn = datasetColumns.find((column) => column.value === groupByValue);

      if (!selectedFieldColumn || !selectedGroupByColumn) {
        return;
      }

      setFormData({
        chartSpecificFields: {
          ...formData.chartSpecificFields,
          donutChart: {
            ...formData.chartSpecificFields.donutChart,
            field: {
              column: fieldValue,
              aggregation:
                getColumnType(selectedFieldColumn?.column_type || '') === 'number'
                  ? AGGREGATION_TYPES.SUM
                  : AGGREGATION_TYPES.COUNT,
              column_type: selectedFieldColumn?.column_type,
              filter_type: selectedFieldColumn?.filter_type,
            },
            groupBy: {
              column: groupByValue,
              column_type: selectedGroupByColumn?.column_type,
              filter_type: selectedGroupByColumn?.filter_type,
            },
          },
        },
      });
    }
  };

  useEffect(() => {
    setDefaultData();
  }, [fieldOptions, groupByOptions]);

  return (
    <div className='space-y-4'>
      <div>
        <label className='mb-2 block text-sm font-medium'>Field</label>
        <div className='grid grid-cols-2'>
          <FieldWrapper>
            <Select
              options={fieldOptions}
              value={fields?.field?.column || ''}
              onValueChange={(value) => handleFieldChange(value as string)}
              variant='small'
              controlClassName='rounded-r-none'
            />
          </FieldWrapper>
          <FieldWrapper>
            <Select
              options={aggregationOptions}
              value={fields?.field?.aggregation || ''}
              onValueChange={(value) =>
                handleChartFieldChange('donutChart', 'field', {
                  ...fields?.field,
                  aggregation: value,
                })
              }
              variant='small'
              controlClassName='rounded-l-none border-l-0'
            />
          </FieldWrapper>
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium'>Group by</label>
        <FieldWrapper>
          <Select
            options={groupByOptions}
            value={fields?.groupBy?.column || ''}
            onValueChange={(value) => handleColumnChange('groupBy', value as string)}
            variant='small'
          />
        </FieldWrapper>
      </div>
    </div>
  );
};

export default DonutChartForm;
