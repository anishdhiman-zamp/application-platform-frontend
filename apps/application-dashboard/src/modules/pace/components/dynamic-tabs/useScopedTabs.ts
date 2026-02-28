'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { getNextNavigationTarget, NAVIGATION_STRATEGY } from '@zamp-platform/utils';
import {
  buildTabRoute,
  getActiveTabIdFromUrl,
  getTabFallbackPath,
  getTabTypeConfig,
} from 'modules/pace/components/dynamic-tabs/tab-registry';
import { useSearchParams } from 'next/navigation';
import { usePaceContext } from '@/modules/pace/pace.context';
import { DynamicTab, DynamicTabType, ROUTE_KIND } from '@/modules/pace/pace.types';

interface UseScopedTabsConfig {
  type?: DynamicTabType;
  onTabClose?: (id: string) => void;
  onTabUpdate?: (oldId: string, newId: string) => void;
  onFolderMove?: (oldFolderPath: string, newFolderPath: string) => void;
}

interface UseScopedTabsReturn {
  tabs: DynamicTab[];
  activeTab: DynamicTab | null;
  isHydrated: boolean;
  openTab: (id: string, name: string, metadata?: Record<string, unknown>) => void;
  closeTab: (e: React.MouseEvent, id: string) => void;
  closeTabsForPath: (path: string, isFolder: boolean) => void;
  updateTab: (oldId: string, newId: string, newName: string) => void;
  updateTabsForFolderMove: (oldFolderPath: string, newFolderPath: string) => void;
  reorderTabs: (newOrder: string[]) => void;
  isTabActive: (tab: DynamicTab) => boolean;
  getTabById: (id: string) => DynamicTab | undefined;
  hasOpenTabs: () => boolean;
  isOnAnyDynamicTab: () => boolean;
}

