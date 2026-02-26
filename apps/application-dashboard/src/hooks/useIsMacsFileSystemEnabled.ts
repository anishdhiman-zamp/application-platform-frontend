'use client';

import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

/**
 * Hook to check if the macs-file-system feature flag is enabled
 * @returns {Object} An object containing isMacsFileSystemEnabled and isLoading states
 */
export const useIsMacsFileSystemEnabled = () => {
  const { isEnabled, isLoading } = useFeatureFlag(FEATURE_FLAGS.MACS_FILE_SYSTEM);

  return { isMacsFileSystemEnabled: isEnabled, isLoading };
};
