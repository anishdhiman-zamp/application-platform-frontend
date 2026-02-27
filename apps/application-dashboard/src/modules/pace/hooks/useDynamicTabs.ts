'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { getNextNavigationTarget, NAVIGATION_STRATEGY } from '@zamp-platform/utils';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const router = useRouter();
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
  } = usePaceContext();
  const { removeFileState, updateFileStatePath, updateFileStatePathsForFolder } = useFileViewerContext();

  const activeTab = useMemo(() => {
    if (!isHydrated) return null;

    // First, try to match by URL param
    if (currentFileParam) {
      const matchedTab = tabs.find((tab) => tab.id === currentFileParam);

      if (matchedTab) {
        return matchedTab;
      }
    }

    // During rename/move transition, use pending stableKey to maintain active state
    if (pendingActiveStableKey) {
      return tabs.find((tab) => tab.stableKey === pendingActiveStableKey) ?? null;
    }

    return null;
  }, [tabs, currentFileParam, isHydrated, pendingActiveStableKey]);

  const isTabActive = useCallback(
    (tab: DynamicTab) => {
      if (!currentFileParam) return false;

      return tab.id === currentFileParam;
    },
    [currentFileParam],
  );

  const isOnAnyDynamicTab = useCallback(() => {
    return currentFileParam !== null && tabs.some((tab) => tab.id === currentFileParam);
  }, [tabs, currentFileParam]);

  const getTabByPath = useCallback(
    (path: string) => {
      return tabs.find((tab) => tab.id === path);
    },
    [tabs],
  );

  const hasOpenTabs = useCallback(() => {
    return tabs.length > 0;
  }, [tabs]);

  const openTab = useCallback(
    (path: string, name: string) => {
      const filePath = getChatFileRoute(path);

      openDynamicTab({
        id: path,
        name,
        path: filePath,
      });
      router.push(filePath);
    },
    [openDynamicTab, router],
  );

  const closeTab = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      const closingTab = tabs.find((tab) => tab.id === id);

      if (!closingTab) return;

      const isClosingActiveTab = closingTab.id === currentFileParam;

      removeFileState(closingTab.id);
      closeDynamicTab(closingTab.id);

      if (isClosingActiveTab) {
        const { target, hasRemainingItems } = getNextNavigationTarget({
          items: tabs,
          closingItem: closingTab,
          isEqual: (a, b) => a.id === b.id,
          strategy: NAVIGATION_STRATEGY.BROWSER_LIKE,
        });

        router.push(hasRemainingItems && target ? target.path : ROUTES_PATH.CHAT_FILES);
      }
    },
    [tabs, currentFileParam, closeDynamicTab, removeFileState, router],
  );

  const closeTabsForPath = useCallback(
    (path: string, isFolder: boolean) => {
      const folderPathPrefix = `${path}/`;

      const tabsToClose = isFolder
        ? tabs.filter((tab) => tab.id === path || tab.id.startsWith(folderPathPrefix))
        : tabs.filter((tab) => tab.id === path);

      if (tabsToClose.length === 0) return;

      const activeTabToClose = tabsToClose.find((tab) => tab.id === currentFileParam);

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

        router.push(hasRemainingItems && target ? target.path : ROUTES_PATH.CHAT_FILES);
      }
    },
    [tabs, currentFileParam, closeDynamicTab, removeFileState, router],
  );

  const updateTab = useCallback(
    (oldPath: string, newPath: string, newName: string) => {
      const tabToUpdate = tabs.find((tab) => tab.id === oldPath);

      if (!tabToUpdate) return;

      const newTabPath = getChatFileRoute(newPath);
      const isCurrentlyActive = currentFileParam === oldPath;

      // Set pending stableKey before update to prevent flash during transition
      if (isCurrentlyActive) {
        setPendingActiveStableKey(tabToUpdate.stableKey);
      }

      // Update file viewer context state first to prevent Monaco editor errors
      updateFileStatePath(oldPath, newPath);

      updateDynamicTab(oldPath, {
        id: newPath,
        name: newName,
        path: newTabPath,
      });

      if (isCurrentlyActive) {
        router.replace(newTabPath);
      }
    },
    [tabs, currentFileParam, updateDynamicTab, router, setPendingActiveStableKey, updateFileStatePath],
  );

  const updateTabsForFolderMove = useCallback(
    (oldFolderPath: string, newFolderPath: string) => {
      const oldPrefix = oldFolderPath + '/';
      let activeTabNewPath: string | null = null;

      // Update file viewer context state first to prevent Monaco editor errors
      updateFileStatePathsForFolder(oldFolderPath, newFolderPath);

      tabs.forEach((tab) => {
        if (tab.id === oldFolderPath || tab.id.startsWith(oldPrefix)) {
          const newTabId =
            tab.id === oldFolderPath ? newFolderPath : newFolderPath + tab.id.slice(oldFolderPath.length);
          const newName = newTabId.split('/').pop() || tab.name;
          const newTabPath = getChatFileRoute(newTabId);

          // Set pending stableKey before update to prevent flash during transition
          if (tab.id === currentFileParam) {
            setPendingActiveStableKey(tab.stableKey);
            activeTabNewPath = newTabPath;
          }

          updateDynamicTab(tab.id, {
            id: newTabId,
            name: newName,
            path: newTabPath,
          });
        }
      });

      // Update URL after all tabs are updated if active tab was affected
      if (activeTabNewPath) {
        router.replace(activeTabNewPath);
      }
    },
    [tabs, currentFileParam, updateDynamicTab, router, setPendingActiveStableKey, updateFileStatePathsForFolder],
  );

  const reorderTabs = useCallback(
    (newOrder: string[]) => {
      reorderDynamicTabs(newOrder);
    },
    [reorderDynamicTabs],
  );

  // Clear pending key once URL matches a tab
  useEffect(() => {
    if (pendingActiveStableKey && currentFileParam) {
      const matchedTab = tabs.find((tab) => tab.id === currentFileParam);

      if (matchedTab) {
        setPendingActiveStableKey(null);
      }
    }
  }, [currentFileParam, tabs, pendingActiveStableKey, setPendingActiveStableKey]);

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
