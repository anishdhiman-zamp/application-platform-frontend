'use client';

import GenericSection from '@/modules/macs/components/sections/GenericSection';
import SkillsSection from '@/modules/macs/components/sections/SkillsSection';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { SectionType } from '@/modules/macs/types';

const SectionPanel = () => {
  const { activeSection, activeTabId, tabs } = useMacsContext();

  if (activeSection === SectionType.Skills) {
    return <SkillsSection />;
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

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
