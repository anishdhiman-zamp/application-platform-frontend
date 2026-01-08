'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { SIDEBAR_ITEMS } from '@/constants/sidebar.constants';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { RootState } from '@/store';
import type { NavigationItemSchema } from '@/types/config';

/**
 * Hook to filter sidebar items based on feature flags
 * @returns {Object} An object containing the filtered sidebar items and a loading state
 */
export const useFilteredSidebarItems = () => {
  const { evaluate, ldClient } = useFeatureFlags();
  const [isPaceChatEnabled, setIsPaceChatEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentOrgId = useSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id ?? '');

  useEffect(() => {
    if (ldClient) {
      evaluate(FEATURE_FLAGS.PACE_CHAT)
        .then((res: string[]) => {
          setIsPaceChatEnabled(Boolean(res?.length && res.includes(currentOrgId)));
        })
        .catch(() => {
          setIsPaceChatEnabled(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [evaluate, ldClient, currentOrgId]);

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
