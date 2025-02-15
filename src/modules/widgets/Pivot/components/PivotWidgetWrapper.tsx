import { FC } from 'react';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { PERIODICITY_TYPES } from 'constants/date.constants';
import { WIDGET_LOADER } from 'constants/icons';
import NoWidgetData from 'modules/widgets/components/NoWidgetData';
import StackedPivot from 'modules/widgets/Pivot/StackedPivot';
import Image from 'next/image';
import { WIDGET_TYPES, WidgetInstanceType } from 'types/api/widgets.types';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

export type PivotTableWidgetPropsType = {
  widgetInstanceDetails: Extract<WidgetInstanceType, { widget_type: WIDGET_TYPES.PIVOT_TABLE }>;
  currentPageFilters: string;
  isFilterInitialized?: boolean;
  periodicity: string;
  timeColumn: string;
};

const PivotTableWidgetWrapper: FC<PivotTableWidgetPropsType> = ({
  widgetInstanceDetails,
  currentPageFilters,
  isFilterInitialized,
  periodicity,
  timeColumn,
}) => {
  const { data, isFetching, error, refetch } = useGetWidgetDataQuery(
    {
      widgetId: widgetInstanceDetails.widget_instance_id,
      payload: { filters: currentPageFilters, time_column: timeColumn, periodicity: periodicity as PERIODICITY_TYPES },
    },
    {
      refetchOnMountOrArgChange: false,
      skip: !isFilterInitialized,
    },
  );

  return (
    <CommonWrapper
      isLoading={isFetching}
      skeletonType={SkeletonTypes.CUSTOM}
      isNoData={!data}
      isError={!!error}
      refetchFunction={refetch}
      className='h-full w-full'
      noDataBanner={<NoWidgetData />}
      loader={
        <div className='top-0 right-0 h-full w-full flex justify-center items-center z-1000 bg-white'>
          <Image src={WIDGET_LOADER} unoptimized alt='widget-loader' width={300} height={300} />
        </div>
      }
    >
      {data && <StackedPivot widgetData={data} widgetInstanceDetails={widgetInstanceDetails} />}
    </CommonWrapper>
  );
};

export default PivotTableWidgetWrapper;
