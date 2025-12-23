'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { SIDEBAR_ITEMS } from '@/constants/sidebar.constants';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import type { NavigationItemSchema } from '@/types/config';

/**
 * Evaluate feature flags for a list of items
 * @param items - The list of items to evaluate
 * @param evaluate - The function to evaluate the feature flags
 * @returns A record of feature flag states
 */
const evaluateFlags = async (
  items: NavigationItemSchema[],
  evaluate: (flag: FEATURE_FLAGS) => Promise<boolean>,
): Promise<Record<string, boolean>> => {
  const itemsWithFlags = items.filter((item) => item.featureFlag);
  const flagResults: Record<string, boolean> = {};

  await Promise.all(
    itemsWithFlags.map(async (item) => {
      if (item.featureFlag) {
        const isEnabled = await evaluate(item.featureFlag);

        flagResults[item.featureFlag] = Boolean(isEnabled);
      }
    }),
  );

  return flagResults;
};

/**
 * Hook to filter sidebar items based on feature flags
 * @returns {Object} An object containing the filtered sidebar items and a loading state
 */
export const useFilteredSidebarItems = () => {
  const { evaluate, ldClient } = useFeatureFlags();
  const [featureFlagStates, setFeatureFlagStates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    const flagResults = await evaluateFlags(SIDEBAR_ITEMS, evaluate);

    console.log(flagResults);

    setFeatureFlagStates(flagResults);
    setIsLoading(false);
  }, [evaluate]);

  useEffect(() => {
    if (!ldClient) return;

    fetchFlags();
  }, [ldClient]);

  const filteredItems = useMemo<NavigationItemSchema[]>(() => {
    if (isLoading) {
      return SIDEBAR_ITEMS.filter((item) => !item.featureFlag);
    }

    return SIDEBAR_ITEMS.filter((item) => {
      if (!item.featureFlag) return true;

      return featureFlagStates[item.featureFlag] === true;
    });
  }, [featureFlagStates, isLoading]);

  return { filteredItems, isLoading };
};
