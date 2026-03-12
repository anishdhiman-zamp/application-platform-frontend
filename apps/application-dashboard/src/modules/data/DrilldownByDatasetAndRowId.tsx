'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { MenuItem, TAB_TYPES } from 'types/common/components';
import { cn } from 'utils/common';
import { useGetDatasetDrilldownQuery } from '@/apis/dataset';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { Tabs } from 'components/common/tabs/Tabs';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
const DatasetById = dynamic(() => import('modules/data/Dataset'));

const DrilldownByDatasetAndRowId = () => {
  const params = useParams();
  const [selectedTab, setSelectedTab] = useState<string>();

  const { data, isLoading, isError, refetch } = useGetDatasetDrilldownQuery(
    {
      datasetId: params?.datasetId as string,
      rowId: params?.rowId as string,
    },
    { skip: !params?.datasetId || !params?.rowId },
  );

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

  const updateInitialTab = (tabs: MenuItem[]) => {
    setSelectedTab(tabs[0]?.value as string);
  };

  useEffect(() => {
    if (tabs?.length > 0) updateInitialTab(tabs);
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
        <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='z-50 h-[calc(100vh-200px)]' />
      }
    >
      <div className='h-full'>
        <div className='bg-BG_GRAY_2 border-GRAY_400 rounded-tl-xl border-b p-3'>
          {tabs?.length > 1 && (
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
            key={selectedTab}
            id={selectedTab}
            drilldownFilters={data?.tabs.find((tab) => tab.dataset_id === selectedTab)?.filters}
            isDrilldown
          />
        )}
      </div>
    </CommonWrapper>
  );
};

export default DrilldownByDatasetAndRowId;
