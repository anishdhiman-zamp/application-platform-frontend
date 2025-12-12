'use client';

import { useMemo } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { PERIODICITY_TYPES } from '@zamp-platform/utils';
import AGChartsWidgets from 'modules/widgets/AgChartWidgets';
import WidgetInfo from 'modules/widgets/create/components/WidgetInfo';
import { SIZE_OPTIONS_VALUES } from 'modules/widgets/create/constants';
import { useWidgetCreationContext } from 'modules/widgets/create/context/WidgetCreationContext';
import { WIDGET_TYPES, WidgetInstanceTypeWrapper } from 'types/api/widgets.types';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
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
            widgetDetails={mockWidgetDetails as WidgetInstanceTypeWrapper}
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
          <div className='space-y-2.5'>
            <div className='min-w-125 space-y-4 rounded-xl border border-gray-400 bg-white p-9'>
              <h2 className='f-22-400 text-gray-900'>{formData.title || 'New Widget'}</h2>
              <p className='f-64-400 text-gray-950'>
                {getCommaSeparatedNumber(previewData[0]?.data?.[0]?.value ?? 0, 2)}
              </p>
            </div>
            <WidgetInfo />
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
    <div className='flex justify-center'>
      <div
        className={cn('w-full space-y-2.5 transition-all duration-300', {
          'w-[558px]': !isKpiWidget && formData?.size === SIZE_OPTIONS_VALUES.HALF,
        })}
      >
        <CommonWrapper
          isLoading={isFetching}
          skeletonType={SkeletonTypes.CUSTOM}
          className={cn('h-100 w-full overflow-hidden rounded-xl border border-gray-200', {
            'bg-white': !(isKpiWidget && formData?.datasetId),
            'flex items-center justify-center border-none': isKpiWidget && formData?.datasetId,
          })}
          loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='rounded-tl-xl' />}
        >
          {renderPreviewWidget()}
        </CommonWrapper>
        {!isKpiWidget && formData?.datasetId && mockWidgetDetails && previewData.length > 0 && <WidgetInfo />}
      </div>
    </div>
  );
};

export default WidgetPreview;
