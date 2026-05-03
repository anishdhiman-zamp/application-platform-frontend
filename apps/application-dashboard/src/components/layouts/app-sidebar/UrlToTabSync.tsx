'use client';

import { useEffect } from 'react';
import { useAppDispatch } from 'hooks/toolkit';
import { usePathname, useSearchParams } from 'next/navigation';
import { workspaceTabsActions } from '@/store/slices/workspace-tabs.slice';
import { routeToTab } from 'components/layouts/app-sidebar/utils/tab-routing';

const UrlToTabSync = () => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const resolved = routeToTab(pathname ?? null, searchParams ?? null);

    if (!resolved) return;

    dispatch(
      workspaceTabsActions.setActiveTab({
        tabId: resolved.tabId,
        kind: resolved.kind,
        instanceId: resolved.instanceId,
      }),
    );

    const subRoute = `${pathname ?? ''}${searchParams && searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    dispatch(workspaceTabsActions.setLastSubRoute({ tabId: resolved.tabId, subRoute }));
  }, [pathname, searchParams, dispatch]);

  return null;
};

export default UrlToTabSync;
