'use client';

import React, { useCallback, useMemo } from 'react';
import { getNextNavigationTarget, NAVIGATION_STRATEGY } from '@zamp-platform/utils';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { buildTabRoute } from '@/modules/pace/components/dynamic-tabs/tab-type-registry';
import { markTabAsClosed, useTabRouter } from '@/modules/pace/hooks/useTabRouter';
import { DynamicTab, DynamicTabType, NAV_METHOD, TAB_TYPE } from '@/modules/pace/pace.types';
import { store } from '@/store/index';
import { dynamicTabsActions, selectActiveTabId, selectDynamicTabs } from '@/store/slices/dynamic-tabs.slice';

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
  updateTab: (oldId: string, newId: string, newName: string, metadata?: Record<string, unknown>) => void;
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

  const dispatch = useAppDispatch();
  const allTabs = useAppSelector(selectDynamicTabs);
  const activeTabId = useAppSelector(selectActiveTabId);

  const { navigateTo, navigateToTab: routerNavigateToTab } = useTabRouter({ type });

  const tabs = useMemo(() => {
    if (!type) return allTabs;

    return allTabs.filter((tab) => (tab.type ?? TAB_TYPE.FILE) === type);
  }, [allTabs, type]);

  const tabMap = useMemo(() => {
    const byId = new Map<string, DynamicTab>();

    for (const tab of tabs) {
      byId.set(tab.id, tab);
    }

    return byId;
  }, [tabs]);

  const activeTab = useMemo(() => {
    if (!activeTabId) return null;

    return tabMap.get(activeTabId) ?? null;
  }, [activeTabId, tabMap]);

  const isTabActive = useCallback(
    (tab: DynamicTab) => {
      if (!activeTabId) return false;

      return tab.id === activeTabId;
    },
    [activeTabId],
  );

  const isOnAnyDynamicTab = useCallback(() => {
    if (!activeTabId) return false;

    return allTabs.some((tab) => tab.id === activeTabId);
  }, [allTabs, activeTabId]);

  const getTabById = useCallback(
    (id: string) => {
      return tabMap.get(id);
    },
    [tabMap],
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

  const navigateToTab = useCallback(
    (tab: DynamicTab) => {
      routerNavigateToTab(tab.id, tab.type);
    },
    [routerNavigateToTab],
  );

  const openTab = useCallback(
    (id: string, name: string, metadata?: Record<string, unknown>) => {
      const tabType = type ?? TAB_TYPE.FILE;
      const tabPath = buildTabRoute(id, tabType);

      dispatch(
        dynamicTabsActions.openTab({
          id,
          name,
          path: tabPath,
          type: tabType,
          metadata,
        }),
      );

      navigateTo(tabPath);
    },
    [dispatch, navigateTo, type],
  );

  const closeTab = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      const currentTabs = store.getState().dynamicTabs.tabs;
      const closingTab = currentTabs.find((tab) => tab.id === id);

      if (!closingTab) return;

      const currentActiveId = store.getState().dynamicTabs.activeTabId;
      const isClosingActiveTab = closingTab.id === currentActiveId;

      onTabClose?.(closingTab.id);
      markTabAsClosed(id);

      dispatch(dynamicTabsActions.closeTab(id));

      if (isClosingActiveTab) {
        const { target, hasRemainingItems } = getNextNavigationTarget({
          items: currentTabs,
          closingItem: closingTab,
          isEqual: (a, b) => a.id === b.id,
          strategy: NAVIGATION_STRATEGY.BROWSER_LIKE,
        });

        if (hasRemainingItems && target) {
          dispatch(dynamicTabsActions.setActiveTab(target.id));
          navigateTo(target.path ?? buildTabRoute(target.id, target.type));
        } else {
          dispatch(dynamicTabsActions.setActiveTab(null));
          navigateTo(ROUTES_PATH.CHAT, NAV_METHOD.PUSH);
        }
      }
    },
    [dispatch, onTabClose, navigateTo],
  );

  const closeTabsForPath = useCallback(
    (path: string, isFolder: boolean) => {
      const folderPathPrefix = `${path}/`;
      const currentTabs = store.getState().dynamicTabs.tabs;
      const currentActiveId = store.getState().dynamicTabs.activeTabId;

      const tabsToClose = isFolder
        ? currentTabs.filter((tab) => tab.id === path || tab.id.startsWith(folderPathPrefix))
        : currentTabs.filter((tab) => tab.id === path);

      if (tabsToClose.length === 0) return;

      const activeTabToClose = tabsToClose.find((tab) => tab.id === currentActiveId);

      tabsToClose.forEach((tab) => {
        onTabClose?.(tab.id);
        markTabAsClosed(tab.id);
        dispatch(dynamicTabsActions.closeTab(tab.id));
      });

      if (activeTabToClose) {
        const { target, hasRemainingItems } = getNextNavigationTarget({
          items: currentTabs,
          closingItem: activeTabToClose,
          isEqual: (a, b) => a.id === b.id,
          strategy: NAVIGATION_STRATEGY.BROWSER_LIKE,
        });

        if (hasRemainingItems && target) {
          const isTargetClosed = tabsToClose.some((t) => t.id === target.id);

          if (!isTargetClosed) {
            dispatch(dynamicTabsActions.setActiveTab(target.id));
            navigateTo(target.path ?? buildTabRoute(target.id, target.type));
          } else {
            dispatch(dynamicTabsActions.setActiveTab(null));
            navigateTo(ROUTES_PATH.CHAT, NAV_METHOD.PUSH);
          }
        } else {
          dispatch(dynamicTabsActions.setActiveTab(null));
          navigateTo(ROUTES_PATH.CHAT);
        }
      }
    },
    [dispatch, onTabClose, navigateTo],
  );

  const updateTab = useCallback(
    (oldId: string, newId: string, newName: string, metadata?: Record<string, unknown>) => {
      const currentTabs = store.getState().dynamicTabs.tabs;
      const tabToUpdate = currentTabs.find((tab) => tab.id === oldId);

      if (!tabToUpdate) return;

      const newTabPath = buildTabRoute(newId, tabToUpdate.type);
      const currentActiveId = store.getState().dynamicTabs.activeTabId;
      const isCurrentlyActive = currentActiveId === oldId;

      onTabUpdate?.(oldId, newId);

      dispatch(
        dynamicTabsActions.updateTab({
          oldId,
          newTab: {
            id: newId,
            name: newName,
            path: newTabPath,
            type: tabToUpdate.type,
            metadata: metadata ? { ...tabToUpdate.metadata, ...metadata } : tabToUpdate.metadata,
          },
        }),
      );

      if (isCurrentlyActive) {
        navigateTo(newTabPath, NAV_METHOD.REPLACE);
      }
    },
    [dispatch, onTabUpdate, navigateTo],
  );

  const updateTabsForFolderMove = useCallback(
    (oldFolderPath: string, newFolderPath: string) => {
      const oldPrefix = oldFolderPath + '/';
      const currentTabs = store.getState().dynamicTabs.tabs;
      const currentActiveId = store.getState().dynamicTabs.activeTabId;
      let activeTabNewPath: string | null = null;

      onFolderMove?.(oldFolderPath, newFolderPath);

      currentTabs.forEach((tab) => {
        if (tab.id === oldFolderPath || tab.id.startsWith(oldPrefix)) {
          const newTabId =
            tab.id === oldFolderPath ? newFolderPath : newFolderPath + tab.id.slice(oldFolderPath.length);
          const newName = newTabId.split('/').pop() || tab.name;
          const newTabPath = buildTabRoute(newTabId, tab.type);

          if (tab.id === currentActiveId) {
            activeTabNewPath = newTabPath;
          }

          dispatch(
            dynamicTabsActions.updateTab({
              oldId: tab.id,
              newTab: {
                id: newTabId,
                name: newName,
                path: newTabPath,
                type: tab.type,
                metadata: tab.metadata,
              },
            }),
          );
        }
      });

      if (activeTabNewPath) {
        navigateTo(activeTabNewPath, NAV_METHOD.REPLACE);
      }
    },
    [dispatch, onFolderMove, navigateTo],
  );

  const closeOtherTabs = useCallback(
    (id: string) => {
      const currentTabs = store.getState().dynamicTabs.tabs;
      const tabToKeep = currentTabs.find((tab) => tab.id === id);

      if (!tabToKeep) return;

      const currentActiveId = store.getState().dynamicTabs.activeTabId;
      const shouldNavigate = currentActiveId !== id;

      const tabsToClose = currentTabs.filter((tab) => tab.id !== id);

      tabsToClose.forEach((tab) => {
        markTabAsClosed(tab.id);
        dispatch(dynamicTabsActions.closeTab(tab.id));
      });

      dispatch(dynamicTabsActions.setActiveTab(id));

      if (shouldNavigate) {
        navigateTo(tabToKeep.path ?? buildTabRoute(tabToKeep.id, tabToKeep.type));
      }
    },
    [dispatch, navigateTo],
  );

  const closeTabsToRight = useCallback(
    (id: string) => {
      const currentTabs = store.getState().dynamicTabs.tabs;
      const tabIndex = currentTabs.findIndex((tab) => tab.id === id);

      if (tabIndex === -1) return;

      const tabsToClose = currentTabs.slice(tabIndex + 1);
      const currentActiveId = store.getState().dynamicTabs.activeTabId;

      let targetPath: string | null = null;

      if (currentActiveId) {
        const activeTabIndex = currentTabs.findIndex((tab) => tab.id === currentActiveId);

        if (activeTabIndex > tabIndex) {
          const anchorTab = currentTabs[tabIndex];

          targetPath = anchorTab.path ?? buildTabRoute(anchorTab.id, anchorTab.type);
          dispatch(dynamicTabsActions.setActiveTab(anchorTab.id));
        }
      }

      tabsToClose.forEach((tab) => {
        markTabAsClosed(tab.id);
        dispatch(dynamicTabsActions.closeTab(tab.id));
      });

      if (targetPath) {
        navigateTo(targetPath);
      }
    },
    [dispatch, navigateTo],
  );

  const closeAllTabs = useCallback(() => {
    const currentTabs = store.getState().dynamicTabs.tabs;

    currentTabs.forEach((tab) => markTabAsClosed(tab.id));
    dispatch(dynamicTabsActions.clearAllTabs());
    navigateTo(ROUTES_PATH.CHAT, NAV_METHOD.PUSH);
  }, [dispatch, navigateTo]);

  const reorderTabs = useCallback(
    (newOrder: string[]) => {
      dispatch(dynamicTabsActions.reorderTabs(newOrder));
    },
    [dispatch],
  );

  return {
    tabs,
    activeTab,
    isHydrated: true,

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
