import { FC, useEffect } from 'react';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { PERIODICITY_TYPES } from 'constants/date.constants';
import NoPivotData from 'modules/widgets/Pivot/loader/NoPivotData';
import PivotTableLoader from 'modules/widgets/Pivot/loader/PivotTableLoader';
import TreeTableComponent from 'modules/widgets/TreeTable/components/Table';
import { TreeTableComponentInterface } from 'modules/widgets/TreeTable/types';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

const TreeTable: FC<TreeTableComponentInterface> = ({
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
  activeWidget,
  handleWidgetHeightChange,
  defaultCurrency,
}) => {
  const { data, isFetching, isError, refetch } = useGetWidgetDataQuery(
    {
      widgetId: widgetInstanceDetails.widget_instance_id,
      payload: {
        filters: currentPageFilters,
        time_columns: timeColumns,
        periodicity: periodicity as PERIODICITY_TYPES,
        currency: currency,
      },
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !isFilterInitialized,
    },
  );

  useEffect(() => {
    if (isFetching) {
      handleWidgetHeightChange(0, true);
    }
  }, [isFetching]);

  return (
    <CommonWrapper
      isLoading={isFetching || !isFilterInitialized || isFilterLoading}
      skeletonType={SkeletonTypes.CUSTOM}
      isNoData={data?.result?.every((res) => res?.rowcount === 0)}
      refetchFunction={refetch}
      isError={isError}
      className='h-full w-full'
      noDataBanner={
        <NoPivotData
          groupWidgetsOptions={groupWidgetsOptions}
          onWidgetChange={onWidgetChange}
          title={widgetInstanceDetails?.title}
          activeWidget={activeWidget}
        />
      }
      loader={<PivotTableLoader />}
    >
      {data && (
        <TreeTableComponent
          widgetData={data}
          widgetInstanceDetails={widgetInstanceDetails}
          groupWidgetsOptions={groupWidgetsOptions}
          onWidgetChange={onWidgetChange}
          activeWidget={activeWidget}
          periodicity={periodicity}
          currentWidgetSelectedFilter={currentWidgetSelectedFilter}
          handleWidgetHeightChange={handleWidgetHeightChange}
          defaultCurrency={defaultCurrency}
        />
      )}
    </CommonWrapper>
  );
};

export default TreeTable;
