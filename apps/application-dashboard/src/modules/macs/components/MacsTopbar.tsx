'use client';

import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { useRouter } from 'next/navigation';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import SectionIconButton from '@/modules/macs/components/SectionIconButton';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { SectionType } from '@/modules/macs/types';

interface MacsTopbarProps {
  className?: string;
  style?: React.CSSProperties;
}

const MacsTopbar = ({ className, style }: MacsTopbarProps) => {
  const router = useRouter();
  const { resetToDefault } = useMacsContext();

  return (
    <div
      className={cn(
        'bg-BG_GRAY_1 border-GRAY_400 flex h-8 items-center gap-x-1.5 overflow-visible border-b px-3',
        className,
      )}
      style={style}
    >
      <Button
        variant='ghost'
        size='icon'
        className='text-GRAY_700 h-6 w-6 px-2 py-1 hover:text-gray-900'
        onClick={() => {
          resetToDefault();
          router.push(ROUTES_PATH.CHAT);
        }}
        title='Start new chat'
      >
        <NewPaceIcons width={16} height={16} />
      </Button>

      <SectionIconButton section={SectionType.Skills} />
    </div>
  );
};

export default MacsTopbar;
