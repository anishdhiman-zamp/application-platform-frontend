import { FC, useMemo } from 'react';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { WidgetInstanceType } from 'types/api/pagesApi.types';
import { getCommaSeparatedNumber } from 'utils/common';

interface KpiTagProps {
  widgetDetails: WidgetInstanceType;
  currentPageFilters: string;
  isFilterInitialized?: boolean;
}

const KpiTag: FC<KpiTagProps> = ({ widgetDetails, currentPageFilters, isFilterInitialized }) => {
  const { data: widgetData } = useGetWidgetDataQuery(
    { widgetId: widgetDetails?.widget_instance_id, filters: currentPageFilters },
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
      <div className='f-24-450 text-GRAY_950'>{getCommaSeparatedNumber(Number(value), 2)}</div>
    </div>
  );
};

export default KpiTag;
