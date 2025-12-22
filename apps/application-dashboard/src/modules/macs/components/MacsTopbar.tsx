'use client';

import { cn } from '@zamp-platform/ui/utils';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import SectionIconButton from '@/modules/macs/components/SectionIconButton';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { SectionType, ViewMode } from '@/modules/macs/types';

interface MacsTopbarProps {
  className?: string;
  style?: React.CSSProperties;
}

const MacsTopbar = ({ className, style }: MacsTopbarProps) => {
  const { viewMode } = useMacsContext();

  return (
    <div
      className={cn(
        'bg-BG_GRAY_1 border-GRAY_400 flex h-8 items-center gap-x-1.5 overflow-visible border-b px-3',
        className,
      )}
      style={style}
    >
      {viewMode !== ViewMode.Split && (
        <div className='text-GRAY_700 h-6 w-6 px-2 py-1'>
          <NewPaceIcons width={16} height={16} />
        </div>
      )}

      <SectionIconButton section={SectionType.Skills} />
    </div>
  );
};

export default MacsTopbar;
