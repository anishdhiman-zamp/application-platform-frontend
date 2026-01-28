'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { usePaceContext } from '@/modules/pace/pace.context';

export const useDynamicTabs = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { dynamicTabs, closeDynamicTab } = usePaceContext();
  const tabRefsMap = useRef<Map<string, HTMLAnchorElement>>(new Map());

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

      const closingTabIndex = dynamicTabs.findIndex((tab) => tab.id === id);
      const closingTab = dynamicTabs[closingTabIndex];
      const isClosingActiveTab = closingTab && pathname === closingTab.path;

      closeDynamicTab(id);

      if (isClosingActiveTab) {
        // Determine which tab to navigate to after closing
        if (dynamicTabs.length === 1) {
          // No tabs left, go to artifacts
          router.push(ROUTES_PATH.CHAT_ARTIFACTS);
        } else if (closingTabIndex === dynamicTabs.length - 1) {
          // Closing last tab, make previous tab active
          router.push(dynamicTabs[closingTabIndex - 1].path);
        } else {
          // Closing first or middle tab, make next tab active
          router.push(dynamicTabs[closingTabIndex + 1].path);
        }
      }
    },
    [dynamicTabs, pathname, closeDynamicTab, router],
  );

  const setTabRef = useCallback(
    (id: string) => (el: HTMLAnchorElement | null) => {
      if (el) {
        tabRefsMap.current.set(id, el);
      } else {
        tabRefsMap.current.delete(id);
      }
    },
    [],
  );

  // Auto-scroll to keep active tab visible
  useEffect(() => {
    const activeTab = dynamicTabs.find((tab) => tab.path === pathname);

    if (!activeTab) return;

    const tabElement = tabRefsMap.current.get(activeTab.id);

    if (tabElement) {
      tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [pathname, dynamicTabs]);

  return {
    dynamicTabs,
    isDynamicTabActive,
    isOnAnyDynamicTab,
    handleCloseDynamicTab,
    setTabRef,
  };
};
