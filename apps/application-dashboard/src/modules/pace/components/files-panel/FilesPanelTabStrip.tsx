'use client';

import DynamicTabItem from 'modules/pace/components/dynamic-tabs/DynamicTabItem';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from 'modules/pace/pace.types';

const FilesPanelTabStrip = () => {
  const { tabs, isTabActive, navigateToTab, closeTab, closeOtherTabs, closeTabsToRight, closeAllTabs } = useDynamicTabs(
    { type: TAB_TYPE.FILE },
  );

  if (!tabs.length) return null;

  return (
    <div className='border-GRAY_400 flex h-9 shrink-0 items-center gap-x-1 overflow-x-auto border-b px-2'>
      {tabs.map((tab, index) => (
        <div key={tab.stableKey} className='max-w-[200px] min-w-[120px] shrink-0'>
          <DynamicTabItem
            tab={tab}
            isActive={isTabActive(tab)}
            tabIndex={index}
            totalTabs={tabs.length}
            onNavigate={navigateToTab}
            onClose={closeTab}
            onCloseOthers={closeOtherTabs}
            onCloseToRight={closeTabsToRight}
            onCloseAll={closeAllTabs}
          />
        </div>
      ))}
    </div>
  );
};

export default FilesPanelTabStrip;
