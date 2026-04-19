'use client';

import { useSearchParams } from 'next/navigation';
import CreateDatasetTabContent from '@/modules/pace/components/datasets/CreateDatasetTabContent';
import { isNewDatasetId } from '@/modules/pace/components/datasets/datasets.constants';
import DatasetTabContent from '@/modules/pace/components/datasets/DatasetTabContent';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_QUERY_PARAM, TAB_TYPE } from '@/modules/pace/pace.types';

const ChatDatasetPage = () => {
  const searchParams = useSearchParams();
  const urlTableName = searchParams?.get(TAB_QUERY_PARAM.DATASET) ?? '';

  const { activeTab } = useDynamicTabs({ type: TAB_TYPE.DATASET });

  const tableName = activeTab?.id ?? urlTableName;

  if (!tableName) {
    return null;
  }

  if (isNewDatasetId(tableName)) {
    return <CreateDatasetTabContent key={tableName} tabId={tableName} />;
  }

  return <DatasetTabContent key={tableName} tableName={tableName} />;
};

export default ChatDatasetPage;
