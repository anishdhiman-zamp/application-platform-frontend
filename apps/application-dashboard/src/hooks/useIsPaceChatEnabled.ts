'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from 'hooks/toolkit';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { RootState } from '@/store';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

/**
 * Hook to check if the pace-chat feature flag is enabled for the current organization
 * @returns {Object} An object containing isPaceChatEnabled and isLoading states
 */
export const useIsPaceChatEnabled = () => {
  const { evaluate, ldClient } = useFeatureFlags();
  const [isPaceChatEnabled, setIsPaceChatEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const orgIdFromRedux = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id ?? '');

  useEffect(() => {
    const orgIdFromLocalStorage = getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID) ?? '';
    const currentOrgId = orgIdFromLocalStorage || orgIdFromRedux;

    if (!ldClient || !currentOrgId) return;

    evaluate(FEATURE_FLAGS.PACE_CHAT)
      .then((res: string[]) => {
        const isEnabled = !res?.length || res.includes(currentOrgId);

        setIsPaceChatEnabled(isEnabled);
      })
      .catch(() => {
        setIsPaceChatEnabled(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [evaluate, ldClient, orgIdFromRedux]);

  return { isPaceChatEnabled, isLoading };
};
