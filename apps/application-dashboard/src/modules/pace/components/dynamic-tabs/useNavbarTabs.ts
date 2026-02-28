'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { getNextNavigationTarget, NAVIGATION_STRATEGY } from '@zamp-platform/utils';
import { getTabFallbackPath, TAB_TYPE_CONFIG } from 'modules/pace/components/dynamic-tabs/tab-registry';
import { usePathname, useSearchParams } from 'next/navigation';
import { usePaceContext } from '@/modules/pace/pace.context';
import { DynamicTab, ROUTE_KIND } from '@/modules/pace/pace.types';

interface UseNavbarTabsReturn {
  tabs: DynamicTab[];
  isHydrated: boolean;
  closeTab: (e: React.MouseEvent, id: string) => void;
  reorderTabs: (newOrder: string[]) => void;
  isTabActive: (tab: DynamicTab) => boolean;
  isOnAnyDynamicTab: () => boolean;
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
        const newPath = hasRemainingItems && target ? target.path : fallbackPath;

        setActiveTabId(target?.id ?? null);
        window.history.pushState({ tabId: target?.id ?? null, tabType: closingTab.type }, '', newPath);
      }
    },
    [tabs, activeTabId, closeDynamicTab, setActiveTabId],
  );

  const reorderTabs = useCallback(
    (newOrder: string[]) => {
      reorderDynamicTabs(newOrder);
    },
    [reorderDynamicTabs],
  );

  return {
    tabs,
    isHydrated,
    closeTab,
    reorderTabs,
    isTabActive,
    isOnAnyDynamicTab,
  };
};
