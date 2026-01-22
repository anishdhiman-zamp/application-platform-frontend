import React, { FC, useState } from 'react';
import {
  BluePrintDataset,
  DATASET_PLAYGROUND_TABS_LIST,
  DatasetCreationProvider,
  DatasetEditPreviewTab,
  DatasetTabsTypes,
  PreviewDataset,
} from '@zamp-platform/dataset-create-edit';
import { X } from 'lucide-react';
import CoinsStacked04 from '@/assets/Icons/CoinsStacked04';
import { cn } from '@/utils/common';

const TAB_CONTENT_COMPONENTS: Record<string, FC> = {
  [DatasetTabsTypes.BLUEPRINT]: BluePrintDataset,
  [DatasetTabsTypes.PREVIEW]: PreviewDataset,
};

const DatasetPlaygroundContent: FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>(DATASET_PLAYGROUND_TABS_LIST[0].value);

  const handleTabSelect = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center justify-between pt-3.5 pr-4 pb-1 pl-3.5'>
        <div className='flex items-center gap-1'>
          <CoinsStacked04 width={16} height={16} className='text-GRAY_700' />
          <span className='f-13-500 text-GRAY_1000'> New Dataset</span>
        </div>

        <DatasetEditPreviewTab selectedTab={selectedTab as DatasetTabsTypes} handleTabSelect={handleTabSelect} />
        <X className='text-GRAY_700 h-4 w-4' />
      </div>

      {Object.entries(TAB_CONTENT_COMPONENTS).map(([key, Component]) => (
        <div key={key} className={cn(selectedTab === key ? 'h-full flex-1 overflow-hidden' : 'hidden')}>
          <Component />
        </div>
      ))}
    </div>
  );
};

// Wrapper component that provides the context
const DatasetPlayground: FC = () => {
  return (
    <DatasetCreationProvider>
      <DatasetPlaygroundContent />
    </DatasetCreationProvider>
  );
};

export default DatasetPlayground;
