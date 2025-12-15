'use client';

import CapabilitiesSection from '@/modules/macs/components/sections/CapabilitiesSection';
import ComponentsSection from '@/modules/macs/components/sections/ComponentsSection';
import GenericSection from '@/modules/macs/components/sections/GenericSection';
import { useMacsContext } from '@/modules/macs/context/MacsContext';

const SectionPanel = () => {
  const { activeTabId, allTabs } = useMacsContext();

  const activeTab = allTabs.find((tab) => tab.id === activeTabId);

  if (!activeTab) {
    return (
      <div className='flex h-full items-center justify-center bg-gray-50'>
        <p className='f-14-450 text-gray-500'>Select a tab to view content</p>
      </div>
    );
  }

  switch (activeTab.type) {
    case 'capabilities':
      return <CapabilitiesSection />;
    case 'components':
      return <ComponentsSection />;
    default:
      return <GenericSection tab={activeTab} />;
  }
};

export default SectionPanel;
