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
import { store } from '@/store';
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

  // Update the current tab's stored path with the full URL (including query params)
  // before navigating away, so the path is preserved for when we switch back.
  const saveCurrentTabPath = useCallback(() => {
    const { pathname, search } = window.location;
    const currentTabId = getActiveTabIdFromUrl(pathname, search);

    if (!currentTabId || !search) return;

    const currentTabs = store.getState().dynamicTabs.tabs;
    const currentTab = currentTabs.find((t) => t.id === currentTabId);

    if (!currentTab) return;

    // Use the tab's own type (not the hook's configured type) to build the correct base path
    const fullPath = `${buildTabRoute(currentTabId, currentTab.type)}${search}`;

    if (currentTab.path !== fullPath) {
      dispatch(
        dynamicTabsActions.updateTab({
          oldId: currentTabId,
          newTab: { ...currentTab, path: fullPath },
        }),
      );
    }
  }, [dispatch]);

  const navigateTo = useCallback(
    (path: string, method: NavMethod = NAV_METHOD.PUSH, skipSidebarParam = false) => {
      saveCurrentTabPath();

      if (!skipSidebarParam && isSameBasePath(path)) {
        historyNavigate(path, method, skipSidebarParam);
      } else {
        routeNavigate(path, method, skipSidebarParam);
      }
    },
    [historyNavigate, routeNavigate, saveCurrentTabPath],
  );

  const navigateToTab = useCallback(
    (tabId: string, tabType?: DynamicTabType) => {
      const resolvedType = tabType ?? type ?? TAB_TYPE.FILE;

      // Use the tab's stored path (which includes query params from PACE_OPEN_DYNAMIC_TABS)
      const currentTabs = store.getState().dynamicTabs.tabs;
      const existingTab = currentTabs.find((t) => t.id === tabId);
      const tabPath = existingTab?.path ?? buildTabRoute(tabId, resolvedType);

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
      // Store full path with query params so subtask navigation state
      // (parentTasks, siblings, pagination) survives tab switches.
      const tabPath = search ? `${buildTabRoute(urlTabId, urlTabType)}${search}` : buildTabRoute(urlTabId, urlTabType);

      dispatch(
        dynamicTabsActions.openTab({
          id: urlTabId,
          name: fileName,
          path: tabPath,
          type: urlTabType,
        }),
      );
    } else {
      // Update stored path if URL has richer params than what's stored
      const fullPath = search ? `${buildTabRoute(urlTabId, urlTabType)}${search}` : existingTab.path;

      if (fullPath !== existingTab.path && search) {
        dispatch(
          dynamicTabsActions.updateTab({
            oldId: urlTabId,
            newTab: { ...existingTab, path: fullPath },
          }),
        );
      }

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
      saveCurrentTabPath();
      syncFromUrl();
    }

    const handlePopState = () => {
      saveCurrentTabPath();
      syncFromUrl();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [syncFromUrl, saveCurrentTabPath]);

  return {
    navigateTo,
    navigateToTab,
    syncFromUrl,
  };
};
