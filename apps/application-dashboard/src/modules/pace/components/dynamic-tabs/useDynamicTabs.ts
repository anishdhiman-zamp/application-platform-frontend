'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { getNextNavigationTarget, NAVIGATION_STRATEGY } from '@zamp-platform/utils';
import {
  buildTabRoute,
  getActiveTabIdFromAllConfigsUrl,
  getActiveTabIdFromUrl,
  getTabFallbackPath,
  isOnAnyTabBasePath,
  isOnBasePath,
  isSameBasePath,
  preserveSidebarParam,
} from 'modules/pace/components/dynamic-tabs/tab-registry';
import { usePathname, useRouter } from 'next/navigation';
import { usePaceContext } from '@/modules/pace/pace.context';
import { DynamicTab, DynamicTabType, TAB_TYPE } from '@/modules/pace/pace.types';

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
  const nextPathname = usePathname();

  const {
    dynamicTabs: allTabs,
    isDynamicTabsHydrated: isHydrated,
    openDynamicTab,
    closeDynamicTab,
    updateDynamicTab,
    reorderDynamicTabs,
    activeTabId,
    setActiveTabId,
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

  const allTabMaps = useMemo(() => {
    const byId = new Map<string, DynamicTab>();

    for (const tab of allTabs) {
      byId.set(tab.id, tab);
    }

    return { byId };
  }, [allTabs]);

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
    return activeTabId !== null && allTabMaps.byId.has(activeTabId);
  }, [allTabMaps, activeTabId]);

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
  const historyNavigate = useCallback(
    (tabId: string | null, path: string, method: 'push' | 'replace' = 'push') => {
      setActiveTabId(tabId);

      if (method === 'replace') {
        window.history.replaceState(null, '', path);
      } else {
        window.history.pushState(null, '', path);
      }
    },
    [setActiveTabId],
  );

  /**
   * Full Next.js navigation — triggers route transition.
   * Use for cross-layout navigations (e.g., /chat → /chat/files).
   */
  const routeNavigate = useCallback(
    (tabId: string | null, path: string, method: 'push' | 'replace' = 'push') => {
      setActiveTabId(tabId);

      if (method === 'replace') {
        router.replace(path);
      } else {
        router.push(path);
      }
    },
    [setActiveTabId, router],
  );

  /**
   * Picks the right navigation strategy: synchronous History API when staying
   * on the same base path (same layout), full router navigation otherwise.
   */
  const navigateAndSetActive = useCallback(
    (tabId: string | null, path: string, method: 'push' | 'replace' = 'push') => {
      if (isSameBasePath(path)) {
        historyNavigate(tabId, path, method);
      } else {
        routeNavigate(tabId, path, method);
      }
    },
    [historyNavigate, routeNavigate],
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

      // Opening a new tab may cross layout boundaries (e.g., /chat → /chat/files),
      // so always use the smart navigator that picks history vs router.
      navigateAndSetActive(id, tabPath);
    },
    [openDynamicTab, navigateAndSetActive, type],
  );

  const closeTab = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      const closingTab = tabs.find((tab) => tab.id === id);

      if (!closingTab) return;

      const isClosingActiveTab = closingTab.id === activeTabId;

      onTabClose?.(closingTab.id);
      closeDynamicTab(closingTab.id);

      if (isClosingActiveTab) {
        const { target, hasRemainingItems } = getNextNavigationTarget({
          items: tabs,
          closingItem: closingTab,
          isEqual: (a, b) => a.id === b.id,
          strategy: NAVIGATION_STRATEGY.BROWSER_LIKE,
        });

        const fallbackPath = getTabFallbackPath(closingTab.type);
        const targetPath = hasRemainingItems && target ? preserveSidebarParam(target.path) : fallbackPath;

        navigateAndSetActive(target?.id ?? null, targetPath);
      }
    },
    [tabs, activeTabId, closeDynamicTab, onTabClose, navigateAndSetActive],
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
        closeDynamicTab(tab.id);
      });

      if (activeTabToClose) {
        const { target, hasRemainingItems } = getNextNavigationTarget({
          items: tabs,
          closingItem: activeTabToClose,
          isEqual: (a, b) => a.id === b.id,
          strategy: NAVIGATION_STRATEGY.BROWSER_LIKE,
        });

        const fallbackPath = getTabFallbackPath(activeTabToClose.type);
        const targetPath = hasRemainingItems && target ? preserveSidebarParam(target.path) : fallbackPath;

        navigateAndSetActive(target?.id ?? null, targetPath);
      }
    },
    [tabs, activeTabId, closeDynamicTab, onTabClose, navigateAndSetActive],
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
        navigateAndSetActive(newId, newTabPath, 'replace');
      }
    },
    [tabs, activeTabId, updateDynamicTab, onTabUpdate, navigateAndSetActive],
  );

  const updateTabsForFolderMove = useCallback(
    (oldFolderPath: string, newFolderPath: string) => {
      const oldPrefix = oldFolderPath + '/';
      let activeTabNewPath: string | null = null;
      let activeTabNewId: string | null = null;

      onFolderMove?.(oldFolderPath, newFolderPath);

      tabs.forEach((tab) => {
        if (tab.id === oldFolderPath || tab.id.startsWith(oldPrefix)) {
          const newTabId =
            tab.id === oldFolderPath ? newFolderPath : newFolderPath + tab.id.slice(oldFolderPath.length);
          const newName = newTabId.split('/').pop() || tab.name;
          const newTabPath = buildTabRoute(newTabId, tab.type);

          if (tab.id === activeTabId) {
            activeTabNewPath = newTabPath;
            activeTabNewId = newTabId;
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

      if (activeTabNewPath && activeTabNewId) {
        navigateAndSetActive(activeTabNewId, activeTabNewPath, 'replace');
      }
    },
    [tabs, activeTabId, updateDynamicTab, onFolderMove, navigateAndSetActive],
  );

  // --- Navbar-level operations (work on ALL tabs) ---

  const closeOtherTabs = useCallback(
    (id: string) => {
      const tabToKeep = allTabs.find((tab) => tab.id === id);

      if (!tabToKeep) return;

      const tabsToClose = allTabs.filter((tab) => tab.id !== id);

      tabsToClose.forEach((tab) => {
        closeDynamicTab(tab.id);
      });

      if (activeTabId !== id) {
        navigateAndSetActive(id, preserveSidebarParam(tabToKeep.path));
      }
    },
    [allTabs, activeTabId, closeDynamicTab, navigateAndSetActive],
  );

  const closeTabsToRight = useCallback(
    (id: string) => {
      const tabIndex = allTabs.findIndex((tab) => tab.id === id);

      if (tabIndex === -1) return;

      const tabsToClose = allTabs.slice(tabIndex + 1);

      tabsToClose.forEach((tab) => {
        closeDynamicTab(tab.id);
      });

      const currentActiveTab = allTabs.find((tab) => tab.id === activeTabId);

      if (currentActiveTab) {
        const activeTabIndex = allTabs.findIndex((tab) => tab.id === activeTabId);

        if (activeTabIndex > tabIndex) {
          const newActiveTab = allTabs[tabIndex];

          navigateAndSetActive(newActiveTab.id, preserveSidebarParam(newActiveTab.path));
        }
      }
    },
    [allTabs, activeTabId, closeDynamicTab, navigateAndSetActive],
  );

  const closeAllTabs = useCallback(() => {
    const fallbackSourceTab = allTabs.find((tab) => tab.id === activeTabId) ?? allTabs[0];

    allTabs.forEach((tab) => {
      closeDynamicTab(tab.id);
    });

    const fallbackPath = fallbackSourceTab ? getTabFallbackPath(fallbackSourceTab.type) : preserveSidebarParam('/chat');

    navigateAndSetActive(null, fallbackPath);
  }, [allTabs, activeTabId, closeDynamicTab, navigateAndSetActive]);

  const reorderTabs = useCallback(
    (newOrder: string[]) => {
      reorderDynamicTabs(newOrder);
    },
    [reorderDynamicTabs],
  );

  // --- URL sync via popstate ---
  // Since same-layout tab switches use window.history directly (bypassing Next.js
  // router), useSearchParams/usePathname won't fire. We listen for popstate to
  // handle browser back/forward and sync activeTabId from the URL.

  useEffect(() => {
    if (!isHydrated) return;

    const syncFromUrl = () => {
      const { pathname: currentPathname, search: currentSearch } = window.location;

      const currentUrlTabId = type
        ? getActiveTabIdFromUrl(currentPathname, currentSearch, type)
        : getActiveTabIdFromAllConfigsUrl(currentPathname, currentSearch);

      if (type) {
        const onOwnBasePath = isOnBasePath(currentPathname, type);

        if (onOwnBasePath) {
          setActiveTabId(currentUrlTabId);
        }
      } else {
        setActiveTabId(currentUrlTabId);
      }

      if (type && currentUrlTabId) {
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

  useEffect(() => {
    if (!isHydrated || !nextPathname) return;

    if (!isOnAnyTabBasePath(nextPathname) && activeTabId !== null) {
      setActiveTabId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, nextPathname]);

  useEffect(() => {
    tabMapsRef.current = tabMaps;
  }, [tabMaps]);

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

    reorderTabs,
    isTabActive,
    getTabById,
    getTabIndex,
    hasOpenTabs,
    isOnAnyDynamicTab,
  };
};
