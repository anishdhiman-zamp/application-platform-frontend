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
  const { setFullPageSection, fullPageSection } = useMacsContext();
  const Icon = SECTION_ICONS[section];
  const isActive = fullPageSection === section;

  return (
    <Button
      variant='ghost'
      size='icon'
      className={`h-8 w-8 text-gray-600 hover:text-gray-900 ${isActive ? 'bg-gray-200' : ''}`}
      onClick={() => setFullPageSection(isActive ? null : section)}
    >
      <Icon size={12} />
    </Button>
  );
};

export default SectionIconButton;
