'use client';

import { useCallback, useMemo } from 'react';
import { getNextNavigationTarget, NAVIGATION_STRATEGY } from '@zamp-platform/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useFileViewerContext } from '@/modules/pace/hooks/FileViewerContext';
import { usePaceContext } from '@/modules/pace/pace.context';
import { DynamicTab, DynamicTabType } from '@/modules/pace/pace.types';

export const useDynamicTabs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFileParam = searchParams?.get('f') ?? null;

  const { dynamicTabs, activeFileTabKey, closeDynamicTab, reorderDynamicTabs } = usePaceContext();
  const { removeFileState } = useFileViewerContext();

  const currentFullPath = useMemo(() => {
    if (currentFileParam) {
      return `${pathname}?f=${encodeURIComponent(currentFileParam)}`;
    }

    const search = searchParams?.toString();

    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams, currentFileParam]);

  const isDynamicTabActive = useCallback(
    (tab: DynamicTab) => {
      if (tab.type === DynamicTabType.FILE) {
        return tab.stableKey === activeFileTabKey;
      }

      return currentFullPath === tab.path;
    },
    [activeFileTabKey, currentFullPath],
  );

  const isOnAnyDynamicTab = useCallback(() => {
    return dynamicTabs.some((tab) => isDynamicTabActive(tab));
  }, [dynamicTabs, isDynamicTabActive]);

  const handleCloseDynamicTab = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      const closingTab = dynamicTabs.find((tab) => tab.id === id);

      if (!closingTab) return;

      const isClosingActiveTab = isDynamicTabActive(closingTab);

      if (closingTab.type === DynamicTabType.FILE) {
        removeFileState(closingTab.id);
      }

      closeDynamicTab(closingTab.id);

      if (isClosingActiveTab) {
        const { target, hasRemainingItems } = getNextNavigationTarget({
          items: dynamicTabs,
          closingItem: closingTab,
          isEqual: (a, b) => a.id === b.id,
          strategy: NAVIGATION_STRATEGY.BROWSER_LIKE,
        });

        router.push(hasRemainingItems && target ? target.path : ROUTES_PATH.CHAT_FILES);
      }
    },
    [dynamicTabs, isDynamicTabActive, closeDynamicTab, removeFileState, router],
  );

  const handleReorderTabs = useCallback(
    (newOrder: string[]) => {
      reorderDynamicTabs(newOrder);
    },
    [reorderDynamicTabs],
  );

  return {
    dynamicTabs,
    isDynamicTabActive,
    isOnAnyDynamicTab,
    handleCloseDynamicTab,
    handleReorderTabs,
  };
};
