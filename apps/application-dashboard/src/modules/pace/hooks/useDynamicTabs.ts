'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { getNextNavigationTarget, NAVIGATION_STRATEGY } from '@zamp-platform/utils';
import { useSearchParams } from 'next/navigation';
import { getChatFileRoute, ROUTES_PATH } from '@/constants/routeConfig';
import { useFileViewerContext } from '@/modules/pace/context/FileViewerContext';
import { usePaceContext } from '@/modules/pace/pace.context';
import { DynamicTab } from '@/modules/pace/pace.types';

interface UseDynamicTabsReturn {
  tabs: DynamicTab[];
  activeTab: DynamicTab | null;
  isHydrated: boolean;
  openTab: (path: string, name: string) => void;
  closeTab: (e: React.MouseEvent, id: string) => void;
  closeTabsForPath: (path: string, isFolder: boolean) => void;
  updateTab: (oldPath: string, newPath: string, newName: string) => void;
  updateTabsForFolderMove: (oldFolderPath: string, newFolderPath: string) => void;
  reorderTabs: (newOrder: string[]) => void;
  isTabActive: (tab: DynamicTab) => boolean;
  getTabByPath: (path: string) => DynamicTab | undefined;
  hasOpenTabs: () => boolean;
  isOnAnyDynamicTab: () => boolean;
}

