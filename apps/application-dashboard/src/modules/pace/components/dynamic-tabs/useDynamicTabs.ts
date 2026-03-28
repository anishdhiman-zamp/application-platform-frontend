'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { flushSync } from 'react-dom';
import { getNextNavigationTarget, NAVIGATION_STRATEGY } from '@zamp-platform/utils';
import {
  buildTabRoute,
  getActiveTabIdFromUrl,
  isSameBasePath,
} from 'modules/pace/components/dynamic-tabs/tab-registry';
import { preserveSidebarParam } from 'modules/pace/pace.utils';
import { useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useSyncedPathname, useSyncedUrlParam } from '@/modules/pace/hooks/useSyncedSearchParam';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, DynamicTab, DynamicTabType, TAB_TYPE } from '@/modules/pace/pace.types';
interface UseDynamicTabsConfig {
  type?: DynamicTabType;
  onTabClose?: (id: string) => void;
  onTabUpdate?: (oldId: string, newId: string) => void;
  onFolderMove?: (oldFolderPath: string, newFolderPath: string) => void;
}

interface UseDynamicTabsReturn {
  tabs: DynamicTab[];
  activeTab: DynamicTab | null;
  isHydrated: boolean;

  openTab: (id: string, name: string, metadata?: Record<string, unknown>) => void;
  closeTab: (e: React.MouseEvent, id: string) => void;
  closeTabsForPath: (path: string, isFolder: boolean) => void;
  updateTab: (oldId: string, newId: string, newName: string) => void;
  updateTabsForFolderMove: (oldFolderPath: string, newFolderPath: string) => void;

  closeOtherTabs: (id: string) => void;
  closeTabsToRight: (id: string) => void;
  closeAllTabs: () => void;

  navigateToTab: (tab: DynamicTab) => void;
  reorderTabs: (newOrder: string[]) => void;
  isTabActive: (tab: DynamicTab) => boolean;
  getTabById: (id: string) => DynamicTab | undefined;
  getTabIndex: (id: string) => number;
  hasOpenTabs: () => boolean;
  isOnAnyDynamicTab: () => boolean;
}

