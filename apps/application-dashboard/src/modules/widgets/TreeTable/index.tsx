import { FC, useEffect } from 'react';
import { PERIODICITY_TYPES } from '@zamp-platform/utils';
import { useGetWidgetDataQuery } from 'apis/widgets';
import NoPivotData from 'modules/widgets/Pivot/loader/NoPivotData';
import PivotTableLoader from 'modules/widgets/Pivot/loader/PivotTableLoader';
import TreeTableComponent from 'modules/widgets/TreeTable/components/Table';
import { TreeTableComponentInterface } from 'modules/widgets/TreeTable/types';
import { LOCAL_STORAGE_KEYS } from '@/utils/localstorage';
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
  setActiveWidget,
  handleWidgetHeightChange,
  defaultCurrency,
  sheetId,
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

  const storedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID) || '{}');
  const currentActiveWidget = storedData[sheetId]?.widget_instance_id ?? activeWidget;

  const initializeSheetData = () => {
    if (!sheetId || typeof sheetId !== 'string') return;

    if (storedData[sheetId]?.widget_instance_id && setActiveWidget) {
      setActiveWidget(storedData[sheetId]?.widget_instance_id);
    }

    if (!storedData[sheetId]) {
      storedData[sheetId] = {};
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID, JSON.stringify(storedData));
  };

  useEffect(() => {
    initializeSheetData();
  }, [sheetId, storedData, setActiveWidget]);

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
          activeWidget={currentActiveWidget}
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
          activeWidget={currentActiveWidget}
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
