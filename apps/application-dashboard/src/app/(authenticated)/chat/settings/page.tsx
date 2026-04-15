'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { PACE_SETTINGS_TABS } from '@/modules/pace/pace.constants';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

const VALID_SETTINGS_PATHS = new Set(PACE_SETTINGS_TABS.map((tab) => tab.path));

export default function Settings() {
  const router = useRouter();

  const handleRedirect = useCallback(() => {
    const lastTab = getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_SETTINGS_LAST_TAB);
    const target = lastTab && VALID_SETTINGS_PATHS.has(lastTab) ? lastTab : ROUTES_PATH.CHAT_SETTINGS_GENERAL;

    router.replace(target);
  }, [router]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  return null;
}