export const useDynamicTabs = (): UseDynamicTabsReturn => {
  const searchParams = useSearchParams();
  const currentFileParam = searchParams?.get('f') ?? null;

  const {
    dynamicTabs: tabs,
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
  const { removeFileState, updateFileStatePath, updateFileStatePathsForFolder } = useFileViewerContext();

  const tabMaps = useMemo(() => {
    const byId = new Map<string, DynamicTab>();
    const byStableKey = new Map<string, DynamicTab>();

    for (const tab of tabs) {
      byId.set(tab.id, tab);
      byStableKey.set(tab.stableKey, tab);
    }

    return { byId, byStableKey };
  }, [tabs]);

  const effectiveActiveTabId = optimisticActiveTabId ?? currentFileParam;

  const activeTab = useMemo(() => {
    if (!isHydrated) return null;

    if (effectiveActiveTabId) {
      const matchedTab = tabMaps.byId.get(effectiveActiveTabId);

      if (matchedTab) {
        return matchedTab;
      }
    }

    // During rename/move transition, use pending stableKey to maintain active state - O(1) lookup
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

  const getTabByPath = useCallback(
    (path: string) => {
      return tabMaps.byId.get(path);
    },
    [tabMaps],
  );

  const hasOpenTabs = useCallback(() => {
    return tabs.length > 0;
  }, [tabs]);

  const openTab = useCallback(
    (path: string, name: string) => {
      const filePath = getChatFileRoute(path);

      setOptimisticActiveTabId(path);

      openDynamicTab({
        id: path,
        name,
        path: filePath,
      });

      window.history.pushState({ filePath: path }, '', filePath);
    },
    [openDynamicTab, setOptimisticActiveTabId],
  );

  const closeTab = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      const closingTab = tabs.find((tab) => tab.id === id);

      if (!closingTab) return;

      const isClosingActiveTab = closingTab.id === effectiveActiveTabId;

      removeFileState(closingTab.id);
      closeDynamicTab(closingTab.id);

      if (isClosingActiveTab) {
        const { target, hasRemainingItems } = getNextNavigationTarget({
          items: tabs,
          closingItem: closingTab,
          isEqual: (a, b) => a.id === b.id,
          strategy: NAVIGATION_STRATEGY.BROWSER_LIKE,
        });

        const newPath = hasRemainingItems && target ? target.path : ROUTES_PATH.CHAT_FILES;

        setOptimisticActiveTabId(target?.id ?? null);
        window.history.pushState({ filePath: target?.id ?? null }, '', newPath);
      }
    },
    [tabs, effectiveActiveTabId, closeDynamicTab, removeFileState, setOptimisticActiveTabId],
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
        removeFileState(tab.id);
        closeDynamicTab(tab.id);
      });

      if (activeTabToClose) {
        const { target, hasRemainingItems } = getNextNavigationTarget({
          items: tabs,
          closingItem: activeTabToClose,
          isEqual: (a, b) => a.id === b.id,
          strategy: NAVIGATION_STRATEGY.BROWSER_LIKE,
        });

        const newPath = hasRemainingItems && target ? target.path : ROUTES_PATH.CHAT_FILES;

        setOptimisticActiveTabId(target?.id ?? null);
        window.history.pushState({ filePath: target?.id ?? null }, '', newPath);
      }
    },
    [tabs, effectiveActiveTabId, closeDynamicTab, removeFileState, setOptimisticActiveTabId],
  );

  const updateTab = useCallback(
    (oldPath: string, newPath: string, newName: string) => {
      const tabToUpdate = tabs.find((tab) => tab.id === oldPath);

      if (!tabToUpdate) return;

      const newTabPath = getChatFileRoute(newPath);
      const isCurrentlyActive = effectiveActiveTabId === oldPath;

      if (isCurrentlyActive) {
        setPendingActiveStableKey(tabToUpdate.stableKey);
        setOptimisticActiveTabId(newPath);
      }

      updateFileStatePath(oldPath, newPath);

      updateDynamicTab(oldPath, {
        id: newPath,
        name: newName,
        path: newTabPath,
      });

      if (isCurrentlyActive) {
        window.history.replaceState({ filePath: newPath }, '', newTabPath);
      }
    },
    [
      tabs,
      effectiveActiveTabId,
      updateDynamicTab,
      setPendingActiveStableKey,
      setOptimisticActiveTabId,
      updateFileStatePath,
    ],
  );

  const updateTabsForFolderMove = useCallback(
    (oldFolderPath: string, newFolderPath: string) => {
      const oldPrefix = oldFolderPath + '/';
      let activeTabNewPath: string | null = null;
      let activeTabNewId: string | null = null;

      updateFileStatePathsForFolder(oldFolderPath, newFolderPath);

      tabs.forEach((tab) => {
        if (tab.id === oldFolderPath || tab.id.startsWith(oldPrefix)) {
          const newTabId =
            tab.id === oldFolderPath ? newFolderPath : newFolderPath + tab.id.slice(oldFolderPath.length);
          const newName = newTabId.split('/').pop() || tab.name;
          const newTabPath = getChatFileRoute(newTabId);

          if (tab.id === effectiveActiveTabId) {
            setPendingActiveStableKey(tab.stableKey);
            activeTabNewPath = newTabPath;
            activeTabNewId = newTabId;
          }

          updateDynamicTab(tab.id, {
            id: newTabId,
            name: newName,
            path: newTabPath,
          });
        }
      });

      if (activeTabNewPath) {
        setOptimisticActiveTabId(activeTabNewId);
        window.history.replaceState({ filePath: activeTabNewId }, '', activeTabNewPath);
      }
    },
    [
      tabs,
      effectiveActiveTabId,
      updateDynamicTab,
      setPendingActiveStableKey,
      setOptimisticActiveTabId,
      updateFileStatePathsForFolder,
    ],
  );

  const reorderTabs = useCallback(
    (newOrder: string[]) => {
      reorderDynamicTabs(newOrder);
    },
    [reorderDynamicTabs],
  );

  useEffect(() => {
    if (pendingActiveStableKey && currentFileParam) {
      const matchedTab = tabs.find((tab) => tab.id === currentFileParam);

      if (matchedTab) {
        setPendingActiveStableKey(null);
      }
    }
  }, [currentFileParam, tabs, pendingActiveStableKey, setPendingActiveStableKey]);

  useEffect(() => {
    if (optimisticActiveTabId && currentFileParam === optimisticActiveTabId) {
      setOptimisticActiveTabId(null);
    }
  }, [currentFileParam, optimisticActiveTabId, setOptimisticActiveTabId]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlFileParam = params.get('f');

      setOptimisticActiveTabId(urlFileParam);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setOptimisticActiveTabId]);

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
    getTabByPath,
    hasOpenTabs,
    isOnAnyDynamicTab,
  };
};
