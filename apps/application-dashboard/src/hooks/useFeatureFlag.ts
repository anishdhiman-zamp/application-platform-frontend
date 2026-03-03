'use client';

import { useEffect, useState } from 'react';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

/**
 * Generic hook to check if a feature flag is enabled
 * @param flag - The feature flag to check
 * @returns {Object} An object containing isEnabled and isLoading states
 */
export const useFeatureFlag = (flag: FEATURE_FLAGS) => {
  const { evaluate, ldClient } = useFeatureFlags();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ldClient) {
      evaluate(flag)
        .then((res: boolean) => {
          setIsEnabled(res);
        })
        .catch(() => {
          setIsEnabled(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // Keep isLoading true while waiting for ldClient to be available
  }, [evaluate, ldClient, flag]);

  return { isEnabled, isLoading };
};
