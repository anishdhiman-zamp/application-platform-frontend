'use client';

import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import AddTabMenu from '@/modules/macs/components/AddTabMenu';
import MacsTab from '@/modules/macs/components/MacsTab';
import SectionIconButton from '@/modules/macs/components/SectionIconButton';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { SectionType } from '@/modules/macs/types';

interface MacsTopbarProps {
  className?: string;
  style?: React.CSSProperties;
}

const MacsTopbar = ({ className, style }: MacsTopbarProps) => {
  const { tabs, resetToDefault } = useMacsContext();

  return (
    <div
      className={cn(
        'bg-BG_GRAY_1 border-GRAY_400 flex h-12 items-center gap-x-1.5 overflow-visible border-b px-3',
        className,
      )}
      style={style}
    >
      <Button
        variant='ghost'
        size='icon'
        className='text-GRAY_700 h-8 w-8 px-2 py-1 hover:text-gray-900'
        onClick={resetToDefault}
      >
        <NewPaceIcons width={16} height={16} />
      </Button>
      <SectionIconButton section={SectionType.Skills} />
      <SectionIconButton section={SectionType.Components} />

      <div className='flex h-full items-end gap-2 overflow-visible'>
        {tabs.map((tab) => (
          <MacsTab key={tab.id} tab={tab} />
        ))}
      </div>

      <AddTabMenu />
    </div>
  );
};

export default MacsTopbar;
