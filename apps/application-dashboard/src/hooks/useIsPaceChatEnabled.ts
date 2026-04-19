'use client';

import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { isMacsProduct } from '@/utils/cookie';

export const useIsPaceChatEnabled = () => {
  const { isEnabled, isLoading } = useFeatureFlag(FEATURE_FLAGS.PACE_CHAT_V2);
  const isMacs = isMacsProduct();

  return { isEnabled: isEnabled || isMacs, isLoading };
};
