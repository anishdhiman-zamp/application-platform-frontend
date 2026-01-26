'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/layouts/dashboard-layout/components/LogoutButton';
import { PACE_SETTINGS_TABS } from '@/modules/pace/pace.constants';
import SidebarTab from 'components/layouts/dashboard-layout/components/SidebarTab';

const PaceSettingsSidebar = () => {
  const pathname = usePathname();

  return (
    <div className='bg-BACKGROUND_GRAY_1 border-GRAY_400 flex h-full w-60 flex-col border-r'>
      {/* Settings tabs */}
      <div className='flex flex-1 flex-col gap-y-[2px] px-2 pt-2 pb-4'>
        {PACE_SETTINGS_TABS.map((item) => (
          <Link prefetch href={item.path} key={item.id} className='cursor-pointer'>
            <SidebarTab
              name={item.name}
              iconComponent={item.iconComponent}
              isSelected={pathname?.includes(item.path)}
            />
          </Link>
        ))}
      </div>

      {/* Logout button */}
      <LogoutButton className='border-GRAY_400 border-t px-2 py-3' />
    </div>
  );
};

export default memo(PaceSettingsSidebar);
