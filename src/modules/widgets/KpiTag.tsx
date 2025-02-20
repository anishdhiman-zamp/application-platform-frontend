import { FC, useMemo } from 'react';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { PERIODICITY_TYPES } from 'constants/date.constants';
import { WIDGET_TYPES, WidgetInstanceType } from 'types/api/widgets.types';
import { getCommaSeparatedNumber } from 'utils/common';
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
  currency: string;
}

const KpiTag: FC<KpiTagProps> = ({
  widgetDetails,
  currentPageFilters,
  isFilterInitialized,
  periodicity,
  timeColumns,
  isFilterLoading,
  currency,
}) => {
  const { data: widgetData, isLoading } = useGetWidgetDataQuery(
    {
      widgetId: widgetDetails?.widget_instance_id,
      payload: {
        filters: currentPageFilters,
        time_column: JSON.stringify(timeColumns),
        periodicity: periodicity as PERIODICITY_TYPES,
        currency: currency,
      },
    },
    { refetchOnMountOrArgChange: true, skip: !isFilterInitialized },
  );

  const value: string = useMemo(() => {
    const key = widgetDetails?.data_mappings?.mappings?.[0]?.fields?.primary_value?.[0]?.column;
    const data = widgetData?.result?.[0]?.data[0] as Record<string, any>;

    return data?.[key];
  }, [widgetData]);

  return (
    <div className='bg-white h-full border border-GRAY_400 rounded-xl px-6 pt-4.5 pb-5 overflow-hidden'>
      <div className='f-13-450 text-GRAY_900 mb-2'>{widgetDetails?.title}</div>
      <CommonWrapper
        skeletonType={SkeletonTypes.CUSTOM}
        isLoading={isLoading || isFilterLoading}
        loader={<SkeletonElement className='max-w-[250px]' />}
      >
        <div className='f-24-450 text-GRAY_950'>
          {widgetData?.currency
            ? `${widgetData?.currency} ${getCommaSeparatedNumber(Number(value), 2)}`
            : getCommaSeparatedNumber(Number(value), 2)}
        </div>
      </CommonWrapper>
    </div>
  );
};

export default KpiTag;
