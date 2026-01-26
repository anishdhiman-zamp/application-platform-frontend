'use client';

import { cn } from '@zamp-platform/ui/utils';
import { PaceNavbarItemId } from 'modules/pace/pace.types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PACE_NAVBAR_ITEMS } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

const PaceNavbar = () => {
  const pathname = usePathname();
  const { setIsPaceSidebarOpen, startNewChat } = usePaceContext();

  const onHomeClick = () => {
    setIsPaceSidebarOpen(false);
    startNewChat();
  };

  const isActive = (id: PaceNavbarItemId, path: string) => {
    if (id === PaceNavbarItemId.HOME) {
      return pathname === path;
    }

    return pathname?.includes(path) ?? false;
  };

  const handleClick = (id: PaceNavbarItemId) => {
    if (id === PaceNavbarItemId.HOME) {
      onHomeClick();
    }
  };

  return (
    <div className='flex h-9 items-center gap-x-1.5 overflow-visible px-2 py-1.5'>
      {PACE_NAVBAR_ITEMS.map((item) => (
        <Link
          key={item.id}
          href={item.path}
          className={cn(
            'text-GRAY_900 hover:text-GRAY_900 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg p-2 hover:bg-white',
            isActive(item.id, item.path) &&
              'border-GRAY_400 text-GRAY_1000 hover:text-GRAY_1000 shadow-tab-shadow border bg-white',
          )}
          role='button'
          tabIndex={0}
          onClick={() => handleClick(item.id)}
        >
          {item.iconComponent}
        </Link>
      ))}
    </div>
  );
};

export default PaceNavbar;
