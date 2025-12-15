'use client';

import { cn } from '@zamp-platform/ui/utils';
import AddTabMenu from '@/modules/macs/components/AddTabMenu';
import MacsTab from '@/modules/macs/components/MacsTab';
import SectionIconButton from '@/modules/macs/components/SectionIconButton';
import { useMacsContext } from '@/modules/macs/context/MacsContext';

interface MacsTopbarProps {
  className?: string;
  style?: React.CSSProperties;
}

const MacsTopbar = ({ className, style }: MacsTopbarProps) => {
  const { allTabs, openSections } = useMacsContext();

  const showCapabilitiesIcon = !openSections.includes('capabilities');
  const showComponentsIcon = !openSections.includes('components');

  return (
    <div className={cn('flex h-12 items-center gap-2 border-b border-gray-400 px-4', className)} style={style}>
      {/* Section icon buttons - only show if not open as tabs */}
      {showCapabilitiesIcon && <SectionIconButton section='capabilities' />}
      {showComponentsIcon && <SectionIconButton section='components' />}

      {/* Divider if we have tabs */}
      {allTabs.length > 0 && <div className='h-5 w-px bg-gray-400' />}

      {/* Tab bar */}
      <div className='flex items-center gap-2 overflow-x-auto'>
        {allTabs.map((tab) => (
          <MacsTab key={tab.id} tab={tab} />
        ))}
      </div>

      {/* Add button - always at the end */}
      <AddTabMenu />
    </div>
  );
};

export default MacsTopbar;
