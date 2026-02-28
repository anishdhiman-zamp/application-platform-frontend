'use client';

import React, { useCallback, useMemo } from 'react';
import { getNextNavigationTarget, NAVIGATION_STRATEGY } from '@zamp-platform/utils';
import { getTabFallbackPath, TAB_TYPE_CONFIG } from 'modules/pace/components/dynamic-tabs/tab-registry';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();

  const {
    dynamicTabs: tabs,
    isDynamicTabsHydrated: isHydrated,
    closeDynamicTab,
    reorderDynamicTabs,
    optimisticActiveTabId,
    setOptimisticActiveTabId,
  } = usePaceContext();

  const allTabMaps = useMemo(() => {
    const byId = new Map<string, DynamicTab>();

    for (const tab of tabs) {
      byId.set(tab.id, tab);
    }

    return { byId };
  }, [tabs]);

  const getCurrentActiveTabId = useCallback((): string | null => {
    if (optimisticActiveTabId) return optimisticActiveTabId;

    for (const config of Object.values(TAB_TYPE_CONFIG)) {
      if (config.kind === ROUTE_KIND.QUERY) {
        const param = searchParams?.get(config.paramName);

        if (param && allTabMaps.byId.has(param)) {
          return param;
        }
      } else {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

        if (currentPath.startsWith(config.basePath)) {
          const pathSegments = currentPath.split('/');
          const baseSegments = config.basePath.split('/').filter(Boolean);

          if (pathSegments.length > baseSegments.length + 1) {
            const id = decodeURIComponent(pathSegments[baseSegments.length + 1]);

            if (allTabMaps.byId.has(id)) {
              return id;
            }
          }
        }
      }
    }

    return null;
  }, [optimisticActiveTabId, searchParams, allTabMaps]);

  const effectiveActiveTabId = getCurrentActiveTabId();

  const isTabActive = useCallback(
    (tab: DynamicTab) => {
      if (!effectiveActiveTabId) return false;

      return tab.id === effectiveActiveTabId;
    },
    [effectiveActiveTabId],
  );

  const isOnAnyDynamicTab = useCallback(() => {
    return effectiveActiveTabId !== null && allTabMaps.byId.has(effectiveActiveTabId);
  }, [allTabMaps, effectiveActiveTabId]);

  const closeTab = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      const closingTab = tabs.find((tab) => tab.id === id);

      if (!closingTab) return;

      const isClosingActiveTab = closingTab.id === effectiveActiveTabId;

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
        window.history.pushState({ tabId: target?.id ?? null, tabType: closingTab.type }, '', newPath);
      }
    },
    [tabs, effectiveActiveTabId, closeDynamicTab, setOptimisticActiveTabId],
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
