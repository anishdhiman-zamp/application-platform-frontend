import { FEATURE_FLAGS } from 'constants/featureFlags';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import { ENVIRONMENT, ENVIRONMENT_TYPES } from '@/constants/common.constants';

const IS_LD_DISABLED = ENVIRONMENT === ENVIRONMENT_TYPES.LOCAL || ENVIRONMENT === ENVIRONMENT_TYPES.DEVELOPMENT;

export const useFeatureFlags = () => {
  const ldClient = useLDClient();

  return {
    evaluate: async (flag: FEATURE_FLAGS) => {
      if (IS_LD_DISABLED) return true;

      try {
        return ldClient?.variation(flag, false);
      } catch (error) {
        console.error('Error evaluating feature flag', error);

        return false;
      }
    },
    ldClient: IS_LD_DISABLED || ldClient,
  };
};
