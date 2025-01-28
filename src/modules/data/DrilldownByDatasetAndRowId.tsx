import React, { useMemo } from 'react';
import { useGetDatasetDrilldownQuery } from 'apis/dataset';
import { SIZE } from 'constants/common.constants';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { MenuItem, TAB_TYPES } from 'types/common/components';
import { Loader } from 'components/common/loader/Loader';
import Table from 'components/common/table';
import { Tabs } from 'components/common/tabs/Tabs';

const DrilldownByDatasetAndRowId = () => {
  const { datasetId, rowId } = useParams();
  const router = useRouter();

  const { data, isLoading } = useGetDatasetDrilldownQuery({ datasetId: datasetId as string, rowId: rowId as string });

  const tabs = useMemo(
    () =>
      data?.tabs.map((tab) => ({
        value: tab.dataset_id,
        label: tab.dataset_id,
      })) ?? [],
    [data],
  );

  const path = (router?.query?.tab as string) ?? tabs[0]?.value;
  const currentTabIndex = tabs.findIndex((val) => (val as MenuItem).value === path);

  const handleTabSelect = (selected?: MenuItem) => {
    if (!selected) return;

    router.push({
      query: {
        tab: selected.value,
      },
    });
  };

  const columns = useMemo(
    () =>
      data?.tabs[currentTabIndex].datasetData.columns?.map((column) => ({
        field: column.name,
      })) ?? [],
    [data, currentTabIndex],
  );

  const rows = useMemo(() => data?.tabs[currentTabIndex].datasetData.rows ?? [], [data, currentTabIndex]);

  return (
    <>
      {isLoading ? (
        <div className='flex justify-center items-center h-full'>
          <Loader size={SIZE.MEDIUM} />
        </div>
      ) : (
        <div className='h-full'>
          {tabs.length > 1 && (
            <Tabs
              list={tabs}
              id='drilldown-tabs'
              onSelect={handleTabSelect}
              customSelectedIndex={currentTabIndex >= 0 ? currentTabIndex : 0}
              type={TAB_TYPES.OUTLINE}
            />
          )}
          <Table rows={rows} columns={columns} />
        </div>
      )}
    </>
  );
};

export default DrilldownByDatasetAndRowId;
