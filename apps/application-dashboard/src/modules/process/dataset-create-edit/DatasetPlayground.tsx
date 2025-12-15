import React, { FC, useState } from 'react';
import { X } from 'lucide-react';
import { DATASET_PLAYGROUND_TABS_LIST, TAB_CONTENT_MAPPING } from 'modules/process/process.constant';
import CoinsStacked04 from '@/assets/Icons/CoinsStacked04';
import { cn } from '@/utils/common';

const DatasetPlayground: FC = () => {
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

        <div className='flex items-center gap-1'>
          {DATASET_PLAYGROUND_TABS_LIST.map((tab) => (
            <div
              key={tab.value}
              className={cn(
                'f-13-450 text-GRAY_700 cursor-pointer bg-transparent p-0 px-2 py-1',
                selectedTab === tab.value && 'text-GRAY_1000 bg-GRAY_100 rounded',
              )}
              onClick={() => handleTabSelect(tab.value)}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <X className='text-GRAY_700 h-4 w-4' />
      </div>

      {Object.entries(TAB_CONTENT_MAPPING).map(([key, content]) => (
        <div key={key} className={cn(selectedTab === key ? 'h-full flex-1 overflow-hidden' : 'hidden')}>
          {content}
        </div>
      ))}
    </div>
  );
};

export default DatasetPlayground;
