'use client';

import { useCallback } from 'react';
import DatasetDetail from 'modules/pace/components/datasets/DatasetDetail';
import DatasetSelector from 'modules/pace/components/datasets/DatasetSelector';
import ShareDatasetNeonPopup from 'modules/pace/components/datasets/ShareDatasetNeonPopup';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from '@/modules/pace/pace.types';

interface DatasetTabContentProps {
  tableName: string;
}

const DatasetTabContent = ({ tableName }: DatasetTabContentProps) => {
  const { updateTab, getTabById, navigateToTab } = useDynamicTabs({ type: TAB_TYPE.DATASET });

  const handleSelectDataset = useCallback(
    (newTableName: string, displayName: string) => {
      if (newTableName === tableName) return;

      const existingTab = getTabById(newTableName);

      if (existingTab) {
        navigateToTab(existingTab);

        return;
      }

      updateTab(tableName, newTableName, displayName);
    },
    [tableName, getTabById, navigateToTab, updateTab],
  );

  const renderHeader = useCallback(
    ({ tableName: currentTableName }: { tableName: string; title: string }) => (
      <div className='border-GRAY_400 flex items-center gap-3 border-b px-4 py-2.5'>
        <DatasetSelector tableName={currentTableName} onSelectDataset={handleSelectDataset} />
        <div className='flex-1' />
        <ShareDatasetNeonPopup tableName={currentTableName} />
      </div>
    ),
    [handleSelectDataset],
  );

  return <DatasetDetail tableName={tableName} renderHeader={renderHeader} />;
};

export default DatasetTabContent;
