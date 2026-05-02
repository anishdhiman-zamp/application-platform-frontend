'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import { dynamicTabsActions, selectActiveTabId, selectDynamicTabs } from '@/store/slices/dynamic-tabs.slice';

interface UseTabRouterConfig {
  type?: DynamicTabType;
}

interface UseTabRouterReturn {
  navigateTo: (path: string, method?: NavMethod, skipSidebarParam?: boolean) => void;
  navigateToTab: (tabId: string, tabType?: DynamicTabType) => void;
  syncFromUrl: () => void;
}

// Track recently closed tab IDs to prevent syncFromUrl from re-creating them
// during async navigation transitions.
const recentlyClosedTabIds = new Set<string>();

export const markTabAsClosed = (id: string) => {
  recentlyClosedTabIds.add(id);
  // Auto-clear after 500ms — enough time for navigation to complete
  setTimeout(() => recentlyClosedTabIds.delete(id), 500);
};

// When paginating tasks (next/prev), we use router.replace() to update the URL
// without opening a new tab. But the tab router can't distinguish a replace from
// a push just by looking at the URL change. So we use a simple signal:
//
// 1. Before calling router.replace(), call markNavAsReplace() to set the flag.
// 2. When the tab router processes the URL change, it calls consumeNavReplaceFlag().
//    - If true → update the active tab in-place (pagination behavior).
//    - If false → open a new tab (default behavior).
//
// This is a counter (not a boolean) so rapid clicks (next → next → next) don't
// lose intermediate signals before the tab router has a chance to consume them.
let pendingReplaceCount = 0;

export const markNavAsReplace = () => {
  pendingReplaceCount++;
};

export const consumeNavReplaceFlag = (): boolean => {
  if (pendingReplaceCount > 0) {
    pendingReplaceCount--;

    return true;
  }

  return false;
};

export const useTabRouter = (config: UseTabRouterConfig = {}): UseTabRouterReturn => {
  const { type } = config;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isMountedRef = useRef(false);
  const nextPathname = usePathname();
  const nextSearchParams = useSearchParams();

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

    const currentTabs = selectDynamicTabs(store.getState());
    const currentTab = currentTabs.find((t) => t.id === currentTabId);

    if (!currentTab) return;

    const fullPath = `${pathname}${search}`;

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
      const currentTabs = selectDynamicTabs(store.getState());
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
    const currentTabs = selectDynamicTabs(store.getState());
    const existingTab = currentTabs.find((t) => t.id === urlTabId);

    const urlParams = new URLSearchParams(search);
    const titleFromUrl = urlParams.get('title');

    if (!existingTab) {
      // Don't re-create a tab that was just intentionally closed
      if (recentlyClosedTabIds.has(urlTabId)) return;

      const fileName = titleFromUrl || urlTabId.split('/').pop() || urlTabId;
      // Store full path with query params so subtask navigation state
      // (parentTasks, siblings, pagination) survives tab switches.
      const tabPath = search ? `${pathname}${search}` : buildTabRoute(urlTabId, urlTabType);

      // If this navigation was a replace (e.g., task pagination), update the active
      // tab in-place instead of opening a new one. This keeps pagination within a
      // single tab while still creating new tabs for explicit opens (router.push).
      const wasReplace = consumeNavReplaceFlag();
      const activeTabId = selectActiveTabId(store.getState());
      const activeTab = activeTabId ? currentTabs.find((t) => t.id === activeTabId) : null;

      if (wasReplace && activeTab && (activeTab.type ?? TAB_TYPE.FILE) === urlTabType) {
        dispatch(
          dynamicTabsActions.updateTab({
            oldId: activeTab.id,
            newTab: {
              id: urlTabId,
              name: fileName,
              path: tabPath,
              type: urlTabType,
              metadata: activeTab.metadata,
            },
          }),
        );
      } else {
        dispatch(
          dynamicTabsActions.openTab({
            id: urlTabId,
            name: fileName,
            path: tabPath,
            type: urlTabType,
          }),
        );
      }
    } else {
      // Update stored path if URL has richer params than what's stored
      const fullPath = search ? `${pathname}${search}` : existingTab.path;

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

  // Sync tabs when Next.js detects URL changes (covers router.push/replace
  // within the same page, which don't trigger popstate or remount).
  useEffect(() => {
    if (!isMountedRef.current) return;

    syncFromUrl();
  }, [nextPathname, nextSearchParams, syncFromUrl]);

  return {
    navigateTo,
    navigateToTab,
    syncFromUrl,
  };
};
