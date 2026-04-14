'use client';

import { useSearchParams } from 'next/navigation';
import DatasetTabContent from '@/modules/pace/components/datasets/DatasetTabContent';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from '@/modules/pace/pace.types';

const ChatDatasetPage = () => {
  const searchParams = useSearchParams();
  const urlTableName = searchParams?.get('d') ?? '';

  const { activeTab } = useDynamicTabs({ type: TAB_TYPE.DATASET });

  const tableName = activeTab?.id ?? urlTableName;

  if (!tableName) {
    return null;
  }

  return <DatasetTabContent key={tableName} tableName={tableName} />;
};

export default ChatDatasetPage;
