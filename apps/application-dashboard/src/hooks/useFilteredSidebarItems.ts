'use client';

import { useMemo } from 'react';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { SIDEBAR_ITEMS } from '@/constants/sidebar.constants';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { NavigationItemSchema } from '@/types/config';
import { isMacsProduct } from '@/utils/cookie';

/**
 * Hook to filter sidebar items based on feature flags
 * @returns {Object} An object containing the filtered sidebar items and a loading state
 */
export const useFilteredSidebarItems = () => {
  const { isEnabled: isPaceChatEnabled, isLoading } = useFeatureFlag(FEATURE_FLAGS.PACE_CHAT_V2);
  const isMacs = isMacsProduct();

  const filteredItems = useMemo<NavigationItemSchema[]>(() => {
    if (isLoading) {
      return SIDEBAR_ITEMS.filter((item) => !item.featureFlag);
    }

    return SIDEBAR_ITEMS.filter((item) => {
      if (!item.featureFlag) return true;

      if (item.featureFlag === FEATURE_FLAGS.PACE_CHAT_V2) {
        return isPaceChatEnabled || isMacs;
      }

      return true;
    });
  }, [isPaceChatEnabled, isLoading]);

  return { filteredItems, isLoading };
};
