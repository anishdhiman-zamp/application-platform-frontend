import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import React, { FC } from 'react';

import { DATASET_PLAYGROUND_TABS_LIST, DatasetTabsTypes } from '../constants/index';

interface DatasetEditPreviewTabProps {
  selectedTab: DatasetTabsTypes;
  handleTabSelect: (value: DatasetTabsTypes) => void;
}

const DatasetEditPreviewTab: FC<DatasetEditPreviewTabProps> = ({ selectedTab, handleTabSelect }) => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className='bg-GRAY_100 flex items-center rounded'>
        {DATASET_PLAYGROUND_TABS_LIST.map((tab) => {
          const Icon = tab.icon;
          return (
            <Tooltip key={tab.value}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'f-13-450 text-GRAY_900 flex cursor-pointer items-center gap-1.5 rounded p-0 px-2 py-1.5',
                    selectedTab === tab.value
                      ? 'text-GRAY_1000 border-GRAY_400 bg-BG_WHITE scale-105 border'
                      : 'bg-GRAY_100 border-none',
                  )}
                  onClick={() => handleTabSelect(tab.value)}
                >
                  <Icon size={12} />
                </div>
              </TooltipTrigger>
              <TooltipContent side='bottom' className='mt-2 flex max-w-40 flex-col gap-1 p-3 text-left'>
                <p className='f-10-500 text-white'>{tab.label}</p>
                <p className='text-GRAY_700 f-10-400'>{tab.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default DatasetEditPreviewTab;
