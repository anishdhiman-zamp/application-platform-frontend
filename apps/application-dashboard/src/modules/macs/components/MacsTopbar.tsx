'use client';

import { cn } from '@zamp-platform/ui/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import { ROUTES_PATH } from '@/constants/routeConfig';
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
        <Link
          href={ROUTES_PATH.PROCESSES}
          className='hover:bg-GRAY_200 hover:text-GRAY_900 text-GRAY_700 flex h-6 w-6 items-center justify-center rounded-md transition-colors'
          title='Back to Processes'
        >
          <ArrowLeft size={14} />
        </Link>
      )}
      {viewMode !== ViewMode.Split && <NewPaceIcons width={16} height={16} />}

      <SectionIconButton section={SectionType.Skills} />
    </div>
  );
};

export default MacsTopbar;
