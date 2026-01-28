'use client';

import { cn } from '@zamp-platform/ui/utils';
import DynamicTabItem from 'modules/pace/components/layout/DynamicTabItem';
import { PaceNavbarItemId } from 'modules/pace/pace.types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDynamicTabs } from '@/modules/pace/hooks/useDynamicTabs';
import { PACE_NAVBAR_ITEMS } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

const PaceNavbar = () => {
  const pathname = usePathname();
  const { setIsPaceSidebarOpen, startNewChat } = usePaceContext();
  const { dynamicTabs, isDynamicTabActive, isOnAnyDynamicTab, handleCloseDynamicTab, setTabRef } = useDynamicTabs();

  const onHomeClick = () => {
    setIsPaceSidebarOpen(false);
    startNewChat();
  };

  const isNavItemActive = (id: PaceNavbarItemId, path: string) => {
    if (id === PaceNavbarItemId.HOME) {
      return pathname === path;
    }

    if (id === PaceNavbarItemId.ARTIFACTS) {
      if (isOnAnyDynamicTab()) return false;
    }

    return pathname?.includes(path) ?? false;
  };

  const handleNavItemClick = (id: PaceNavbarItemId) => {
    if (id === PaceNavbarItemId.HOME) {
      onHomeClick();
    }
  };

  return (
    <div className='flex h-9 items-center gap-x-2 overflow-hidden px-2 py-1.5'>
      {/* Static navbar items */}
      <div className='flex shrink-0 items-center gap-x-2'>
        {PACE_NAVBAR_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.path}
            className={cn(
              'text-GRAY_900 hover:text-GRAY_900 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg p-2 hover:bg-white',
              isNavItemActive(item.id, item.path) &&
                'border-GRAY_400 text-GRAY_1000 hover:text-GRAY_1000 shadow-tab-shadow border bg-white',
            )}
            role='button'
            tabIndex={0}
            onClick={() => handleNavItemClick(item.id)}
          >
            {item.iconComponent}
          </Link>
        ))}
      </div>

      {dynamicTabs.length > 0 && <div className='bg-GRAY_300 mx-1 h-4 w-px shrink-0' />}

      {dynamicTabs.length > 0 && (
        <div className='flex min-w-0 flex-1 items-center gap-x-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          {dynamicTabs.map((tab) => (
            <DynamicTabItem
              key={tab.id}
              tab={tab}
              isActive={isDynamicTabActive(tab.path)}
              onClose={handleCloseDynamicTab}
              tabRef={setTabRef(tab.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PaceNavbar;
