'use client';

import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useOrgFeatureFlag } from '@/hooks/useOrgFeatureFlag';
import { isMacsProduct } from '@/utils/cookie';

export const useIsPaceChatEnabled = () => {
  const { isEnabled, isLoading } = useOrgFeatureFlag(FEATURE_FLAGS.PACE_CHAT);
  const isMacs = isMacsProduct();

  return { isEnabled: isEnabled || isMacs, isLoading };
};
