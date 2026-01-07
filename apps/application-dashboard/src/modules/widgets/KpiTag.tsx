import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { PERIODICITY_TYPES } from '@zamp-platform/utils';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { useWindowDimensions } from 'hooks/useWindowDimensions';
import { CURRENCY_SYMBOLS } from 'modules/page/pages.constants';
import { PAGE_ACCESS_PRIVILEGES, ResourceType } from 'modules/shareResource';
import DeleteWidgetDialog from 'modules/widgets/components/DeleteWidgetDialog';
import WidgetOptions from 'modules/widgets/WidgetOptions';
import { WIO_PRD_ORG_ID } from 'modules/widgets/widgets.constant';
import { useParams } from 'next/navigation';
import { RootState } from 'store';
import { WIDGET_TYPES, WidgetInstanceType } from 'types/api/widgets.types';
import { cn, getCommaSeparatedNumber } from 'utils/common';
import PermissionGuard from '@/components/hoc/PermissionGuard';
import { useAppSelector } from '@/hooks/toolkit';
import { ResponsiveGridLayoutType, SIDE_OPTIONS } from '@/types/commonTypes';
import TooltipV2 from 'components/common/TooltipV2';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import SkeletonElement from 'components/skeletons/SkeletonElement';

interface KpiTagProps {
  widgetDetails: Extract<WidgetInstanceType, { widget_type: WIDGET_TYPES.KPI }>;
  currentPageFilters: string;
  isFilterInitialized?: boolean;
  periodicity: string;
  timeColumns: string;
  isFilterLoading?: boolean;
  currency?: string;
  defaultCurrency: string;
  currentWidgetLayout?: ResponsiveGridLayoutType;
}

const KpiTag: FC<KpiTagProps> = ({
  widgetDetails,
  currentPageFilters,
  isFilterInitialized,
  periodicity,
  timeColumns,
  isFilterLoading,
  currency,
  defaultCurrency,
  currentWidgetLayout,
}) => {
  const params = useParams();
  const pageId = params?.pageId as string;
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const selectedDatasetIds = useAppSelector((state) => state.sheetFilters.selectedDatasetIds);
  const valueContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const windowWidth = useWindowDimensions().width;
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isDatasetSelected = useMemo(
    () => selectedDatasetIds?.includes(widgetDetails?.data_mappings?.mappings?.[0]?.dataset_id),
    [selectedDatasetIds, widgetDetails],
  );

  const {
    data: widgetData,
    isFetching,
    isLoading,
  } = useGetWidgetDataQuery(
    {
      widgetId: widgetDetails?.widget_instance_id,
      payload: {
        filters: currentPageFilters,
        time_columns: timeColumns,
        periodicity: periodicity as PERIODICITY_TYPES,
        currency: currency,
      },
    },
    { refetchOnMountOrArgChange: false, skip: !isFilterInitialized },
  );

  const value: string = useMemo(() => {
    const primaryValue = widgetDetails?.data_mappings?.mappings?.[0]?.fields?.primary_value?.[0];
    const key = primaryValue?.alias ?? primaryValue?.column;
    const data = widgetData?.result?.[0]?.data[0] as Record<string, any>;

    // Skip currency formatting for specific organization
    const shouldSkipCurrencyFormatting = organizationId === WIO_PRD_ORG_ID;

    const currency =
      !shouldSkipCurrencyFormatting &&
      (defaultCurrency || widgetData?.currency) &&
      (CURRENCY_SYMBOLS[defaultCurrency as keyof typeof CURRENCY_SYMBOLS] ??
        CURRENCY_SYMBOLS[widgetData?.currency as keyof typeof CURRENCY_SYMBOLS] ??
        widgetData?.currency);

    if (isNaN(Number(data?.[key]))) return data?.[key];

    return currency
      ? `${currency} ${getCommaSeparatedNumber(Number(data?.[key]), 2)}`
      : getCommaSeparatedNumber(Number(data?.[key]), 0);
  }, [widgetData, organizationId]);

  useEffect(() => {
    const callback = () => {
      if (!containerRef.current || !valueContainerRef.current) return;

      const contentWidth = containerRef.current?.offsetWidth - 48;
      const valueWidth = valueContainerRef.current?.scrollWidth;

      if (valueWidth && valueWidth > contentWidth) {
        setShowTooltip(true);
      } else {
        setShowTooltip(false);
      }
    };

    const timer = setTimeout(callback, 500);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [containerRef, valueContainerRef, widgetData, isFetching, windowWidth]);

  return (
    <div className='group relative'>
      <PermissionGuard resourceType={ResourceType.PAGE} resourceId={pageId} privilege={PAGE_ACCESS_PRIVILEGES.ADMIN}>
        <WidgetOptions
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          widgetDetails={widgetDetails}
          currentWidgetLayout={currentWidgetLayout}
        />
      </PermissionGuard>

      <div
        className={cn('border-GRAY_400 z-9999 h-full rounded-xl border bg-white px-6 pt-4.5 pb-5', {
          'animate-pulse opacity-85': isFetching,
          'shadow-chart-highlight': isDatasetSelected,
        })}
        ref={containerRef}
        data-testid={`${widgetDetails.widget_instance_id}-kpi-tag`}
      >
        <div className='f-13-450 text-GRAY_900 mb-2 truncate'>{widgetDetails?.title}</div>
        <CommonWrapper
          skeletonType={SkeletonTypes.CUSTOM}
          isLoading={isLoading || isFilterLoading}
          loader={<SkeletonElement className='max-w-[250px]' />}
        >
          <TooltipV2
            tooltipBody={value}
            disabled={isFetching || !showTooltip}
            tooltipClassName='f-12-300 px-3 py-1.5 rounded-md whitespace-nowrap z-999 bg-black text-white'
            side={SIDE_OPTIONS.BOTTOM}
            className='cursor-text!'
          >
            <div className='f-24-450 text-GRAY_950 sensitive truncate' ref={valueContainerRef}>
              {value}
              {widgetDetails.display_config?.show_percentages && '%'}
            </div>
          </TooltipV2>
        </CommonWrapper>
      </div>
      <DeleteWidgetDialog
        widgetId={widgetDetails.widget_instance_id}
        widgetTitle={widgetDetails?.title}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  );
};

export default KpiTag;
