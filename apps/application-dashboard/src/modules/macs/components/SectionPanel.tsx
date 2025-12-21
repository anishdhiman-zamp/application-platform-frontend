'use client';

import SkillsSection from '@/modules/macs/components/skills/SkillsSection';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { SectionType } from '@/modules/macs/types';

const SectionPanel = () => {
  const { activeSection } = useMacsContext();

  if (activeSection === SectionType.Skills) {
    return <SkillsSection />;
  }

  return (
    <div className='flex h-full items-center justify-center bg-white'>
      <p className='f-14-450 text-gray-500'>Select a section to view content</p>
    </div>
  );
};

export default SectionPanel;