export const useScopedTabs = (config: UseScopedTabsConfig = {}): UseScopedTabsReturn => {
  const { type = 'file', onTabClose, onTabUpdate, onFolderMove } = config;

  const searchParams = useSearchParams();
  const tabConfig = getTabTypeConfig(type);

  const currentUrlParam = useMemo(() => {
    if (tabConfig.kind === ROUTE_KIND.QUERY) {
      return searchParams?.get(tabConfig.paramName) ?? null;
    }

    return getActiveTabIdFromUrl(type);
  }, [searchParams, tabConfig, type]);

  const {
    dynamicTabs: allTabs,
    isDynamicTabsHydrated: isHydrated,
    openDynamicTab,
    closeDynamicTab,
    updateDynamicTab,
    reorderDynamicTabs,
    pendingActiveStableKey,
    setPendingActiveStableKey,
    optimisticActiveTabId,
    setOptimisticActiveTabId,
  } = usePaceContext();

  const tabs = useMemo(() => {
    return allTabs.filter((tab) => (tab.type ?? 'file') === type);
  }, [allTabs, type]);

  const tabMaps = useMemo(() => {
    const byId = new Map<string, DynamicTab>();
    const byStableKey = new Map<string, DynamicTab>();

    for (const tab of tabs) {
      byId.set(tab.id, tab);
      byStableKey.set(tab.stableKey, tab);
    }

    return { byId, byStableKey };
  }, [tabs]);

  const effectiveActiveTabId = optimisticActiveTabId ?? currentUrlParam;

  const activeTab = useMemo(() => {
    if (!isHydrated) return null;

    if (effectiveActiveTabId) {
      const matchedTab = tabMaps.byId.get(effectiveActiveTabId);

      if (matchedTab) {
        return matchedTab;
      }
    }

    if (pendingActiveStableKey) {
      return tabMaps.byStableKey.get(pendingActiveStableKey) ?? null;
    }

    return null;
  }, [tabMaps, effectiveActiveTabId, isHydrated, pendingActiveStableKey]);

  const isTabActive = useCallback(
    (tab: DynamicTab) => {
      if (!effectiveActiveTabId) return false;

      return tab.id === effectiveActiveTabId;
    },
    [effectiveActiveTabId],
  );

  const isOnAnyDynamicTab = useCallback(() => {
    return effectiveActiveTabId !== null && tabMaps.byId.has(effectiveActiveTabId);
  }, [tabMaps, effectiveActiveTabId]);

  const getTabById = useCallback(
    (id: string) => {
      return tabMaps.byId.get(id);
    },
    [tabMaps],
  );

  const hasOpenTabs = useCallback(() => {
    return tabs.length > 0;
  }, [tabs]);

  const openTab = useCallback(
    (id: string, name: string, metadata?: Record<string, unknown>) => {
      const tabPath = buildTabRoute(id, type);

      setOptimisticActiveTabId(id);

      openDynamicTab({
        id,
        name,
        path: tabPath,
        type,
        metadata,
      });

      window.history.pushState({ tabId: id, tabType: type }, '', tabPath);
    },
    [openDynamicTab, setOptimisticActiveTabId, type],
  );

  const closeTab = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      const closingTab = tabs.find((tab) => tab.id === id);

      if (!closingTab) return;

      const isClosingActiveTab = closingTab.id === effectiveActiveTabId;

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
        const newPath = hasRemainingItems && target ? target.path : fallbackPath;

        setOptimisticActiveTabId(target?.id ?? null);
        window.history.pushState({ tabId: target?.id ?? null, tabType: type }, '', newPath);
      }
    },
    [tabs, effectiveActiveTabId, closeDynamicTab, onTabClose, setOptimisticActiveTabId, type],
  );

  const closeTabsForPath = useCallback(
    (path: string, isFolder: boolean) => {
      const folderPathPrefix = `${path}/`;

      const tabsToClose = isFolder
        ? tabs.filter((tab) => tab.id === path || tab.id.startsWith(folderPathPrefix))
        : tabs.filter((tab) => tab.id === path);

      if (tabsToClose.length === 0) return;

      const activeTabToClose = tabsToClose.find((tab) => tab.id === effectiveActiveTabId);

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
        const newPath = hasRemainingItems && target ? target.path : fallbackPath;

        setOptimisticActiveTabId(target?.id ?? null);
        window.history.pushState({ tabId: target?.id ?? null, tabType: type }, '', newPath);
      }
    },
    [tabs, effectiveActiveTabId, closeDynamicTab, onTabClose, setOptimisticActiveTabId, type],
  );

  const updateTab = useCallback(
    (oldId: string, newId: string, newName: string) => {
      const tabToUpdate = tabs.find((tab) => tab.id === oldId);

      if (!tabToUpdate) return;

      const newTabPath = buildTabRoute(newId, tabToUpdate.type);
      const isCurrentlyActive = effectiveActiveTabId === oldId;

      if (isCurrentlyActive) {
        setPendingActiveStableKey(tabToUpdate.stableKey);
        setOptimisticActiveTabId(newId);
      }

      onTabUpdate?.(oldId, newId);

      updateDynamicTab(oldId, {
        id: newId,
        name: newName,
        path: newTabPath,
        type: tabToUpdate.type,
        metadata: tabToUpdate.metadata,
      });

      if (isCurrentlyActive) {
        window.history.replaceState({ tabId: newId, tabType: tabToUpdate.type }, '', newTabPath);
      }
    },
    [tabs, effectiveActiveTabId, updateDynamicTab, setPendingActiveStableKey, setOptimisticActiveTabId, onTabUpdate],
  );

  const updateTabsForFolderMove = useCallback(
    (oldFolderPath: string, newFolderPath: string) => {
      const oldPrefix = oldFolderPath + '/';
      let activeTabNewPath: string | null = null;
      let activeTabNewId: string | null = null;
      let activeTabType: DynamicTabType | undefined;

      onFolderMove?.(oldFolderPath, newFolderPath);

      tabs.forEach((tab) => {
        if (tab.id === oldFolderPath || tab.id.startsWith(oldPrefix)) {
          const newTabId =
            tab.id === oldFolderPath ? newFolderPath : newFolderPath + tab.id.slice(oldFolderPath.length);
          const newName = newTabId.split('/').pop() || tab.name;
          const newTabPath = buildTabRoute(newTabId, tab.type);

          if (tab.id === effectiveActiveTabId) {
            setPendingActiveStableKey(tab.stableKey);
            activeTabNewPath = newTabPath;
            activeTabNewId = newTabId;
            activeTabType = tab.type;
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
        setOptimisticActiveTabId(activeTabNewId);
        window.history.replaceState({ tabId: activeTabNewId, tabType: activeTabType }, '', activeTabNewPath);
      }
    },
    [tabs, effectiveActiveTabId, updateDynamicTab, setPendingActiveStableKey, setOptimisticActiveTabId, onFolderMove],
  );

  const reorderTabs = useCallback(
    (newOrder: string[]) => {
      reorderDynamicTabs(newOrder);
    },
    [reorderDynamicTabs],
  );

  useEffect(() => {
    if (pendingActiveStableKey && currentUrlParam) {
      const matchedTab = tabs.find((tab) => tab.id === currentUrlParam);

      if (matchedTab) {
        setPendingActiveStableKey(null);
      }
    }
  }, [currentUrlParam, tabs, pendingActiveStableKey, setPendingActiveStableKey]);

  useEffect(() => {
    if (optimisticActiveTabId && currentUrlParam === optimisticActiveTabId) {
      setOptimisticActiveTabId(null);
    }
  }, [currentUrlParam, optimisticActiveTabId, setOptimisticActiveTabId]);

  useEffect(() => {
    const handlePopState = () => {
      if (tabConfig.kind === ROUTE_KIND.QUERY) {
        const params = new URLSearchParams(window.location.search);
        const urlParam = params.get(tabConfig.paramName);

        setOptimisticActiveTabId(urlParam);
      } else {
        const activeId = getActiveTabIdFromUrl(type);

        setOptimisticActiveTabId(activeId);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setOptimisticActiveTabId, tabConfig, type]);

  return {
    tabs,
    activeTab,
    isHydrated,

    openTab,
    closeTab,
    closeTabsForPath,
    updateTab,
    updateTabsForFolderMove,
    reorderTabs,

    isTabActive,
    getTabById,
    hasOpenTabs,
    isOnAnyDynamicTab,
  };
};
