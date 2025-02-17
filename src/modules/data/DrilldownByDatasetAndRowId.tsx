import React, { useEffect, useMemo, useState } from 'react';
import { useGetDatasetDrilldownQuery } from 'apis/dataset';
import DatasetById from 'modules/data/Dataset';
import { useParams } from 'next/navigation';
import { MenuItem, TAB_TYPES } from 'types/common/components';
import { Tabs } from 'components/common/tabs/Tabs';
import CommonWrapper from 'components/commonWrapper';

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
    <CommonWrapper isLoading={isLoading} isError={isError} refetchFunction={refetch}>
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
        {selectedTab && <DatasetById id={selectedTab} />}
      </div>
    </CommonWrapper>
  );
};

export default DrilldownByDatasetAndRowId;
