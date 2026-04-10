'use client';

import { useEffect, useState } from 'react';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

/**
 * Hook to check if the current organization is included in an array-based feature flag.
 * Useful when a flag returns a list of allowed organization IDs rather than a boolean.
 *
 * @param flag - The feature flag key to evaluate
 * @returns {Object} An object containing isEnabled (whether current org is in the flag's org list) and isLoading states
 */
export const useOrgFeatureFlag = (flag: FEATURE_FLAGS) => {
  const { evaluate, ldClient } = useFeatureFlags();
  const organizationId = getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID) ?? '';
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ldClient) {
      evaluate(flag)
        .then((res: unknown) => {
          const allowedOrgs = Array.isArray(res) ? (res as string[]) : [];

          setIsEnabled(allowedOrgs.includes(organizationId));
        })
        .catch(() => {
          setIsEnabled(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [evaluate, ldClient, flag, organizationId]);

  return { isEnabled, isLoading };
};
