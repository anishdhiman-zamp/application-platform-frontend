'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { PACE_SETTINGS_TABS } from '@/modules/pace/pace.constants';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';
import { getFromSessionStorage, SESSION_STORAGE_KEYS } from '@/utils/sessionstorage';

const VALID_SETTINGS_PATHS = new Set(PACE_SETTINGS_TABS.map((tab) => tab.path));

export default function Settings() {
  const router = useRouter();

  const handleRedirect = useCallback(() => {
    // One-time cleanup: migration shim from localStorage → sessionStorage (2026-04-16).
    // Safe to remove after 2026-07-16 — by then all active users will have visited this page and had the stale key cleared.
    window.localStorage?.removeItem('PACE_SETTINGS_LAST_TAB');

    const lastTab = getFromSessionStorage(SESSION_STORAGE_KEYS.PACE_SETTINGS_LAST_TAB);
    const target = lastTab && VALID_SETTINGS_PATHS.has(lastTab) ? lastTab : ROUTES_PATH.CHAT_SETTINGS_GENERAL;

    router.replace(preserveSidebarParam(target));
  }, [router]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  return null;
}
