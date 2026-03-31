'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/toolkit';
import {
  buildTabRoute,
  getActiveTabIdFromUrl,
  getTabTypeFromUrl,
  isSameBasePath,
} from '@/modules/pace/components/dynamic-tabs/tab-type-registry';
import { DynamicTabType, NAV_METHOD, NavMethod, TAB_TYPE } from '@/modules/pace/pace.types';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';
import { store } from '@/store/index';
import { dynamicTabsActions } from '@/store/slices/dynamic-tabs.slice';

interface UseTabRouterConfig {
  type?: DynamicTabType;
}

interface UseTabRouterReturn {
  navigateTo: (path: string, method?: NavMethod, skipSidebarParam?: boolean) => void;
  navigateToTab: (tabId: string, tabType?: DynamicTabType) => void;
  syncFromUrl: () => void;
}

export const useTabRouter = (config: UseTabRouterConfig = {}): UseTabRouterReturn => {
  const { type } = config;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isMountedRef = useRef(false);

  const historyNavigate = useCallback((path: string, method: NavMethod = NAV_METHOD.PUSH, skipSidebarParam = false) => {
    const fullPath = skipSidebarParam ? path : preserveSidebarParam(path);

    if (method === NAV_METHOD.REPLACE) {
      window.history.replaceState(null, '', fullPath);
    } else {
      window.history.pushState(null, '', fullPath);
    }
  }, []);

  const routeNavigate = useCallback(
    (path: string, method: NavMethod = NAV_METHOD.PUSH, skipSidebarParam = false) => {
      const fullPath = skipSidebarParam ? path : preserveSidebarParam(path);

      if (method === NAV_METHOD.REPLACE) {
        router.replace(fullPath);
      } else {
        router.push(fullPath);
      }
    },
    [router],
  );

  const navigateTo = useCallback(
    (path: string, method: NavMethod = NAV_METHOD.PUSH, skipSidebarParam = false) => {
      if (!skipSidebarParam && isSameBasePath(path)) {
        historyNavigate(path, method, skipSidebarParam);
      } else {
        routeNavigate(path, method, skipSidebarParam);
      }
    },
    [historyNavigate, routeNavigate],
  );

  const navigateToTab = useCallback(
    (tabId: string, tabType?: DynamicTabType) => {
      const resolvedType = tabType ?? type ?? TAB_TYPE.FILE;
      const tabPath = buildTabRoute(tabId, resolvedType);

      dispatch(dynamicTabsActions.setActiveTab(tabId));
      navigateTo(tabPath);
    },
    [dispatch, navigateTo, type],
  );

  const syncFromUrl = useCallback(() => {
    const { pathname, search } = window.location;
    const urlTabId = getActiveTabIdFromUrl(pathname, search, type);

    if (!urlTabId) return;

    const urlTabType = type ?? getTabTypeFromUrl(pathname, search) ?? TAB_TYPE.FILE;
    const currentTabs = store.getState().dynamicTabs.tabs;
    const existingTab = currentTabs.find((t) => t.id === urlTabId);

    const urlParams = new URLSearchParams(search);
    const titleFromUrl = urlParams.get('title');

    if (!existingTab) {
      const fileName = titleFromUrl || urlTabId.split('/').pop() || urlTabId;
      const tabPath = buildTabRoute(urlTabId, urlTabType);

      dispatch(
        dynamicTabsActions.openTab({
          id: urlTabId,
          name: fileName,
          path: tabPath,
          type: urlTabType,
        }),
      );
    } else {
      dispatch(dynamicTabsActions.setActiveTab(urlTabId));

      if (titleFromUrl && existingTab.name !== titleFromUrl) {
        dispatch(
          dynamicTabsActions.updateTab({
            oldId: urlTabId,
            newTab: { ...existingTab, name: titleFromUrl },
          }),
        );
      }
    }
  }, [dispatch, type]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      syncFromUrl();
    }

    const handlePopState = () => {
      syncFromUrl();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [syncFromUrl]);

  return {
    navigateTo,
    navigateToTab,
    syncFromUrl,
  };
};
