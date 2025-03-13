import React, { useEffect, useMemo, useState } from 'react';
import { useGetDatasetDrilldownQuery } from 'apis/dataset';
import { PAGE_LOADER } from 'constants/lottie/page_loader';
import DatasetById from 'modules/data/Dataset';
import { useParams } from 'next/navigation';
import { MenuItem, TAB_TYPES } from 'types/common/components';
import { cn } from 'utils/common';
import { Tabs } from 'components/common/tabs/Tabs';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';

const DrilldownByDatasetAndRowId = () => {
  const { datasetId, rowId } = useParams();
  const [selectedTab, setSelectedTab] = useState<string>();

  const { data, isLoading, isError, refetch } = useGetDatasetDrilldownQuery({
    datasetId: datasetId as string,
    rowId: rowId as string,
  });

  const tabs = useMemo(
    () =>
      data?.tabs.map((tab) => ({
        value: tab.dataset_id,
        label: tab.dataset_title,
      })) ?? [],
    [data],
  );

  const currentTabIndex = tabs.findIndex((val) => (val as MenuItem).value === selectedTab);

  const handleTabSelect = (selected?: MenuItem) => {
    if (!selected) return;
    setSelectedTab(selected?.value as string);
  };

  useEffect(() => {
    setSelectedTab(tabs[0]?.value as string);
  }, [tabs]);

  return (
    <CommonWrapper
      className={cn('h-full', {
        'flex flex-col items-center justify-center': isLoading,
      })}
      isLoading={isLoading}
      isError={isError}
      refetchFunction={refetch}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={
        <DynamicLottiePlayer src={PAGE_LOADER} className='lottie-player' autoplay style={{ height: '200px' }} loop />
      }
    >
      <div className='h-full'>
        <div className='p-3 bg-BG_GRAY_2 border-b border-BORDER_GRAY_400'>
          {tabs.length > 1 && (
            <Tabs
              list={tabs}
              id='drilldown-tabs'
              onSelect={handleTabSelect}
              customSelectedIndex={currentTabIndex >= 0 ? currentTabIndex : 0}
              type={TAB_TYPES.OUTLINE}
              tabItemSelectedStyle='bg-white'
            />
          )}
        </div>
        {selectedTab && (
          <DatasetById
            id={selectedTab}
            drilldownFilters={data?.tabs.find((tab) => tab.dataset_id === selectedTab)?.filters}
          />
        )}
      </div>
    </CommonWrapper>
  );
};

export default DrilldownByDatasetAndRowId;
