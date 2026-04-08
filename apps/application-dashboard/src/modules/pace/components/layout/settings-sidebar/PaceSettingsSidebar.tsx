'use client';

import { memo, useCallback, useMemo } from 'react';
import { PaceNavbarItemId } from 'modules/pace/pace.types';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import LogoutButton from '@/components/layouts/dashboard-layout/components/LogoutButton';
import OrgSwitcher from '@/components/layouts/dashboard-layout/components/OrgSwitcher';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { PACE_SETTINGS_TABS, SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';
import SidebarTab from 'components/layouts/dashboard-layout/components/SidebarTab';

const PaceSettingsSidebar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isEnabled: isOrgSettingsEnabled } = useFeatureFlag(FEATURE_FLAGS.ORG_SETTINGS);

  const tabs = useMemo(
    () =>
      PACE_SETTINGS_TABS.filter((tab) => {
        if (tab.id === PaceNavbarItemId.ORG_SETTINGS && !isOrgSettingsEnabled) return false;

        return true;
      }),
    [isOrgSettingsEnabled],
  );

  const getHref = useCallback(
    (path: string) => {
      const sParam = searchParams?.get(SIDEBAR_CONVERSATION_ID_PARAM);

      if (sParam) {
        return `${path}?s=${sParam}`;
      }

      return path;
    },
    [searchParams],
  );

  return (
    <div className='bg-BG_GRAY_1 border-GRAY_400 flex h-full w-60 flex-col border-r'>
      <OrgSwitcher isSidebarOpen={true} macs />
      <div className='flex flex-1 flex-col px-2 pt-2 pb-4'>
        {tabs.map((item) => (
          <div key={item.id}>
            {item?.heading && <p className='text-GRAY_700 f-11-450 px-2 pt-3 pb-1'>{item?.heading}</p>}
            <Link prefetch href={getHref(item.path)} className='cursor-pointer'>
              <SidebarTab
                name={item.name}
                iconComponent={item.iconComponent}
                isSelected={pathname?.includes(item.path)}
              />
            </Link>
          </div>
        ))}
      </div>
      <LogoutButton className='px-1.5 py-2' macs />
    </div>
  );
};

export default memo(PaceSettingsSidebar);
