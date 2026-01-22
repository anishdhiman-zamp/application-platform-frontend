import { cn } from '@zamp-platform/ui/utils';
import React, { FC } from 'react';

import { DATASET_PLAYGROUND_TABS_LIST, DatasetTabsTypes } from '../constants/index';

interface DatasetEditPreviewTabProps {
  selectedTab: DatasetTabsTypes;
  handleTabSelect: (value: DatasetTabsTypes) => void;
}

const DatasetEditPreviewTab: FC<DatasetEditPreviewTabProps> = ({ selectedTab, handleTabSelect }) => {
  return (
    <div className='bg-GRAY_100 flex items-center rounded'>
      {DATASET_PLAYGROUND_TABS_LIST.map((tab) => {
        const Icon = tab.icon;
        return (
          <div
            key={tab.value}
            className={cn(
              'f-13-450 text-GRAY_900 flex cursor-pointer items-center gap-1.5 rounded p-0 px-2 py-1.5',
              selectedTab === tab.value
                ? 'text-GRAY_1000 border-GRAY_400 scale-105 border bg-white'
                : 'bg-GRAY_100 border-none',
            )}
            onClick={() => handleTabSelect(tab.value)}
          >
            <Icon size={12} />
          </div>
        );
      })}
    </div>
  );
};

export default DatasetEditPreviewTab;
