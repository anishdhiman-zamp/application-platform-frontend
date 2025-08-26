'use client';

import { useMemo } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { PERIODICITY_TYPES } from '@zamp-platform/utils';
import AGChartsWidgets from 'modules/widgets/AgChartWidgets';
import { useWidgetCreationContext } from 'modules/widgets/create/context/WidgetCreationContext';
import { WIDGET_TYPES } from 'types/api/widgets.types';
import ZampLogoLoader from '@/components/common/loader/ZampLogoLoader';
import useMockData from '@/modules/widgets/create/hooks/useMockData';
import usePreviewData from '@/modules/widgets/create/hooks/usePreviewData';
import { getCommaSeparatedNumber } from '@/utils/common';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

const WidgetPreview = () => {
  const { formData, previewData, mockWidgetDetails } = useWidgetCreationContext();

  usePreviewData();

  const isFetching = useMockData();

  const renderPreviewWidget = () => {
    if (!formData?.datasetId) {
      return (
        <div className='relative flex h-100 items-center justify-center'>
          <div className='f-18-450 text-GRAY_1000 absolute top-4.5 left-6'>{formData?.title || 'New Widget'}</div>
          <div className='f-12-500 text-gray-600'>Choose a dataset to display the chart</div>
        </div>
      );
    }

    if (!mockWidgetDetails) return null;

    switch (formData.visualizationType) {
      case WIDGET_TYPES.BAR_CHART:
      case WIDGET_TYPES.LINE_CHART:
      case WIDGET_TYPES.DONUT_CHART:
        return (
          <AGChartsWidgets
            widgetDetails={mockWidgetDetails}
            currentPageFilters='[]'
            isFilterInitialized={true}
            onNodeClick={() => {}}
            periodicity={PERIODICITY_TYPES.DAILY}
            timeColumns=''
            groupWidgetsOptions={[]}
            onWidgetChange={() => {}}
            activeWidget='preview-widget'
            isFilterLoading={false}
            currency='USD'
            defaultCurrency='USD'
            previewData={previewData}
            isPlayground
          />
        );

      case WIDGET_TYPES.KPI:
        return (
          <div className='space-y-4'>
            <h2 className='f-22-400 text-gray-900'>{formData.title || 'New Widget'}</h2>
            <p className='f-64-400 text-gray-950'>
              {getCommaSeparatedNumber(previewData[0]?.data?.[0]?.value ?? 0, 2)}
            </p>
          </div>
        );

      default:
        return (
          <div className='flex h-64 items-center justify-center text-gray-500'>
            Widget type not supported in preview
          </div>
        );
    }
  };

  const isKpiWidget = useMemo(() => formData.visualizationType === WIDGET_TYPES.KPI, [formData.visualizationType]);

  return (
    <CommonWrapper
      isLoading={isFetching}
      skeletonType={SkeletonTypes.CUSTOM}
      className={cn('h-100 overflow-hidden rounded-xl border border-gray-200', {
        'bg-white': !isKpiWidget,
        'flex items-center justify-center border-none': isKpiWidget,
      })}
      loader={<ZampLogoLoader className='bg-transparent' />}
    >
      {renderPreviewWidget()}
    </CommonWrapper>
  );
};

export default WidgetPreview;
