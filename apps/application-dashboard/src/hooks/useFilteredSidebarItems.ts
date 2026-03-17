'use client';

import { useMemo } from 'react';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { SIDEBAR_ITEMS } from '@/constants/sidebar.constants';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import type { NavigationItemSchema } from '@/types/config';

/**
 * Hook to filter sidebar items based on feature flags
 * @returns {Object} An object containing the filtered sidebar items and a loading state
 */
export const useFilteredSidebarItems = () => {
  const { isEnabled: isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();

  const filteredItems = useMemo<NavigationItemSchema[]>(() => {
    if (isLoading) {
      return SIDEBAR_ITEMS.filter((item) => !item.featureFlag);
    }

    return SIDEBAR_ITEMS.filter((item) => {
      if (!item.featureFlag) return true;

      if (item.featureFlag === FEATURE_FLAGS.PACE_CHAT) {
        return isPaceChatEnabled;
      }

      return true;
    });
  }, [isPaceChatEnabled, isLoading]);

  return { filteredItems, isLoading };
};
