'use client';

import { useCallback } from 'react';
import { getNextNavigationTarget } from '@zamp-platform/utils';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { usePaceContext } from '@/modules/pace/pace.context';

export const useDynamicTabs = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { dynamicTabs, closeDynamicTab, reorderDynamicTabs } = usePaceContext();

  const isDynamicTabActive = useCallback(
    (path: string) => {
      return pathname === path;
    },
    [pathname],
  );

  const isOnAnyDynamicTab = useCallback(() => {
    return dynamicTabs.some((tab) => pathname === tab.path);
  }, [dynamicTabs, pathname]);

  const handleCloseDynamicTab = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      const closingTab = dynamicTabs.find((tab) => tab.id === id);

      if (!closingTab) return;

      const isClosingActiveTab = pathname === closingTab.path;

      closeDynamicTab(id);

      if (isClosingActiveTab) {
        const { target, hasRemainingItems } = getNextNavigationTarget({
          items: dynamicTabs,
          closingItem: closingTab,
          isEqual: (a, b) => a.id === b.id,
          strategy: 'browser-like',
        });

        router.push(hasRemainingItems && target ? target.path : ROUTES_PATH.CHAT_ARTIFACTS);
      }
    },
    [dynamicTabs, pathname, closeDynamicTab, router],
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
