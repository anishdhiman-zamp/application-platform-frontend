'use client';

import { cn } from '@zamp-platform/ui/utils';
import { useRouter } from 'next/navigation';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import SectionIconButton from '@/modules/pace/components/SectionIconButton';
import { SectionType } from '@/modules/pace/types';

interface MacsTopbarProps {
  className?: string;
  style?: React.CSSProperties;
}

const MacsTopbar = ({ className, style }: MacsTopbarProps) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        'bg-BG_GRAY_1 border-GRAY_400 flex h-8 items-center gap-x-1.5 overflow-visible border-b px-3',
        className,
      )}
      style={style}
    >
      <NewPaceIcons width={16} height={16} onClick={() => router.push(ROUTES_PATH.CHAT)} className='cursor-pointer' />

      <SectionIconButton section={SectionType.Skills} />
    </div>
  );
};

export default MacsTopbar;
