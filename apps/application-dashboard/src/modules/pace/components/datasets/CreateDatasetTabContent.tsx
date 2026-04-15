'use client';

import { useCallback } from 'react';
import { snakeCaseToSentenceCase } from 'utils/common';
import CreateDataset from '@/modules/pace/components/datasets/CreateDataset';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from '@/modules/pace/pace.types';

interface CreateDatasetTabContentProps {
  tabId: string;
}

const CreateDatasetTabContent = ({ tabId }: CreateDatasetTabContentProps) => {
  const { updateTab } = useDynamicTabs({ type: TAB_TYPE.DATASET });

  const handleCreated = useCallback(
    (tableName: string, displayName: string) => {
      updateTab(tabId, tableName, displayName || snakeCaseToSentenceCase(tableName));
    },
    [tabId, updateTab],
  );

  return <CreateDataset onCreated={handleCreated} hideBackButton />;
};

export default CreateDatasetTabContent;
