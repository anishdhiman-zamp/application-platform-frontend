'use client';

import CapabilitiesSection from '@/modules/macs/components/sections/CapabilitiesSection';
import ComponentsSection from '@/modules/macs/components/sections/ComponentsSection';
import GenericSection from '@/modules/macs/components/sections/GenericSection';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { SectionType } from '@/modules/macs/types';

const SectionPanel = () => {
  const { openSections, activeTabId, allTabs } = useMacsContext();

  if (openSections.includes(SectionType.Capabilities)) {
    return <CapabilitiesSection />;
  }

  if (openSections.includes(SectionType.Components)) {
    return <ComponentsSection />;
  }

  const activeTab = allTabs.find((tab) => tab.id === activeTabId);

  if (activeTab) {
    return <GenericSection tab={activeTab} />;
  }

  return (
    <div className='flex h-full items-center justify-center bg-white'>
      <p className='f-14-450 text-gray-500'>Select a section or tab to view content</p>
    </div>
  );
};

export default SectionPanel;
