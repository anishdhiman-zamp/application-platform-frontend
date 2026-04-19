'use client';

import { useCallback } from 'react';
import DatasetDetail from 'modules/pace/components/datasets/DatasetDetail';
import DatasetSelector from 'modules/pace/components/datasets/DatasetSelector';
import ShareDatasetNeonPopup from 'modules/pace/components/datasets/ShareDatasetNeonPopup';
import { useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch } from '@/hooks/toolkit';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { markTabAsClosed } from '@/modules/pace/hooks/useTabRouter';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';
import { dynamicTabsActions } from '@/store/slices/dynamic-tabs.slice';

interface DatasetTabContentProps {
  tableName: string;
}

const DatasetTabContent = ({ tableName }: DatasetTabContentProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { updateTab, getTabById, navigateToTab, openTab } = useDynamicTabs({ type: TAB_TYPE.DATASET });

  const handleSelectDataset = useCallback(
    (newTableName: string, displayName: string) => {
      if (newTableName === tableName) return;

      const existingTab = getTabById(newTableName);

      if (existingTab) {
        navigateToTab(existingTab);

        return;
      }

      const currentTab = getTabById(tableName);

      if (currentTab) {
        updateTab(tableName, newTableName, displayName);
      } else {
        openTab(newTableName, displayName);
      }
    },
    [tableName, getTabById, navigateToTab, updateTab, openTab],
  );

  const handleBackToDatasets = useCallback(() => {
    markTabAsClosed(tableName);
    dispatch(dynamicTabsActions.closeTab(tableName));
    router.push(preserveSidebarParam(ROUTES_PATH.CHAT_SETTINGS_DATASETS));
  }, [tableName, dispatch, router]);

  return (
    <DatasetDetail
      tableName={tableName}
      onBackToDatasets={handleBackToDatasets}
      header={
        <div className='border-GRAY_400 flex items-center gap-3 border-b px-6 py-2.5'>
          <DatasetSelector tableName={tableName} onSelectDataset={handleSelectDataset} />
          <div className='flex-1' />
          <ShareDatasetNeonPopup tableName={tableName} />
        </div>
      }
    />
  );
};

export default DatasetTabContent;
