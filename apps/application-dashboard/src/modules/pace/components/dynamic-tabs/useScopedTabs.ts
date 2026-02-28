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
import { DynamicTab, DynamicTabType, ROUTE_KIND, TAB_TYPE } from '@/modules/pace/pace.types';

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
  const { type = TAB_TYPE.FILE, onTabClose, onTabUpdate, onFolderMove } = config;

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
    activeTabId,
    setActiveTabId,
  } = usePaceContext();

  const tabs = useMemo(() => {
    return allTabs.filter((tab) => (tab.type ?? TAB_TYPE.FILE) === type);
  }, [allTabs, type]);

  const tabMaps = useMemo(() => {
    const byId = new Map<string, DynamicTab>();

    for (const tab of tabs) {
      byId.set(tab.id, tab);
    }

    return { byId };
  }, [tabs]);

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
    return activeTabId !== null && tabMaps.byId.has(activeTabId);
  }, [tabMaps, activeTabId]);

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

      openDynamicTab({
        id,
        name,
        path: tabPath,
        type,
        metadata,
      });

      setActiveTabId(id);
      window.history.pushState({ tabId: id, tabType: type }, '', tabPath);
    },
    [openDynamicTab, setActiveTabId, type],
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
        const newPath = hasRemainingItems && target ? target.path : fallbackPath;

        setActiveTabId(target?.id ?? null);
        window.history.pushState({ tabId: target?.id ?? null, tabType: type }, '', newPath);
      }
    },
    [tabs, activeTabId, closeDynamicTab, onTabClose, setActiveTabId, type],
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
        const newPath = hasRemainingItems && target ? target.path : fallbackPath;

        setActiveTabId(target?.id ?? null);
        window.history.pushState({ tabId: target?.id ?? null, tabType: type }, '', newPath);
      }
    },
    [tabs, activeTabId, closeDynamicTab, onTabClose, setActiveTabId, type],
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
        setActiveTabId(newId);
        window.history.replaceState({ tabId: newId, tabType: tabToUpdate.type }, '', newTabPath);
      }
    },
    [tabs, activeTabId, updateDynamicTab, setActiveTabId, onTabUpdate],
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

          if (tab.id === activeTabId) {
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

      if (activeTabNewPath && activeTabNewId) {
        setActiveTabId(activeTabNewId);
        window.history.replaceState({ tabId: activeTabNewId, tabType: activeTabType }, '', activeTabNewPath);
      }
    },
    [tabs, activeTabId, updateDynamicTab, setActiveTabId, onFolderMove],
  );

  const reorderTabs = useCallback(
    (newOrder: string[]) => {
      reorderDynamicTabs(newOrder);
    },
    [reorderDynamicTabs],
  );

  useEffect(() => {
    if (!isHydrated) return;

    if (currentUrlParam !== activeTabId) {
      setActiveTabId(currentUrlParam);
    }

    if (currentUrlParam && !tabMaps.byId.has(currentUrlParam)) {
      const fileName = currentUrlParam.split('/').pop() || currentUrlParam;
      const tabPath = buildTabRoute(currentUrlParam, type);

      openDynamicTab({
        id: currentUrlParam,
        name: fileName,
        path: tabPath,
        type,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, currentUrlParam]);

  useEffect(() => {
    const handlePopState = () => {
      if (tabConfig.kind === ROUTE_KIND.QUERY) {
        const params = new URLSearchParams(window.location.search);
        const urlParam = params.get(tabConfig.paramName);

        setActiveTabId(urlParam);
      } else {
        const activeId = getActiveTabIdFromUrl(type);

        setActiveTabId(activeId);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setActiveTabId, tabConfig, type]);

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
