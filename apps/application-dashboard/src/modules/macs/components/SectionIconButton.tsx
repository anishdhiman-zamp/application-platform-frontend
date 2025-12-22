'use client';

import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { SECTION_ICONS } from 'modules/macs/constants';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { SectionType } from '@/modules/macs/types';

interface SectionIconButtonProps {
  section: SectionType;
}

const SectionIconButton = ({ section }: SectionIconButtonProps) => {
  const { toggleSection, activeSection } = useMacsContext();
  const Icon = SECTION_ICONS[section];
  const isActive = activeSection === section;

  return (
    <Button
      variant='ghost'
      size='icon'
      className={cn('h-6 w-6 text-gray-600 hover:text-gray-900', isActive && 'bg-gray-200')}
      onClick={() => toggleSection(section)}
    >
      <Icon size={12} />
    </Button>
  );
};

export default SectionIconButton;
