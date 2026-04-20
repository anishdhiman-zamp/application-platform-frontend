'use client';

import { FC, useEffect, useMemo, useRef } from 'react';
import { Button, Input, Select, type SelectOption } from '@zamp-platform/ui';
import { SelectButton, TooltipV2 } from '@zamp-platform/ui';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { cn } from '@zamp-platform/ui/utils';
import { useGetDatasetFilterConfigQuery, useGetDatasetListingQuery } from 'apis/dataset';
import { CHART_SPECIFIC_FORM_MAP, SIZE_OPTIONS, VISUALIZATION_OPTIONS } from 'modules/widgets/create/constants';
import { defaultFormData, useWidgetCreationContext } from 'modules/widgets/create/context/WidgetCreationContext';
import { setupColumnsAndFilters } from 'modules/widgets/create/utils';
import { WIDGET_TYPES } from 'types/api/widgets.types';
import { filtersContextActions, useFiltersContextStore } from '@/components/filter/filters.context';
import { formatDrilldownFilters } from '@/modules/data/data.utils';
import useSubmitWidgetForm from '@/modules/widgets/create/hooks/useSubmitWidgetForm';
import { defaultFnType, SIDE_OPTIONS } from '@/types/commonTypes';
import { checkIsObjectEmpty } from '@/utils/common';
import { PAGE_SIZE } from 'components/common/table/table.constants';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';

interface WidgetCreationFormProps {
  handleClose: defaultFnType;
}

const WidgetCreationForm: FC<WidgetCreationFormProps> = ({ handleClose }) => {
  const hasEffectRun = useRef(false);

  const { formData, setFormData, datasetColumns, setDatasetColumns, saveToLocalStorage, preSelectedFilters } =
    useWidgetCreationContext();

  const {
    dispatch,
    state: { filtersConfig, selectedFilters },
  } = useFiltersContextStore();

  const { handleSubmit, isSubmitting } = useSubmitWidgetForm(handleClose);

  const { data: datasetListing } = useGetDatasetListingQuery({
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const { data: datasetFilterConfigData, isFetching: isDatasetFilterConfigFetching } = useGetDatasetFilterConfigQuery(
    { datasetId: formData.datasetId },
    { skip: !formData.datasetId },
  );

  const datasetOptions: SelectOption[] = useMemo(() => {
    return (
      datasetListing?.datasets
        ?.filter((dataset) => !dataset.metadata?.is_hidden)
        .map((dataset) => ({
          label: dataset.title,
          value: dataset.id,
          icon: {
            type: 'sprite',
            category: ICON_SPRITE_TYPES.FINANCE_AND_ECOMMERCE,
            id: 'coins-stacked-04',
          },
        })) ?? []
    );
  }, [datasetListing]);

  const handleInputChange = (field: string, value: any) => {
    setFormData({ [field]: value });
  };

  const handleChartFieldChange = (chartType: string, field: string, value: any) => {
    setFormData({
      chartSpecificFields: {
        ...formData.chartSpecificFields,
        [chartType]: {
          ...formData.chartSpecificFields[chartType as keyof typeof formData.chartSpecificFields],
          [field]: value,
        },
      },
    });
  };

  const handleDatasetChange = (value: string) => {
    setFormData({ datasetId: value, chartSpecificFields: {} });
    setDatasetColumns([]);
    dispatch({
      type: filtersContextActions.RESET_ALL_FILTERS,
    });
  };

  const renderChartSpecificFields = () => {
    const ChartSpecificForm = CHART_SPECIFIC_FORM_MAP[formData.visualizationType];

    if (!ChartSpecificForm) return null;

    return (
      <ChartSpecificForm
        handleChartFieldChange={handleChartFieldChange}
        formData={formData}
        datasetColumns={datasetColumns}
      />
    );
  };

  useEffect(() => {
    setupColumnsAndFilters({ datasetFilterConfigData: datasetFilterConfigData?.data, dispatch, setDatasetColumns });
  }, [datasetFilterConfigData, dispatch, setDatasetColumns]);

  useEffect(() => {
    if (JSON.stringify(formData) !== JSON.stringify(defaultFormData)) {
      saveToLocalStorage();
    }
  }, [formData, saveToLocalStorage]);

  useEffect(() => {
    if (preSelectedFilters && checkIsObjectEmpty(selectedFilters) && !hasEffectRun.current && datasetFilterConfigData) {
      dispatch({
        type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
        payload: {
          selectedFilters: formatDrilldownFilters(preSelectedFilters, datasetFilterConfigData?.data ?? [])
            ?.selectedDrilldownFilters,
        },
      });
      hasEffectRun.current = true;
    }
  }, [preSelectedFilters, datasetFilterConfigData, dispatch]);

  return (
    <div className='space-y-7'>
      <div className='space-y-4'>
        <div>
          <label className='mb-2 block text-sm font-medium'>Title</label>
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            size='small'
            placeholder='New Widget'
            data-testid='widget-creation-form-title-input'
          />
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium'>Dataset</label>
          <Select
            options={datasetOptions}
            value={formData.datasetId}
            onValueChange={(value) => handleDatasetChange(value as string)}
            variant='small'
            id='widget-creation-form-dataset'
          />
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium'>Visualisation</label>
          <SelectButton
            options={VISUALIZATION_OPTIONS}
            value={formData.visualizationType}
            onValueChange={(value: string) => handleInputChange('visualizationType', value)}
          />
        </div>

        <div>{renderChartSpecificFields()}</div>

        <FiltersWrapper filterConfig={filtersConfig ?? []} className='px-0' allowActions allowClear isPlayground />

        {formData.visualizationType !== WIDGET_TYPES.KPI && (
          <div>
            <label className='mb-2 block text-sm font-medium'>Size</label>
            <SelectButton
              options={SIZE_OPTIONS}
              value={formData.size}
              onValueChange={(value: string) => handleInputChange('size', value)}
              buttonClassName='w-8'
            />
          </div>
        )}
      </div>
      <div className='flex justify-end'>
        <TooltipV2
          tooltipBody='Please configure the widget'
          side={SIDE_OPTIONS.TOP}
          isDisabledBody={!!formData.datasetId && !isDatasetFilterConfigFetching}
          asChildTrigger
        >
          <Button
            size='medium'
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className={cn({ 'cursor-not-allowed opacity-50': !formData.datasetId || isDatasetFilterConfigFetching })}
            data-testid='widget-creation-form-done-btn'
          >
            Done
          </Button>
        </TooltipV2>
      </div>
    </div>
  );
};

export default WidgetCreationForm;
