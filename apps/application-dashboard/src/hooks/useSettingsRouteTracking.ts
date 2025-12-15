'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch } from '@/hooks/toolkit';
import { setLastVisitedRouteBeforeSettings, setLastVisitedSettingsRoute } from '@/store/slices/layout-configs';

/**
 * Hook to track navigation between settings and non-settings pages.
 * Stores the last visited route before entering settings and
 * the last visited settings route before leaving settings.
 */
export const useSettingsRouteTracking = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isSettingsPage = pathname?.startsWith(ROUTES_PATH.SETTINGS);
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    const wasOnSettingsPage = previousPath?.startsWith(ROUTES_PATH.SETTINGS);

    // Store the last non-settings route before entering settings
    if (isSettingsPage && previousPath && !wasOnSettingsPage) {
      dispatch(setLastVisitedRouteBeforeSettings(previousPath));
    }

    // Store the last settings route before leaving settings
    if (!isSettingsPage && previousPath && wasOnSettingsPage) {
      dispatch(setLastVisitedSettingsRoute(previousPath));
    }

    previousPathRef.current = pathname;
  }, [pathname, isSettingsPage, dispatch]);

  return { isSettingsPage };
};
