'use client';

import { memo, useCallback, useMemo } from 'react';
import { PaceNavbarItemId } from 'modules/pace/pace.types';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import OrgSwitcher from '@/components/layouts/dashboard-layout/components/OrgSwitcher';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { PACE_SETTINGS_TABS } from '@/modules/pace/pace.constants';
import SidebarTab from 'components/layouts/dashboard-layout/components/SidebarTab';

const PaceSettingsSidebar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isEnabled: isDarkModeEnabled } = useFeatureFlag(FEATURE_FLAGS.DARK_MODE);

  const tabs = useMemo(
    () => PACE_SETTINGS_TABS.filter((tab) => tab.id !== PaceNavbarItemId.GENERAL || isDarkModeEnabled),
    [isDarkModeEnabled],
  );

  const getHref = useCallback(
    (path: string) => {
      const sParam = searchParams?.get('s');

      if (sParam) {
        return `${path}?s=${sParam}`;
      }

      return path;
    },
    [searchParams],
  );

  return (
    <div className='bg-BACKGROUND_GRAY_1 border-GRAY_400 flex h-full w-60 flex-col border-r'>
      <div className='flex flex-1 flex-col gap-y-[2px] px-2 pt-2 pb-4'>
        {tabs.map((item) => (
          <Link prefetch href={getHref(item.path)} key={item.id} className='cursor-pointer'>
            <SidebarTab
              name={item.name}
              iconComponent={item.iconComponent}
              isSelected={pathname?.includes(item.path)}
            />
          </Link>
        ))}
      </div>

      <div className='mt-auto'>
        <OrgSwitcher isSidebarOpen={true} />
      </div>
    </div>
  );
};

export default memo(PaceSettingsSidebar);
