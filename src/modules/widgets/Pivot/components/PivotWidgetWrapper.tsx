import { FC } from 'react';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { PERIODICITY_TYPES } from 'constants/date.constants';
import NoWidgetData from 'modules/widgets/components/NoWidgetData';
import PivotTableLoader from 'modules/widgets/Pivot/loader/PivotTableLoader';
import StackedPivot from 'modules/widgets/Pivot/StackedPivot';
import { WIDGET_TYPES, WidgetInstanceType } from 'types/api/widgets.types';
import { MapAny, OptionsType } from 'types/commonTypes';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

export type PivotTableWidgetPropsType = {
  widgetInstanceDetails: Extract<WidgetInstanceType, { widget_type: WIDGET_TYPES.PIVOT_TABLE }>;
  currentPageFilters: string;
  isFilterInitialized?: boolean;
  periodicity: PERIODICITY_TYPES;
  timeColumns: string;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  isFilterLoading?: boolean;
  currency: string;
  currentWidgetSelectedFilter: MapAny;
};

const PivotTableWidgetWrapper: FC<PivotTableWidgetPropsType> = ({
  widgetInstanceDetails,
  currentPageFilters,
  isFilterInitialized,
  periodicity,
  timeColumns,
  groupWidgetsOptions,
  onWidgetChange,
  isFilterLoading,
  currency,
  currentWidgetSelectedFilter,
}) => {
  const { data, isFetching, isError, refetch } = useGetWidgetDataQuery(
    {
      widgetId: widgetInstanceDetails.widget_instance_id,
      payload: {
        filters: currentPageFilters,
        time_column: timeColumns,
        periodicity: periodicity as PERIODICITY_TYPES,
        currency: currency,
      },
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !isFilterInitialized,
    },
  );

  return (
    <CommonWrapper
      isLoading={isFetching || !isFilterInitialized || isFilterLoading}
      skeletonType={SkeletonTypes.CUSTOM}
      isNoData={data?.result.every((res) => res.rowcount === 0)}
      refetchFunction={refetch}
      isError={isError}
      className='h-full w-full'
      noDataBanner={<NoWidgetData className='w-full h-full border border-GRAY_400 rounded-xl' />}
      loader={<PivotTableLoader />}
    >
      {data && (
        <StackedPivot
          widgetData={data}
          widgetInstanceDetails={widgetInstanceDetails}
          groupWidgetsOptions={groupWidgetsOptions}
          onWidgetChange={onWidgetChange}
          periodicity={periodicity}
          currentWidgetSelectedFilter={currentWidgetSelectedFilter}
        />
      )}
    </CommonWrapper>
  );
};

export default PivotTableWidgetWrapper;
