'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { getNextNavigationTarget, NAVIGATION_STRATEGY } from '@zamp-platform/utils';
import {
  getTabFallbackPath,
  preserveSidebarParam,
  TAB_TYPE_CONFIG,
} from 'modules/pace/components/dynamic-tabs/tab-registry';
import { usePathname, useSearchParams } from 'next/navigation';
import { usePaceContext } from '@/modules/pace/pace.context';
import { DynamicTab, ROUTE_KIND } from '@/modules/pace/pace.types';

interface UseNavbarTabsReturn {
  tabs: DynamicTab[];
  isHydrated: boolean;
  closeTab: (e: React.MouseEvent, id: string) => void;
  closeOtherTabs: (id: string) => void;
  closeTabsToRight: (id: string) => void;
  closeAllTabs: () => void;
  reorderTabs: (newOrder: string[]) => void;
  isTabActive: (tab: DynamicTab) => boolean;
  isOnAnyDynamicTab: () => boolean;
  getTabIndex: (id: string) => number;
}

export const useNavbarTabs = (): UseNavbarTabsReturn => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    dynamicTabs: tabs,
    isDynamicTabsHydrated: isHydrated,
    closeDynamicTab,
    reorderDynamicTabs,
    activeTabId,
    setActiveTabId,
  } = usePaceContext();

  const allTabMaps = useMemo(() => {
    const byId = new Map<string, DynamicTab>();

    for (const tab of tabs) {
      byId.set(tab.id, tab);
    }

    return { byId };
  }, [tabs]);

  useEffect(() => {
    if (!isHydrated) return;

    let urlActiveTabId: string | null = null;

    for (const [, config] of Object.entries(TAB_TYPE_CONFIG)) {
      if (config.kind === ROUTE_KIND.QUERY) {
        if (pathname === config.basePath || pathname?.startsWith(config.basePath + '/')) {
          const paramValue = searchParams?.get(config.paramName);

          if (paramValue) {
            urlActiveTabId = paramValue;
            break;
          }
        }
      }
    }

    if (urlActiveTabId !== activeTabId) {
      setActiveTabId(urlActiveTabId);
    }
  }, [isHydrated, pathname, searchParams, activeTabId, setActiveTabId]);

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

  const closeTab = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      const closingTab = tabs.find((tab) => tab.id === id);

      if (!closingTab) return;

      const isClosingActiveTab = closingTab.id === activeTabId;

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

        setActiveTabId(target?.id ?? null);
        window.history.pushState({ tabId: target?.id ?? null, tabType: closingTab.type }, '', targetPath);
      }
    },
    [tabs, activeTabId, closeDynamicTab, setActiveTabId],
  );

  const closeOtherTabs = useCallback(
    (id: string) => {
      const tabToKeep = tabs.find((tab) => tab.id === id);

      if (!tabToKeep) return;

      const tabsToClose = tabs.filter((tab) => tab.id !== id);

      tabsToClose.forEach((tab) => {
        closeDynamicTab(tab.id);
      });

      if (activeTabId !== id) {
        setActiveTabId(id);
        window.history.pushState({ tabId: id, tabType: tabToKeep.type }, '', preserveSidebarParam(tabToKeep.path));
      }
    },
    [tabs, activeTabId, closeDynamicTab, setActiveTabId],
  );

  const closeTabsToRight = useCallback(
    (id: string) => {
      const tabIndex = tabs.findIndex((tab) => tab.id === id);

      if (tabIndex === -1) return;

      const tabsToClose = tabs.slice(tabIndex + 1);

      tabsToClose.forEach((tab) => {
        closeDynamicTab(tab.id);
      });

      const activeTab = tabs.find((tab) => tab.id === activeTabId);

      if (activeTab) {
        const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTabId);

        if (activeTabIndex > tabIndex) {
          const newActiveTab = tabs[tabIndex];

          setActiveTabId(newActiveTab.id);
          window.history.pushState(
            { tabId: newActiveTab.id, tabType: newActiveTab.type },
            '',
            preserveSidebarParam(newActiveTab.path),
          );
        }
      }
    },
    [tabs, activeTabId, closeDynamicTab, setActiveTabId],
  );

  const closeAllTabs = useCallback(() => {
    const firstTab = tabs[0];

    tabs.forEach((tab) => {
      closeDynamicTab(tab.id);
    });

    const fallbackPath = firstTab ? getTabFallbackPath(firstTab.type) : preserveSidebarParam('/');

    setActiveTabId(null);
    window.history.pushState({ tabId: null, tabType: null }, '', fallbackPath);
  }, [tabs, closeDynamicTab, setActiveTabId]);

  const reorderTabs = useCallback(
    (newOrder: string[]) => {
      reorderDynamicTabs(newOrder);
    },
    [reorderDynamicTabs],
  );

  const getTabIndex = useCallback(
    (id: string) => {
      return tabs.findIndex((tab) => tab.id === id);
    },
    [tabs],
  );

  return {
    tabs,
    isHydrated,
    closeTab,
    closeOtherTabs,
    closeTabsToRight,
    closeAllTabs,
    reorderTabs,
    isTabActive,
    isOnAnyDynamicTab,
    getTabIndex,
  };
};
