'use client';

import { Button } from '@zamp-platform/ui';
import { Puzzle, Shapes } from 'lucide-react';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import type { SectionType } from '@/modules/macs/types';

interface SectionIconButtonProps {
  section: SectionType;
}

const SECTION_ICONS: Record<SectionType, React.ComponentType<{ size?: number; className?: string }>> = {
  capabilities: Puzzle,
  components: Shapes,
};

const SectionIconButton = ({ section }: SectionIconButtonProps) => {
  const { toggleSection, openSections } = useMacsContext();
  const Icon = SECTION_ICONS[section];
  const isOpen = openSections.includes(section);

  // Don't render if section is already open as a tab
  if (isOpen) {
    return null;
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      className='h-8 w-8 text-gray-600 hover:text-gray-900'
      onClick={() => toggleSection(section)}
    >
      <Icon size={20} />
    </Button>
  );
};

export default SectionIconButton;
