'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import type { DatasetUrlDataType } from 'modules/data/data.types';
import { formatUrlFilters, parseDatasets } from 'modules/data/data.utils';
import type { FilterConfig } from 'modules/widgets/Pivot/pivot.types';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { TAB_TYPES } from 'types/common/components';
import { Tabs } from 'components/common/tabs/Tabs';
const DatasetById = dynamic(() => import('modules/data/Dataset'));

interface Dataset {
  id: string;
  title: string;
  filters?: Record<string, FilterConfig>;
}

const DrilldownMultiDataset = () => {
  const searchParams = useSearchParams();
  const datasets = searchParams?.get('datasets');
  const [selectedTab, setSelectedTab] = useState<string>('');

  const datasetArray = useMemo(() => {
    if (!datasets) return [];

    return parseDatasets(JSON.parse(datasets) as DatasetUrlDataType);
  }, [datasets]);

  const tabs = useMemo(
    () =>
      datasetArray.map((dataset: Dataset) => ({
        value: dataset?.id,
        label: dataset?.title,
      })),
    [datasetArray],
  );

  const selectedDataset = useMemo(
    () => datasetArray?.find((ds: Dataset) => ds?.id === selectedTab),
    [datasetArray, selectedTab],
  );

  useEffect(() => {
    if (tabs?.length && !selectedTab) setSelectedTab(tabs[0]?.value as string);
  }, [tabs, selectedTab]);

  return (
    <div className='h-full'>
      <div className='bg-BG_GRAY_2 border-BORDER_GRAY_400 rounded-tl-xl border-b p-3'>
        <Tabs
          list={tabs}
          id='drilldown-tabs'
          onSelect={(tab) => setSelectedTab(tab?.value as string)}
          type={TAB_TYPES.OUTLINE}
          tabItemSelectedStyle='bg-white'
        />
      </div>

      {selectedTab && selectedDataset && (
        <DatasetById
          key={selectedTab}
          id={selectedTab}
          isDrilldown
          drilldownFilters={formatUrlFilters(JSON.stringify(selectedDataset.filters))}
        />
      )}
    </div>
  );
};

export default memo(DrilldownMultiDataset);
