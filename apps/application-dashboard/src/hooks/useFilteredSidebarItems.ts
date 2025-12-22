'use client';

import { useEffect, useMemo, useState } from 'react';
import { SIDEBAR_ITEMS } from '@/constants/sidebar.constants';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import type { NavigationItemSchema } from '@/types/config';

/**
 * Hook to filter sidebar items based on feature flags
 * @returns {Object} An object containing the filtered sidebar items and a loading state
 */
export const useFilteredSidebarItems = () => {
  const { evaluate, ldClient } = useFeatureFlags();
  const [featureFlagStates, setFeatureFlagStates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!ldClient) return;

    const evaluateFlags = async () => {
      const itemsWithFlags = SIDEBAR_ITEMS.filter((item) => item.featureFlag);
      const flagResults: Record<string, boolean> = {};

      await Promise.all(
        itemsWithFlags.map(async (item) => {
          if (item.featureFlag) {
            const isEnabled = await evaluate(item.featureFlag);

            flagResults[item.featureFlag] = Boolean(isEnabled);
          }
        }),
      );

      setFeatureFlagStates(flagResults);
      setIsLoading(false);
    };

    evaluateFlags();
  }, [evaluate, ldClient]);

  const filteredItems = useMemo<NavigationItemSchema[]>(() => {
    if (isLoading) {
      // While loading, show items without feature flags only
      return SIDEBAR_ITEMS.filter((item) => !item.featureFlag);
    }

    return SIDEBAR_ITEMS.filter((item) => {
      if (!item.featureFlag) return true;

      return featureFlagStates[item.featureFlag] === true;
    });
  }, [featureFlagStates, isLoading]);

  return { filteredItems, isLoading };
};
