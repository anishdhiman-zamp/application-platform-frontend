'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import type { RootState } from '@/store';

/**
 * Hook to check if the pace-chat feature flag is enabled for the current organization
 * @returns {Object} An object containing isPaceChatEnabled and isLoading states
 */
export const useIsPaceChatEnabled = () => {
  const { evaluate, ldClient } = useFeatureFlags();
  const [isPaceChatEnabled, setIsPaceChatEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentOrgId = useSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id ?? '');

  useEffect(() => {
    if (ldClient) {
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
    }
  }, [evaluate, ldClient, currentOrgId]);

  return { isPaceChatEnabled, isLoading };
};
