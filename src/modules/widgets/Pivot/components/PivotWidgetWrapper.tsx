import { FC } from 'react';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { PERIODICITY_TYPES } from 'constants/date.constants';
import { WIDGET_LOADER } from 'constants/icons';
import NoWidgetData from 'modules/widgets/components/NoWidgetData';
import StackedPivot from 'modules/widgets/Pivot/StackedPivot';
import Image from 'next/image';
import { WIDGET_TYPES, WidgetInstanceType } from 'types/api/widgets.types';
import { OptionsType } from 'types/commonTypes';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

export type PivotTableWidgetPropsType = {
  widgetInstanceDetails: Extract<WidgetInstanceType, { widget_type: WIDGET_TYPES.PIVOT_TABLE }>;
  currentPageFilters: string;
  isFilterInitialized?: boolean;
  periodicity: string;
  timeColumn: string;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  isFilterLoading?: boolean;
};

const PivotTableWidgetWrapper: FC<PivotTableWidgetPropsType> = ({
  widgetInstanceDetails,
  currentPageFilters,
  isFilterInitialized,
  periodicity,
  timeColumn,
  groupWidgetsOptions,
  onWidgetChange,
  isFilterLoading,
}) => {
  const { data, isFetching, isError, refetch } = useGetWidgetDataQuery(
    {
      widgetId: widgetInstanceDetails.widget_instance_id,
      payload: { filters: currentPageFilters, time_column: timeColumn, periodicity: periodicity as PERIODICITY_TYPES },
    },
    {
      refetchOnMountOrArgChange: false,
      skip: !isFilterInitialized || !timeColumn,
    },
  );

  return (
    <CommonWrapper
      isLoading={isFetching || !isFilterInitialized || !timeColumn || isFilterLoading}
      skeletonType={SkeletonTypes.CUSTOM}
      isNoData={data?.result.every((res) => res.rowcount === 0)}
      refetchFunction={refetch}
      isError={isError}
      className='h-full w-full'
      noDataBanner={<NoWidgetData />}
      loader={
        <div className='top-0 right-0 h-full w-full flex justify-center items-center z-1000 bg-white'>
          <Image src={WIDGET_LOADER} unoptimized alt='widget-loader' width={300} height={300} />
        </div>
      }
    >
      {data && (
        <StackedPivot
          widgetData={data}
          widgetInstanceDetails={widgetInstanceDetails}
          groupWidgetsOptions={groupWidgetsOptions}
          onWidgetChange={onWidgetChange}
        />
      )}
    </CommonWrapper>
  );
};

export default PivotTableWidgetWrapper;