export const useDynamicTabs = (config: UseDynamicTabsConfig = {}): UseDynamicTabsReturn => {
  const { type, onTabClose, onTabUpdate, onFolderMove } = config;

  const router = useRouter();
  const syncedPathname = useSyncedPathname();
  const fParam = useSyncedUrlParam('f');

  const {
    dynamicTabs: allTabs,
    isDynamicTabsHydrated: isHydrated,
    openDynamicTab,
    closeDynamicTab,
    updateDynamicTab,
    reorderDynamicTabs,
    chatSidebarState,
    setChatSidebarState,
  } = usePaceContext();

  const tabs = useMemo(() => {
    if (!type) return allTabs;

    return allTabs.filter((tab) => (tab.type ?? TAB_TYPE.FILE) === type);
  }, [allTabs, type]);

  const tabMaps = useMemo(() => {
    const byId = new Map<string, DynamicTab>();

    for (const tab of tabs) {
      byId.set(tab.id, tab);
    }

    return { byId };
  }, [tabs]);
  const tabMapsRef = useRef(tabMaps);

  tabMapsRef.current = tabMaps;

  const activeTabId = useMemo(
    () => getActiveTabIdFromUrl(syncedPathname, fParam ? `?f=${fParam}` : ''),
    [syncedPathname, fParam],
  );

  const activeTab = useMemo(() => {
    if (!isHydrated || !activeTabId) return null;

    return tabMaps.byId.get(activeTabId) ?? null;
  }, [isHydrated, activeTabId, tabMaps.byId]);

  const isTabActive = useCallback(
    (tab: DynamicTab) => {
      if (!activeTabId) return false;

      return tab.id === activeTabId;
    },
    [activeTabId],
  );

  const isOnAnyDynamicTab = useCallback(() => {
    if (!activeTabId) return false;

    // Check across all tabs (not just the filtered subset)
    return allTabs.some((tab) => tab.id === activeTabId);
  }, [allTabs, activeTabId]);

  const getTabById = useCallback(
    (id: string) => {
      return tabMaps.byId.get(id);
    },
    [tabMaps],
  );

  const getTabIndex = useCallback(
    (id: string) => {
      return tabs.findIndex((tab) => tab.id === id);
    },
    [tabs],
  );

  const hasOpenTabs = useCallback(() => {
    return tabs.length > 0;
  }, [tabs]);

  // --- Navigation helpers ---

  /**
   * Synchronous URL update via History API — no Next.js transition, no flash.
   * Use for same-layout tab switches where the content is already mounted.
   */
  const historyNavigate = useCallback((path: string, method: 'push' | 'replace' = 'push') => {
    if (method === 'replace') {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
  }, []);

  /**
   * Full Next.js navigation — triggers route transition.
   * Use for cross-layout navigations (e.g., /chat → /chat/task/:id).
   */
  const routeNavigate = useCallback(
    (path: string, method: 'push' | 'replace' = 'push') => {
      if (method === 'replace') {
        router.replace(path);
      } else {
        router.push(path);
      }
    },
    [router],
  );

  /**
   * Picks the right navigation strategy: synchronous History API when staying
   * on the same base path (same layout), full router navigation otherwise.
   */
  const navigateTo = useCallback(
    (path: string, method: 'push' | 'replace' = 'push') => {
      if (isSameBasePath(path)) {
        historyNavigate(path, method);
      } else {
        routeNavigate(path, method);
      }
    },
    [historyNavigate, routeNavigate],
  );

  const navigateToTab = useCallback(
    (tab: DynamicTab) => {
      const tabPath = preserveSidebarParam(tab.path);
      const stayingOnSameBase = isSameBasePath(tabPath);

      if (chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED && stayingOnSameBase) {
        setChatSidebarState(CHAT_SIDEBAR_STATE.COLLAPSED);
      }

      navigateTo(tabPath);
    },
    [chatSidebarState, setChatSidebarState, navigateTo],
  );

  const openTab = useCallback(
    (id: string, name: string, metadata?: Record<string, unknown>) => {
      const tabType = type ?? TAB_TYPE.FILE;
      const tabPath = buildTabRoute(id, tabType);

      openDynamicTab({
        id,
        name,
        path: tabPath,
        type: tabType,
        metadata,
      });

      navigateTo(tabPath);
    },
    [openDynamicTab, navigateTo, type],
  );

  const closeTab = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      const closingTab = tabs.find((tab) => tab.id === id);

      if (!closingTab) return;

      const isClosingActiveTab = closingTab.id === activeTabId;

      onTabClose?.(closingTab.id);

      let targetPath: string | null = null;

      if (isClosingActiveTab) {
        const { target, hasRemainingItems } = getNextNavigationTarget({
          items: tabs,
          closingItem: closingTab,
          isEqual: (a, b) => a.id === b.id,
          strategy: NAVIGATION_STRATEGY.BROWSER_LIKE,
        });

        const chatFallback = preserveSidebarParam(ROUTES_PATH.CHAT);

        targetPath = hasRemainingItems && target ? preserveSidebarParam(target.path) : chatFallback;
      }

      flushSync(() => {
        closeDynamicTab(closingTab.id);
      });

      if (targetPath) {
        navigateTo(targetPath);
      }
    },
    [tabs, activeTabId, closeDynamicTab, onTabClose, navigateTo],
  );

  const closeTabsForPath = useCallback(
    (path: string, isFolder: boolean) => {
      const folderPathPrefix = `${path}/`;

      const tabsToClose = isFolder
        ? tabs.filter((tab) => tab.id === path || tab.id.startsWith(folderPathPrefix))
        : tabs.filter((tab) => tab.id === path);

      if (tabsToClose.length === 0) return;

      const activeTabToClose = tabsToClose.find((tab) => tab.id === activeTabId);

      tabsToClose.forEach((tab) => {
        onTabClose?.(tab.id);
      });

      let targetPath: string | null = null;

      if (activeTabToClose) {
        const { target, hasRemainingItems } = getNextNavigationTarget({
          items: tabs,
          closingItem: activeTabToClose,
          isEqual: (a, b) => a.id === b.id,
          strategy: NAVIGATION_STRATEGY.BROWSER_LIKE,
        });

        const chatFallback = preserveSidebarParam(ROUTES_PATH.CHAT);

        targetPath = hasRemainingItems && target ? preserveSidebarParam(target.path) : chatFallback;
      }

      flushSync(() => {
        tabsToClose.forEach((tab) => {
          closeDynamicTab(tab.id);
        });
      });

      if (targetPath) {
        navigateTo(targetPath);
      }
    },
    [tabs, activeTabId, closeDynamicTab, onTabClose, navigateTo],
  );

  const updateTab = useCallback(
    (oldId: string, newId: string, newName: string) => {
      const tabToUpdate = tabs.find((tab) => tab.id === oldId);

      if (!tabToUpdate) return;

      const newTabPath = buildTabRoute(newId, tabToUpdate.type);
      const isCurrentlyActive = activeTabId === oldId;

      onTabUpdate?.(oldId, newId);

      updateDynamicTab(oldId, {
        id: newId,
        name: newName,
        path: newTabPath,
        type: tabToUpdate.type,
        metadata: tabToUpdate.metadata,
      });

      if (isCurrentlyActive) {
        navigateTo(newTabPath, 'replace');
      }
    },
    [tabs, activeTabId, updateDynamicTab, onTabUpdate, navigateTo],
  );

  const updateTabsForFolderMove = useCallback(
    (oldFolderPath: string, newFolderPath: string) => {
      const oldPrefix = oldFolderPath + '/';
      let activeTabNewPath: string | null = null;

      onFolderMove?.(oldFolderPath, newFolderPath);

      tabs.forEach((tab) => {
        if (tab.id === oldFolderPath || tab.id.startsWith(oldPrefix)) {
          const newTabId =
            tab.id === oldFolderPath ? newFolderPath : newFolderPath + tab.id.slice(oldFolderPath.length);
          const newName = newTabId.split('/').pop() || tab.name;
          const newTabPath = buildTabRoute(newTabId, tab.type);

          if (tab.id === activeTabId) {
            activeTabNewPath = newTabPath;
          }

          updateDynamicTab(tab.id, {
            id: newTabId,
            name: newName,
            path: newTabPath,
            type: tab.type,
            metadata: tab.metadata,
          });
        }
      });

      if (activeTabNewPath) {
        navigateTo(activeTabNewPath, 'replace');
      }
    },
    [tabs, activeTabId, updateDynamicTab, onFolderMove, navigateTo],
  );

  // --- Navbar-level operations (work on ALL tabs) ---

  const closeOtherTabs = useCallback(
    (id: string) => {
      const tabToKeep = allTabs.find((tab) => tab.id === id);

      if (!tabToKeep) return;

      const tabsToClose = allTabs.filter((tab) => tab.id !== id);
      const shouldNavigate = activeTabId !== id;

      flushSync(() => {
        tabsToClose.forEach((tab) => {
          closeDynamicTab(tab.id);
        });
      });

      if (shouldNavigate) {
        navigateTo(preserveSidebarParam(tabToKeep.path));
      }
    },
    [allTabs, activeTabId, closeDynamicTab, navigateTo],
  );

  const closeTabsToRight = useCallback(
    (id: string) => {
      const tabIndex = allTabs.findIndex((tab) => tab.id === id);

      if (tabIndex === -1) return;

      const tabsToClose = allTabs.slice(tabIndex + 1);

      let targetPath: string | null = null;

      if (activeTabId) {
        const activeTabIndex = allTabs.findIndex((tab) => tab.id === activeTabId);

        if (activeTabIndex > tabIndex) {
          targetPath = preserveSidebarParam(allTabs[tabIndex].path);
        }
      }

      flushSync(() => {
        tabsToClose.forEach((tab) => {
          closeDynamicTab(tab.id);
        });
      });

      if (targetPath) {
        navigateTo(targetPath);
      }
    },
    [allTabs, activeTabId, closeDynamicTab, navigateTo],
  );

  const closeAllTabs = useCallback(() => {
    flushSync(() => {
      allTabs.forEach((tab) => {
        closeDynamicTab(tab.id);
      });
    });

    navigateTo(preserveSidebarParam(ROUTES_PATH.CHAT));
  }, [allTabs, closeDynamicTab, navigateTo]);

  const reorderTabs = useCallback(
    (newOrder: string[]) => {
      reorderDynamicTabs(newOrder);
    },
    [reorderDynamicTabs],
  );

  // --- URL sync for browser back/forward and tab auto-registration ---
  // Same-layout tab switches use window.history directly (bypassing Next.js router),
  // so we listen to popstate to auto-register tabs that arrive via deep-link or back/forward.

  useEffect(() => {
    if (!isHydrated || !type) return;

    const syncFromUrl = () => {
      const { pathname: currentPathname, search: currentSearch } = window.location;
      const currentUrlTabId = getActiveTabIdFromUrl(currentPathname, currentSearch, type);

      if (!currentUrlTabId) return;

      const urlParams = new URLSearchParams(currentSearch);
      const titleFromUrl = urlParams.get('title');
      const existingTab = tabMapsRef.current.byId.get(currentUrlTabId);

      if (!existingTab) {
        const fileName = titleFromUrl || currentUrlTabId.split('/').pop() || currentUrlTabId;
        const tabPath = buildTabRoute(currentUrlTabId, type);

        openDynamicTab({
          id: currentUrlTabId,
          name: fileName,
          path: tabPath,
          type,
        });
      } else if (titleFromUrl && existingTab.name !== titleFromUrl) {
        updateDynamicTab(currentUrlTabId, {
          ...existingTab,
          name: titleFromUrl,
        });
      }
    };

    // Initial sync on mount
    syncFromUrl();

    window.addEventListener('popstate', syncFromUrl);

    return () => {
      window.removeEventListener('popstate', syncFromUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, type]);

  return {
    tabs,
    activeTab,
    isHydrated,

    openTab,
    closeTab,
    closeTabsForPath,
    updateTab,
    updateTabsForFolderMove,

    closeOtherTabs,
    closeTabsToRight,
    closeAllTabs,

    navigateToTab,
    reorderTabs,
    isTabActive,
    getTabById,
    getTabIndex,
    hasOpenTabs,
    isOnAnyDynamicTab,
  };
};
